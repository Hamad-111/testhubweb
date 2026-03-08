"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function StudentDiscoverPage() {
    const { user, loading } = useAuth();
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const fetchPublicQuizzes = async () => {
        setFetching(true);
        try {
            // Fetch published quizzes
            let q = query(collection(db, "quizzes"), where("isPublished", "==", true), limit(24));
            let querySnapshot = await getDocs(q);

            const fetchedQuizzes: any[] = [];
            querySnapshot.forEach((doc) => {
                fetchedQuizzes.push({ ...doc.data(), id: doc.id });
            });
            setQuizzes(fetchedQuizzes);
        } catch (error) {
            console.error("Error fetching discover quizzes:", error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (!loading) {
            fetchPublicQuizzes();
        }
    }, [loading]);

    const filteredQuizzes = quizzes.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categories = ["Mathematics", "Science", "History", "Technology", "Languages", "Arts"];

    if (loading || (fetching && quizzes.length === 0)) {
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
                    <button onClick={() => setSidebarOpen(true)} className="text-[#46178f]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                    <span className="font-black text-xl text-[#46178f]">Discover</span>
                    <div className="w-8 h-8 rounded bg-[#1368ce] flex items-center justify-center text-white font-bold text-sm">
                        {user?.displayName?.charAt(0).toUpperCase() || "S"}
                    </div>
                </div>

                <div className="max-w-6xl mx-auto">
                    <div className="hidden md:block mb-8">
                        <h1 className="text-3xl font-black text-[#333]">Discover</h1>
                        <p className="text-gray-500 text-sm mt-1">Find amazing quizzes to challenge yourself!</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8">
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                            <input
                                type="text"
                                placeholder="Search math, science, history..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#46178f] transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {categories.map(cat => (
                            <button key={cat} className="whitespace-nowrap px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-bold text-[#333] hover:bg-gray-50 transition-colors">
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredQuizzes.length === 0 ? (
                            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-gray-300">
                                <span className="text-6xl mb-4 block">🧐</span>
                                <h3 className="text-lg font-bold text-[#333] mb-2">No results found</h3>
                                <p className="text-gray-500">Try searching for something else!</p>
                            </div>
                        ) : (
                            filteredQuizzes.map((quiz) => (
                                <div key={quiz.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                                    <div className="h-32 bg-[#46178f] flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-500">
                                        {quiz.icon || "📝"}
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-[#333] mb-2 line-clamp-2">{quiz.title}</h3>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-4">
                                            <span>{quiz.questions?.length || 0} Questions</span>
                                            <span>•</span>
                                            <span className="text-[#1368ce]">By {quiz.instructorName || "Instructor"}</span>
                                        </div>
                                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                            <span className="text-xs font-black text-green-500">FREE</span>
                                            <Link href={`/play/${quiz.id}`} className="px-4 py-2 rounded-lg bg-[#46178f] text-white text-xs font-black hover:bg-[#3c147a] transition-colors shadow-lg shadow-purple-100">
                                                PLAY NOW
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
