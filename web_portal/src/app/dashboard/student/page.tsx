"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import Link from "next/link";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
        <div className="flex min-h-screen bg-[#f2f2f2]">
            <Sidebar
                role="student"
                userName={user.displayName || "Student"}
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="flex-1 md:ml-64 p-4 md:p-8 w-full">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm">
                    <button onClick={() => setSidebarOpen(true)} className="text-[#46178f]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                    <span className="font-black text-xl text-[#46178f]">Test Hub</span>
                    <div className="w-8 h-8 rounded bg-[#1368ce] flex items-center justify-center text-white font-bold text-sm">
                        {user.displayName?.charAt(0).toUpperCase() || "S"}
                    </div>
                </div>

                {/* Top Bar (Desktop) */}
                <div className="hidden md:flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-black text-[#333]">Home</h1>
                    <Link href="/join" className="btn btn-primary text-sm">Join Game</Link>
                </div>

                {/* Mobile Join Button (Visible in main flow for easy access) */}
                <div className="md:hidden mb-6">
                    <Link href="/join" className="w-full btn btn-primary text-lg py-4 flex justify-center items-center shadow-lg">
                        <span>🎮 Join Game</span>
                    </Link>
                </div>

                {/* Hero Banner */}
                <div className="bg-white rounded shadow-card p-6 mb-8 flex items-center justify-between border-l-8 border-[#46178f]">
                    <div>
                        <h2 className="text-xl font-bold mb-2">Welcome back, {user.displayName}!</h2>
                        <p className="text-gray-600">Ready to play a game?</p>
                    </div>
                    <div className="hidden md:block text-4xl">🎓</div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
                    <StatCard
                        title="Quizzes Played"
                        value={stats.quizzesTaken}
                        icon="🎮"
                        color="#46178f"
                    />
                    <StatCard
                        title="Avg Score"
                        value={`${stats.avgScore}%`}
                        icon="⭐"
                        color="#ffa602"
                    />
                    <StatCard
                        title="Needs Practice"
                        value={stats.weakTopics}
                        icon="💪"
                        color="#e21b3c"
                    />
                    <StatCard
                        title="Rank"
                        value={stats.rank > 0 ? `#${stats.rank}` : "-"}
                        icon="🏆"
                        color="#1368ce"
                    />
                </div>

                {/* Recent Activity Section */}
                <h2 className="text-lg font-bold mb-4 text-[#333]">Recent Activity</h2>
                <div className="bg-white rounded shadow-card p-8 text-center">
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className="font-bold text-lg mb-2">No recent games</h3>
                    <p className="text-gray-500 mb-6">Join a game to see your stats here!</p>
                    <button className="btn btn-blue">Discover Kahoots</button>
                </div>
            </main>
        </div>
    );
}
