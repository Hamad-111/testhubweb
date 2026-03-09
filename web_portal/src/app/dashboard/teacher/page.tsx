"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function TeacherDashboard() {
    const { user, loading } = useAuth();
    const [stats, setStats] = useState({
        totalQuizzes: 0,
        activeSessions: 0,
        totalStudents: 0,
        avgScore: 0,
    });
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [recentStudents, setRecentStudents] = useState<any[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            if (user) {
                try {
                    const quizzesQuery = query(collection(db, "quizzes"), where("instructorId", "==", user.uid));
                    const quizzesSnapshot = await getDocs(quizzesQuery);
                    const totalQuizzes = quizzesSnapshot.size;

                    const fetchedQuizzes: any[] = [];
                    let activeSessions = 0;
                    quizzesSnapshot.forEach(doc => {
                        fetchedQuizzes.push({ ...doc.data(), id: doc.id });
                        if (doc.data().isPublished) activeSessions++;
                    });
                    setQuizzes(fetchedQuizzes);

                    const resultsQuery = query(collection(db, "quiz_results"), where("instructorId", "==", user.uid));
                    const resultsSnapshot = await getDocs(resultsQuery);

                    const uniqueStudents = new Set();
                    let totalScore = 0;

                    resultsSnapshot.forEach(doc => {
                        const data = doc.data();
                        uniqueStudents.add(data.studentId);
                        totalScore += (data.percentageScore || 0);
                    });

                    setStats({
                        totalQuizzes,
                        activeSessions,
                        totalStudents: uniqueStudents.size,
                        avgScore: resultsSnapshot.size > 0 ? Math.round(totalScore / resultsSnapshot.size) : 0,
                    });

                    // Fetch actual registered students for the summary
                    const studentsQuery = query(
                        collection(db, "users"),
                        where("role", "==", "student"),
                        orderBy("createdAt", "desc"),
                        limit(5)
                    );
                    const studentsSnapshot = await getDocs(studentsQuery);
                    const studentsList: any[] = [];
                    studentsSnapshot.forEach(doc => {
                        studentsList.push({ id: doc.id, ...doc.data() });
                    });
                    setRecentStudents(studentsList);

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

    const handleTogglePublish = async (quizId: string, currentStatus: boolean) => {
        try {
            const quizRef = doc(db, "quizzes", quizId);
            await updateDoc(quizRef, {
                isPublished: !currentStatus
            });
            // Update local state
            setQuizzes(quizzes.map(q => q.id === quizId ? { ...q, isPublished: !currentStatus } : q));
            // Update stats
            setStats(prev => ({
                ...prev,
                activeSessions: currentStatus ? prev.activeSessions - 1 : prev.activeSessions + 1
            }));
        } catch (error) {
            console.error("Error toggling publish status:", error);
            alert("Failed to update quiz status.");
        }
    };

    const handleDelete = async (quizId: string) => {
        if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) return;

        try {
            await deleteDoc(doc(db, "quizzes", quizId));
            // Update local state
            const deletedQuiz = quizzes.find(q => q.id === quizId);
            setQuizzes(quizzes.filter(q => q.id !== quizId));
            setStats(prev => ({
                ...prev,
                totalQuizzes: prev.totalQuizzes - 1,
                activeSessions: deletedQuiz?.isPublished ? prev.activeSessions - 1 : prev.activeSessions
            }));
        } catch (error) {
            console.error("Error deleting quiz:", error);
            alert("Failed to delete quiz.");
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm("⚠️ WARNING: Are you sure you want to delete ALL your quizzes? This action CANNOT be undone.")) return;

        try {
            // Iterate over all currently loaded quizzes and delete their documents
            for (const quiz of quizzes) {
                await deleteDoc(doc(db, "quizzes", quiz.id));
            }

            // Clear local state
            setQuizzes([]);
            setStats(prev => ({
                ...prev,
                totalQuizzes: 0,
                activeSessions: 0
            }));
        } catch (error: any) {
            console.error("Error deleting all quizzes:", error);
            alert(`Failed to delete all quizzes. Error: ${error?.message || error}`);
        }
    };

    const handleStopAllLive = async () => {
        if (!confirm("Are you sure you want to stop all active live quiz sessions?")) return;

        try {
            // Filter out quizzes that are currently published
            const activeQuizzes = quizzes.filter(q => q.isPublished);

            for (const quiz of activeQuizzes) {
                const quizRef = doc(db, "quizzes", quiz.id);
                await updateDoc(quizRef, {
                    isPublished: false
                });
            }

            // Update local state
            setQuizzes(quizzes.map(q => ({ ...q, isPublished: false })));
            setStats(prev => ({
                ...prev,
                activeSessions: 0
            }));
        } catch (error: any) {
            console.error("Error stopping live quizzes:", error);
            alert(`Failed to stop all live quizzes. Error: ${error?.message || error}`);
        }
    };

    if (loading || loadingStats) return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Loading...</div>;
    if (!user) return <div>Access Denied</div>;

    return (
        <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
            <Sidebar role="instructor" userName={user.displayName || "Teacher"} />

            <main className="flex-1 md:ml-72 p-6 md:p-12 w-full animate-fade-in">
                {/* Top Bar - Modern & Clean */}
                <div className="flex justify-between items-center mb-12 animate-slide-up">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Instructor Hub</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage your curriculum and track student engagement.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/dashboard/teacher/create">
                            <button className="px-8 py-3 premium-gradient text-white rounded-2xl font-black text-sm shadow-[0_10px_30px_rgba(70,23,143,0.3)] hover:shadow-[0_15px_40px_rgba(70,23,143,0.4)] hover:-translate-y-1 transition-all uppercase tracking-widest active:scale-95 flex items-center gap-2">
                                <span className="text-xl">+</span> Create Quiz
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="animate-slide-up [animation-delay:100ms]">
                        <StatCard
                            title="Total Content"
                            value={stats.totalQuizzes}
                            icon="📝"
                            color="#46178f"
                        />
                    </div>
                    <div className="animate-slide-up [animation-delay:200ms]">
                        <StatCard
                            title="Live Sessions"
                            value={stats.activeSessions}
                            icon="🟢"
                            color="#26890c"
                        />
                    </div>
                    <div className="animate-slide-up [animation-delay:300ms]">
                        <StatCard
                            title="Total Learners"
                            value={stats.totalStudents}
                            icon="👥"
                            color="#1368ce"
                        />
                    </div>
                    <div className="animate-slide-up [animation-delay:400ms]">
                        <StatCard
                            title="Avg Engagement"
                            value={`${stats.avgScore}%`}
                            icon="📈"
                            color="#ffa602"
                        />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* My Quizzes - Glass Card */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-premium p-10 border border-white animate-slide-up [animation-delay:500ms]">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <div className="w-2 h-8 bg-primary rounded-full" />
                                My Quizzes
                            </h2>
                            <div className="flex gap-3">
                                {stats.activeSessions > 0 && (
                                    <button
                                        onClick={handleStopAllLive}
                                        className="px-4 py-2 text-[10px] font-black text-white bg-slate-900 rounded-xl hover:bg-orange-600 transition-all uppercase tracking-widest shadow-lg flex items-center gap-2"
                                    >
                                        🛑 Stop All
                                    </button>
                                )}
                                {quizzes.length > 0 && (
                                    <button
                                        onClick={handleDeleteAll}
                                        className="px-4 py-2 text-[10px] font-black text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all uppercase tracking-widest flex items-center gap-2"
                                    >
                                        🗑️ Clear All
                                    </button>
                                )}
                            </div>
                        </div>

                        {quizzes.length === 0 ? (
                            <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-16 text-center group hover:border-primary/50 transition-all duration-500">
                                <div className="text-6xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110 animate-float">📝</div>
                                <h3 className="font-black text-xl text-slate-800 tracking-tight mb-2">No content yet</h3>
                                <p className="text-slate-500 font-medium mb-8">Launch your first educational quiz to see insights here.</p>
                                <Link href="/dashboard/teacher/create">
                                    <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-primary transition-all active:scale-95 inline-block">
                                        Craft a Quiz
                                    </button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {quizzes.map((quiz) => (
                                    <div key={quiz.id} className="flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-50 border border-transparent rounded-3xl hover:bg-white hover:border-slate-100 hover:shadow-premium transition-all duration-500 group">
                                        <div className="flex items-center gap-5 w-full sm:w-auto mb-4 sm:mb-0">
                                            <div className="w-14 h-14 rounded-2xl bg-white shadow-inner flex items-center justify-center text-2xl group-hover:rotate-6 transition-transform">
                                                📚
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900 text-lg tracking-tight group-hover:text-primary transition-colors">{quiz.title}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{quiz.questions?.length || 0} Questions</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <span className={`text-[10px] font-black uppercase tracking-wider ${quiz.isPublished ? 'text-green-500' : 'text-slate-400'}`}>
                                                        {quiz.isPublished ? 'Live Now' : 'Draft Mode'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 w-full sm:w-auto items-center">
                                            <button
                                                onClick={() => handleTogglePublish(quiz.id, quiz.isPublished)}
                                                className={`flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${quiz.isPublished
                                                    ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                                                    : "bg-green-50 text-green-600 hover:bg-green-100"
                                                    }`}
                                            >
                                                {quiz.isPublished ? "Stop Session" : "Launch Quiz"}
                                            </button>
                                            <Link href={`/dashboard/teacher/quizzes/${quiz.id}`} className="flex-1 sm:flex-none">
                                                <button className="w-full px-6 py-2.5 text-[10px] font-black uppercase tracking-wider text-primary bg-white border border-slate-100 shadow-sm rounded-xl hover:bg-primary hover:text-white transition-all">
                                                    Edit Gear
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(quiz.id)}
                                                className="w-11 h-11 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-xl border border-transparent hover:border-red-100"
                                                title="Delete Quiz"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-8 animate-slide-up [animation-delay:600ms]">
                        {/* Registered Students Summary */}
                        <div className="bg-white rounded-[2.5rem] shadow-premium p-8 border border-white group">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                                    Learners
                                </h2>
                                <Link href="/dashboard/teacher/students">
                                    <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">
                                        Directory →
                                    </button>
                                </Link>
                            </div>

                            {recentStudents.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                    <div className="text-4xl mb-4 grayscale opacity-50">👥</div>
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Awaiting intake</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {recentStudents.map((student) => {
                                        const name = student.displayName || student.name || "Anonymous";
                                        return (
                                            <div key={student.id} className="flex items-center justify-between p-4 bg-slate-50 border border-transparent rounded-2xl hover:bg-white hover:border-slate-100 hover:shadow-premium transition-all duration-500 group/item">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 rounded-xl bg-white shadow-inner text-primary flex items-center justify-center font-black text-sm group-hover/item:scale-110 transition-transform">
                                                        {name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <h4 className="text-sm font-black text-slate-900 truncate group-hover/item:text-primary transition-colors">{name}</h4>
                                                        <p className="text-[10px] text-slate-400 font-bold tracking-tight truncate">{student.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <div className="mt-8 pt-6 border-t border-slate-50 text-center uppercase tracking-[0.2em] font-black text-[9px] text-slate-300">
                                RECENT ENROLLMENTS
                            </div>
                        </div>

                        {/* News / Updates */}
                        <div className="bg-white rounded-[2.5rem] shadow-premium p-8 border border-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />

                            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6 relative z-10 flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-accent rounded-full" />
                                Innovations
                            </h2>
                            <div className="space-y-4 relative z-10">
                                <div className="p-5 bg-gradient-to-br from-purple-50 to-white rounded-3xl border border-purple-100 group cursor-pointer hover:border-primary/30 transition-all">
                                    <span className="inline-block px-3 py-1 rounded-lg text-[9px] font-black bg-primary text-white uppercase mb-3 tracking-widest">New System</span>
                                    <h3 className="font-black text-slate-900 text-sm tracking-tight mb-1">AI Question Engine</h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Automated assessment generation is now active. Scale your curriculum instantly.</p>
                                </div>
                                <div className="p-5 bg-gradient-to-br from-green-50 to-white rounded-3xl border border-green-100 group cursor-pointer hover:border-green-300 transition-all">
                                    <span className="inline-block px-3 py-1 rounded-lg text-[9px] font-black bg-green-600 text-white uppercase mb-3 tracking-widest">Insight</span>
                                    <h3 className="font-black text-slate-900 text-sm tracking-tight mb-1">Team Mechanics</h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Collaboration is key. Enable Team Mode in your next live session.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
