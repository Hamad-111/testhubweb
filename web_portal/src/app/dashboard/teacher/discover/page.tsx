"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function DiscoverPage() {
    const { user, loading } = useAuth();
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchPublicQuizzes = async () => {
        setFetching(true);
        try {
            // First try to fetch published quizzes
            let q = query(collection(db, "quizzes"), where("isPublished", "==", true), limit(20));
            let querySnapshot = await getDocs(q);

            // If none found, fetch latest 20 quizzes to show something
            if (querySnapshot.empty) {
                q = query(collection(db, "quizzes"), limit(20));
                querySnapshot = await getDocs(q);
            }

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
            <Sidebar role="instructor" userName={user?.displayName || "Guest"} />

            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-[#333]">Discover</h1>
                        <p className="text-gray-500 text-sm mt-1">Explore quizzes from the Test Hub community</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar Filters */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <h3 className="font-bold text-[#333] mb-4 uppercase text-xs tracking-widest">Filters</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-2 uppercase">Subject</label>
                                        <div className="space-y-2">
                                            {categories.map(cat => (
                                                <div key={cat} className="flex items-center gap-2">
                                                    <input type="checkbox" id={cat} className="rounded border-gray-300 text-[#46178f] focus:ring-[#46178f]" />
                                                    <label htmlFor={cat} className="text-sm text-gray-600 font-medium">{cat}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <hr className="border-gray-100" />
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-2 uppercase">Level</label>
                                        <select title="Select education level" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-[#46178f]">
                                            <option>All Levels</option>
                                            <option>Elementary</option>
                                            <option>High School</option>
                                            <option>University</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Search public quizzes..."
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#46178f] transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredQuizzes.length === 0 ? (
                                    <div className="col-span-full py-12 text-center bg-white rounded-xl border border-gray-100">
                                        <p className="text-gray-500 font-bold">No quizzes found match your criteria</p>
                                    </div>
                                ) : (
                                    filteredQuizzes.map((quiz) => (
                                        <div key={quiz.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                                            <div className="h-32 bg-[#46178f] flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
                                                📝
                                            </div>
                                            <div className="p-6 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-lg text-[#333] tracking-tight leading-tight">{quiz.title}</h3>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded font-medium">{quiz.questions?.length || 0} Questions</span>
                                                    <span>•</span>
                                                    <span>By {quiz.instructorName || "Instructor"}</span>
                                                </div>
                                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                                                    <span className="text-xs font-bold text-green-600">FREE</span>
                                                    <Link href={`/play/${quiz.id}`} className="text-[#46178f] font-black text-sm uppercase tracking-tighter hover:underline">
                                                        Play Solo →
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
