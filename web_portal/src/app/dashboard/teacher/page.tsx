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
        <div className="flex min-h-screen bg-[#f2f2f2]">
            <Sidebar role="instructor" userName={user.displayName || "Teacher"} />

            <main className="flex-1 ml-64 p-8">
                {/* Top Bar */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#333]">Dashboard</h1>
                        <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.displayName || "Instructor"}!</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/dashboard/teacher/create">
                            <button className="px-6 py-2 bg-[#46178f] text-white rounded font-bold hover:bg-[#3c147a] transition-colors shadow-md text-sm flex items-center gap-2">
                                <span>+</span> Create Quiz
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="Total Quizzes"
                        value={stats.totalQuizzes}
                        icon="📝"
                        color="#46178f"
                    />
                    <StatCard
                        title="Active Games"
                        value={stats.activeSessions}
                        icon="🟢"
                        color="#26890c"
                    />
                    <StatCard
                        title="Players"
                        value={stats.totalStudents}
                        icon="👥"
                        color="#1368ce"
                    />
                    <StatCard
                        title="Performance"
                        value={`${stats.avgScore}%`}
                        icon="📈"
                        color="#ffa602"
                    />
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* My Quizzes */}
                    <div className="lg:col-span-2 bg-white rounded shadow-card p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-lg">My Quizzes</h2>
                            <div className="flex gap-2">
                                {stats.activeSessions > 0 && (
                                    <button
                                        onClick={handleStopAllLive}
                                        className="px-3 py-1.5 text-xs font-bold text-white bg-orange-500 rounded hover:bg-orange-600 transition-colors shadow-sm flex items-center gap-1"
                                    >
                                        🛑 Stop All Live
                                    </button>
                                )}
                                {quizzes.length > 0 && (
                                    <button
                                        onClick={handleDeleteAll}
                                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded hover:bg-red-600 transition-colors shadow-sm flex items-center gap-1"
                                    >
                                        🗑️ Delete All
                                    </button>
                                )}
                            </div>
                        </div>

                        {quizzes.length === 0 ? (
                            <div className="border-2 border-dashed border-gray-200 rounded p-8 text-center">
                                <div className="text-4xl mb-2">📝</div>
                                <p className="text-gray-500 font-medium">No quizzes yet</p>
                                <p className="text-sm text-gray-400">Create your first quiz to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {quizzes.map((quiz) => (
                                    <div key={quiz.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-purple-200 hover:bg-purple-50 transition-colors">
                                        <div>
                                            <h3 className="font-bold text-[#333]">{quiz.title}</h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {quiz.questions?.length || 0} questions • {quiz.isPublished ? 'Published' : 'Draft'}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleTogglePublish(quiz.id, quiz.isPublished)}
                                                className={`px-4 py-2 text-xs font-bold rounded transition-colors ${quiz.isPublished
                                                    ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                                                    : "bg-green-100 text-green-600 hover:bg-green-200"
                                                    }`}
                                            >
                                                {quiz.isPublished ? "Stop" : "Publish"}
                                            </button>
                                            <Link href={`/dashboard/teacher/quizzes/${quiz.id}`}>
                                                <button className="px-4 py-2 text-xs font-bold text-[#46178f] bg-purple-100 rounded hover:bg-purple-200 transition-colors">
                                                    Edit
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(quiz.id)}
                                                className="px-4 py-2 text-xs font-bold text-red-600 bg-red-100 rounded hover:bg-red-200 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Registered Students Summary */}
                        <div className="bg-white rounded shadow-card p-6 border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="font-bold text-lg text-[#333]">Students</h2>
                                <Link href="/dashboard/teacher/students">
                                    <button className="text-xs font-bold text-[#46178f] hover:underline uppercase tracking-wider">
                                        View All →
                                    </button>
                                </Link>
                            </div>

                            {recentStudents.length === 0 ? (
                                <div className="text-center py-8 opacity-50">
                                    <p className="text-sm font-bold text-gray-400">No students registered yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentStudents.map((student) => {
                                        const name = student.displayName || student.name || "Anonymous";
                                        return (
                                            <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-purple-200 transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 text-[#46178f] flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform">
                                                        {name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <h4 className="text-sm font-bold text-[#333] truncate">{name}</h4>
                                                        <p className="text-[10px] text-gray-500 font-medium truncate">{student.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <div className="mt-4 pt-4 border-t border-gray-50">
                                <p className="text-[10px] text-gray-400 font-medium text-center italic">Recently joined students</p>
                            </div>
                        </div>

                        {/* News / Updates */}
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                            <h2 className="font-bold text-lg mb-4 text-[#333]">What's New</h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#46178f] text-white uppercase mb-2">New Feature</span>
                                    <h3 className="font-bold text-sm text-[#333]">AI Question Generator</h3>
                                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">Create quizzes in seconds with our new AI-powered tool. Just enter a topic!</p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#26890c] text-white uppercase mb-2">Tip</span>
                                    <h3 className="font-bold text-sm text-[#333]">Engage your students</h3>
                                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">Try the new team mode to foster collaboration in your classroom.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
