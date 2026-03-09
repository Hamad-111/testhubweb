"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import Link from "next/link";
import { collection, query, where, getDocs, doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Users, X, ShieldCheck, Rocket, CheckCircle2, Copy, Search, GraduationCap } from "lucide-react";

export default function StudentDashboard() {
    const { user, loading } = useAuth();
    const [stats, setStats] = useState({
        quizzesTaken: 0,
        avgScore: 0,
        weakTopics: 0,
        rank: 0,
    });
    const [loadingStats, setLoadingStats] = useState(true);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [classCode, setClassCode] = useState("");
    const [isJoining, setIsJoining] = useState(false);
    const [currentClass, setCurrentClass] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            const fetchUserProfile = async () => {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        setCurrentClass(userDoc.data().schoolCode || null);
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
            };
            fetchUserProfile();
        }
    }, [user]);

    useEffect(() => {
        async function fetchStats() {
            if (user) {
                try {
                    const q = query(collection(db, "quiz_results"), where("studentId", "==", user.uid));
                    const querySnapshot = await getDocs(q);

                    let totalScore = 0;
                    let weakCount = 0;
                    const count = querySnapshot.size;

                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        const score = data.percentageScore || 0;
                        totalScore += score;
                        if (score < 60) weakCount++;
                    });

                    setStats({
                        quizzesTaken: count,
                        avgScore: count > 0 ? Math.round(totalScore / count) : 0,
                        weakTopics: weakCount,
                        rank: 0,
                    });
                } catch (error) {
                    console.error("Error fetching stats:", error);
                } finally {
                    setLoadingStats(false);
                }
            }
        }

        if (!loading) {
            if (user) {
                fetchStats();
            } else {
                setLoadingStats(false);
            }
        }
    }, [user, loading]);

    if (loading || loadingStats) return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Loading...</div>;
    if (!user) return <div>Access Denied</div>;

    return (
        <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
            <Sidebar
                role="student"
                userName={user.displayName || "Student"}
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="flex-1 md:ml-72 p-6 md:p-12 w-full animate-fade-in">
                {/* Mobile Header - Sleek Glass */}
                <div className="md:hidden flex items-center justify-between mb-8 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-premium">
                    <button onClick={() => setSidebarOpen(true)} className="text-primary p-2 hover:bg-primary/5 rounded-xl transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                    <span className="font-black text-xl tracking-tighter text-gradient">TEST HUB</span>
                    <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center text-white font-black text-md shadow-lg">
                        {user.displayName?.charAt(0).toUpperCase() || "S"}
                    </div>
                </div>

                {/* Top Bar (Desktop) */}
                <div className="hidden md:flex justify-between items-center mb-12 animate-slide-up">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Dashboard</h1>
                        <p className="text-slate-500 font-medium mt-1">Monitor your academic progress and insights.</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsJoinModalOpen(true)}
                            className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm shadow-sm hover:text-primary hover:border-primary/20 transition-all flex items-center gap-2 uppercase tracking-widest active:scale-95"
                        >
                            <Users size={18} /> Join Ensemble
                        </button>
                        <Link href="/join" className="px-8 py-3 premium-gradient text-white rounded-2xl font-black text-sm shadow-[0_10px_30px_rgba(70,23,143,0.3)] hover:shadow-[0_15px_40px_rgba(70,23,143,0.4)] hover:-translate-y-1 transition-all uppercase tracking-widest active:scale-95">
                            🎮 Join Game
                        </Link>
                    </div>
                </div>

                {/* Mobile Join Button */}
                <div className="md:hidden mb-10 animate-slide-up [animation-delay:100ms]">
                    <Link href="/join" className="w-full py-5 premium-gradient text-white rounded-[2rem] font-black text-lg flex justify-center items-center shadow-premium active:scale-95 transition-all">
                        <span className="tracking-widest uppercase">🎮 Join Game</span>
                    </Link>
                </div>

                {/* Hero Banner - Modern Glass Card */}
                <div className="bg-white rounded-[2.5rem] shadow-premium p-10 mb-12 flex items-center justify-between border border-white relative overflow-hidden group animate-slide-up [animation-delay:200ms]">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-50 rounded-full blur-3xl group-hover:bg-purple-100 transition-colors duration-700" />

                    <div className="relative z-10">
                        <span className="text-[10px] font-black tracking-[0.3em] text-purple-600 uppercase mb-4 block">Personal Growth</span>
                        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Welcome back, <span className="text-gradient">{user.displayName}</span>!</h2>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">
                            {currentClass ? `Enrolled in Ensemble: ${currentClass}` : "Ready to elevate your knowledge today?"}
                        </p>
                    </div>
                    <div className="hidden lg:block relative z-10 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-5xl shadow-inner-lg">🎓</div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="animate-slide-up [animation-delay:300ms]">
                        <StatCard
                            title="Quizzes Played"
                            value={stats.quizzesTaken}
                            icon="🎮"
                            color="#46178f"
                        />
                    </div>
                    <div className="animate-slide-up [animation-delay:400ms]">
                        <StatCard
                            title="Avg Score"
                            value={`${stats.avgScore}%`}
                            icon="⭐"
                            color="#ffa602"
                        />
                    </div>
                    <div className="animate-slide-up [animation-delay:500ms]">
                        <StatCard
                            title="Needs Practice"
                            value={stats.weakTopics}
                            icon="💪"
                            color="#e21b3c"
                        />
                    </div>
                    <div className="animate-slide-up [animation-delay:600ms]">
                        <StatCard
                            title="Global Rank"
                            value={stats.rank > 0 ? `#${stats.rank}` : "N/A"}
                            icon="🏆"
                            color="#1368ce"
                        />
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="animate-slide-up [animation-delay:700ms]">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="w-2 h-8 bg-primary rounded-full" />
                            Activity Stream
                        </h2>
                        <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Clear History</button>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-dashed border-slate-200 p-16 text-center group hover:border-primary/50 transition-all duration-500">
                        <div className="text-7xl mb-8 grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110 animate-float">🚀</div>
                        <h3 className="font-black text-2xl text-slate-800 tracking-tight mb-3">Your stream is silent</h3>
                        <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed italic">Engage in games to populate your performance metrics and activity history.</p>
                        <Link href="/join" className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-primary transition-all active:scale-95 inline-block">
                            Launch A Game
                        </Link>
                    </div>
                </div>
            </main>

            {/* Join Ensemble Modal */}
            {isJoinModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in">
                    <div className="bg-white rounded-[3rem] w-full max-w-xl p-12 shadow-2xl animate-scale-up border border-white">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Join Ensemble</h2>
                                <p className="text-slate-400 uppercase text-[10px] font-black tracking-[0.3em]">Enter your class access protocol</p>
                            </div>
                            <button
                                onClick={() => setIsJoinModalOpen(false)}
                                title="Close modal"
                                className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Access Code</label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        autoFocus
                                        className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-[1.5rem] outline-none transition-all font-black text-slate-900 placeholder:text-slate-200 uppercase tracking-[0.2em] text-center"
                                        placeholder="X8J2K9"
                                        value={classCode}
                                        onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                                        maxLength={6}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100 flex items-start gap-4">
                                <GraduationCap size={20} className="text-purple-600 mt-1" />
                                <p className="text-xs font-bold text-purple-700 leading-relaxed italic">
                                    Joining an ensemble gives you access to specialized assessments and personalized study modules from your instructor.
                                </p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsJoinModalOpen(false)}
                                    className="flex-1 py-5 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!classCode.trim() || !user) return;
                                        setIsJoining(true);
                                        try {
                                            // Check if class exists
                                            const q = query(collection(db, "classes"), where("classCode", "==", classCode));
                                            const querySnapshot = await getDocs(q);

                                            if (querySnapshot.empty) {
                                                alert("Invalid access protocol. Please verify the code with your instructor.");
                                                setIsJoining(false);
                                                return;
                                            }

                                            const classDoc = querySnapshot.docs[0];
                                            const classData = classDoc.data();

                                            // Update student's schoolCode
                                            await updateDoc(doc(db, "users", user.uid), {
                                                schoolCode: classCode,
                                                updatedAt: serverTimestamp()
                                            });

                                            // Update class studentCount
                                            // Note: In a production app, this would be better handled by a cloud function or a count sync
                                            // but for now we'll do it on join.
                                            await updateDoc(classDoc.ref, {
                                                studentCount: (classData.studentCount || 0) + 1
                                            });

                                            setCurrentClass(classCode);
                                            setIsJoinModalOpen(false);
                                            alert(`Successfully enrolled in ${classData.name}!`);
                                        } catch (error: any) {
                                            console.error("Error joining ensemble:", error);
                                            alert("Failed to join: " + error.message);
                                        } finally {
                                            setIsJoining(false);
                                        }
                                    }}
                                    disabled={isJoining || classCode.length !== 6}
                                    className="flex-[2] py-5 premium-gradient text-white font-black rounded-[1.4rem] shadow-2xl hover:shadow-[0_15px_40px_rgba(70,23,143,0.4)] transform hover:-translate-y-1 transition-all disabled:opacity-50 text-xs uppercase tracking-widest flex items-center justify-center gap-3"
                                >
                                    {isJoining ? "Syncing..." : <><Rocket size={18} /> Join Ensemble</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
