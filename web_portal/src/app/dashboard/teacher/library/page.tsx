"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function LibraryPage() {
    const { user, loading } = useAuth();
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchQuizzes = async () => {
        if (!user) return;
        setFetching(true);
        try {
            const q = query(collection(db, "quizzes"), where("instructorId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            const fetchedQuizzes: any[] = [];
            querySnapshot.forEach((doc) => {
                fetchedQuizzes.push({ ...doc.data(), id: doc.id });
            });
            setQuizzes(fetchedQuizzes);
        } catch (error) {
            console.error("Error fetching quizzes:", error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (!loading && user) {
            fetchQuizzes();
        }
    }, [user, loading]);

    const handleDelete = async (quizId: string) => {
        if (confirm("Are you sure you want to delete this quiz?")) {
            try {
                await deleteDoc(doc(db, "quizzes", quizId));
                setQuizzes(quizzes.filter(q => q.id !== quizId));
            } catch (error) {
                console.error("Error deleting quiz:", error);
            }
        }
    };

    const filteredQuizzes = quizzes.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading || (fetching && quizzes.length === 0)) {
        return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Loading...</div>;
    }

    if (!user) return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Access Denied</div>;

    return (
        <div className="flex min-h-screen bg-[#f2f2f2]">
            <Sidebar role="instructor" userName={user.displayName || "Teacher"} />

            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-[#333]">My Library</h1>
                            <p className="text-gray-500 text-sm mt-1">Manage and organize your quizzes</p>
                        </div>
                        <Link href="/dashboard/teacher/create">
                            <button className="px-6 py-3 bg-[#46178f] text-white rounded-lg font-bold hover:bg-[#3c147a] transition-all shadow-lg flex items-center gap-2">
                                <span>+</span> Create New Quiz
                            </button>
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                            <input
                                type="text"
                                placeholder="Search your library..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#46178f] transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {filteredQuizzes.length === 0 ? (
                        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                            <div className="text-6xl mb-4">📚</div>
                            <h3 className="text-xl font-bold text-[#333] mb-2">{searchTerm ? "No results found" : "Your library is empty"}</h3>
                            <p className="text-gray-500 mb-6">{searchTerm ? "Try searching for something else" : "Create your first quiz to see it here"}</p>
                            {!searchTerm && (
                                <Link href="/dashboard/teacher/create">
                                    <button className="px-6 py-2 bg-[#46178f] text-white rounded font-bold hover:bg-[#3c147a] transition-colors">
                                        Create Quiz
                                    </button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredQuizzes.map((quiz) => (
                                <div key={quiz.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                                                📝
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-[#333]">{quiz.title}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                                        {quiz.questions?.length || 0} Questions
                                                    </span>
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${quiz.isPublished ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {quiz.isPublished ? 'Published' : 'Draft'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/dashboard/teacher/quizzes/${quiz.id}`}>
                                                <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Edit">
                                                    ✏️
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(quiz.id)}
                                                className="p-2 hover:bg-red-50 rounded text-red-500"
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <span className="text-xs text-gray-400">
                                            Created {quiz.createdAt?.toDate ? new Date(quiz.createdAt.toDate()).toLocaleDateString() : 'recently'}
                                        </span>
                                        <Link href={`/dashboard/teacher/quizzes/${quiz.id}`}>
                                            <button className="text-sm font-bold text-[#46178f] hover:underline">
                                                View Details →
                                            </button>
                                        </Link>
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
