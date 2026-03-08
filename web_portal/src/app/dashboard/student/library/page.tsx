"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function StudentLibraryPage() {
    const { user, loading } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const fetchPlayHistory = async () => {
        if (!user) return;
        setFetching(true);
        try {
            // Fetch quiz results for this student
            const q = query(
                collection(db, "quiz_results"),
                where("studentId", "==", user.uid),
                orderBy("completedAt", "desc"),
                limit(50)
            );
            const querySnapshot = await getDocs(q);

            const fetchedHistory: any[] = [];
            querySnapshot.forEach((doc) => {
                fetchedHistory.push({ ...doc.data(), id: doc.id });
            });
            setHistory(fetchedHistory);
        } catch (error) {
            console.error("Error fetching student library:", error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (!loading && user) {
            fetchPlayHistory();
        }
    }, [user, loading]);

    if (loading || (fetching && history.length === 0 && user)) {
        return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Loading...</div>;
    }

    return (
        <div className="flex min-h-screen bg-[#f2f2f2]">
            <Sidebar
                role="student"
                userName={user?.displayName || "Student"}
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="flex-1 md:ml-64 p-4 md:p-8">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-[#46178f]"
                        title="Open Menu"
                        aria-label="Open Menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                    <span className="font-black text-xl text-[#46178f]">My Library</span>
                    <div className="w-8 h-8 rounded bg-[#1368ce] flex items-center justify-center text-white font-bold text-sm">
                        {user?.displayName?.charAt(0).toUpperCase() || "S"}
                    </div>
                </div>

                <div className="max-w-6xl mx-auto">
                    <div className="hidden md:block mb-8">
                        <h1 className="text-3xl font-black text-[#333]">My Library</h1>
                        <p className="text-gray-500 text-sm mt-1">Quizzes you've participated in and your top scores</p>
                    </div>

                    {history.length === 0 ? (
                        <div className="bg-white rounded-3xl p-16 text-center border-l-8 border-[#1368ce] shadow-sm">
                            <span className="text-7xl mb-6 block">📚</span>
                            <h2 className="text-2xl font-black text-[#333] mb-4">Your library is empty</h2>
                            <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">You haven't played any quizzes yet. Start your journey by joining a live game or exploring public quizzes!</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/join" className="btn btn-primary px-10">Join a Game</Link>
                                <Link href="/dashboard/student/discover" className="btn btn-blue px-10">Discover Quizzes</Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {history.map((item) => (
                                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col group">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                                📝
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.percentageScore >= 80 ? 'bg-green-100 text-green-600' : item.percentageScore >= 50 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                                                {item.percentageScore}% Score
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-[#333] mb-2 line-clamp-1">{item.quizTitle || "Untitled Quiz"}</h3>
                                        <p className="text-xs text-gray-400 font-medium mb-4">Played on {new Date(item.completedAt?.seconds * 1000).toLocaleDateString()}</p>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                            <div className="text-[10px] font-bold text-gray-500">
                                                {item.correctAnswers || 0} / {item.totalQuestions || 0} Correct
                                            </div>
                                            <Link href={`/dashboard/student/reports`} className="text-[#46178f] text-xs font-black hover:underline uppercase tracking-tighter">
                                                View Report →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
