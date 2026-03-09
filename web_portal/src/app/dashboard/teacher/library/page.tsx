"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Search, Plus, BookOpen, Clock, Settings, Trash2, ChevronRight, LayoutGrid, List } from "lucide-react";

export default function LibraryPage() {
    const { user, loading } = useAuth();
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
        if (confirm("Permanently remove this curriculum asset?")) {
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
        return (
            <div className="flex h-screen items-center justify-center bg-[#f8f9fa]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Initializing Library</span>
                </div>
            </div>
        );
    }

    if (!user) return <div className="flex h-screen items-center justify-center font-black text-red-500 uppercase tracking-widest bg-[#f8f9fa]">Access Denied</div>;

    return (
        <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
            <Sidebar role="instructor" userName={user.displayName || "Teacher"} />

            <main className="flex-1 md:ml-72 p-6 md:p-12 w-full animate-fade-in">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 animate-slide-up">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Curriculum Vault</h1>
                            <p className="text-slate-500 font-medium mt-1">Orchestrate and manage your instructional assets with precision.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex bg-white rounded-2xl p-1 border border-slate-100 shadow-sm">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    title="Grid View"
                                    className={`p-2 rounded-xl transition-all ${viewMode === "grid" ? "premium-gradient text-white shadow-md shadow-primary/20" : "text-slate-400 hover:text-slate-600"}`}
                                >
                                    <LayoutGrid size={20} strokeWidth={2.5} />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    title="List View"
                                    className={`p-2 rounded-xl transition-all ${viewMode === "list" ? "premium-gradient text-white shadow-md shadow-primary/20" : "text-slate-400 hover:text-slate-600"}`}
                                >
                                    <List size={20} strokeWidth={2.5} />
                                </button>
                            </div>
                            <Link href="/dashboard/teacher/create">
                                <button className="px-8 py-4 premium-gradient text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-[0_15px_40px_rgba(70,23,143,0.4)] hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3">
                                    <Plus size={18} strokeWidth={3} />
                                    <span>Synthesize Quiz</span>
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Search & Intelligence Bar */}
                    <div className="bg-white rounded-[2.5rem] shadow-premium border border-white p-6 mb-12 animate-slide-up [animation-delay:200ms]">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={24} strokeWidth={3} />
                            <input
                                type="text"
                                placeholder="Query library by asset title..."
                                className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.8rem] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold text-slate-700 placeholder:text-slate-300 text-lg tracking-tight"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {filteredQuizzes.length === 0 ? (
                        <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-24 text-center animate-slide-up [animation-delay:400ms]">
                            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <BookOpen className="text-slate-300" size={48} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
                                {searchTerm ? "Query Yielded No Matches" : "Empty Curriculum Layer"}
                            </h3>
                            <p className="text-slate-400 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
                                {searchTerm ? "Adjust your search parameters to find the target instructional asset." : "Start your pedagogical journey by synthesizing your first interactive quiz."}
                            </p>
                            {!searchTerm && (
                                <Link href="/dashboard/teacher/create">
                                    <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all shadow-lg active:scale-95">
                                        Synthesize Now
                                    </button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className={viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8" : "flex flex-col gap-4"}>
                            {filteredQuizzes.map((quiz, index) => (
                                <div
                                    key={quiz.id}
                                    className={`group relative bg-white rounded-[2.5rem] p-8 shadow-premium border border-white hover:border-primary/20 transition-all duration-500 animate-slide-up`}
                                    style={{ animationDelay: `${400 + index * 50}ms` }}
                                >
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="flex gap-6">
                                            <div className="w-20 h-20 bg-indigo-50 rounded-[1.8rem] flex items-center justify-center shadow-inner group-hover:premium-gradient transition-all duration-500 overflow-hidden relative">
                                                <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <BookOpen className="text-indigo-600 group-hover:text-white transition-colors relative z-10" size={32} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-xl text-slate-900 tracking-tighter group-hover:text-primary transition-colors leading-tight mb-2">{quiz.title}</h3>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100 shadow-sm">
                                                        <LayoutGrid size={12} strokeWidth={3} />
                                                        {quiz.questions?.length || 0} Modules
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${quiz.isPublished
                                                        ? 'bg-green-50/50 text-green-600 border-green-100'
                                                        : 'bg-amber-50/50 text-amber-600 border-amber-100'
                                                        }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${quiz.isPublished ? 'bg-green-500' : 'bg-amber-500'}`} />
                                                        {quiz.isPublished ? 'Live' : 'Draft'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                            <Link href={`/dashboard/teacher/quizzes/${quiz.id}`}>
                                                <button className="p-3 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-2xl transition-all shadow-sm" title="Configure">
                                                    <Settings size={20} strokeWidth={2.5} />
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(quiz.id)}
                                                className="p-3 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 rounded-2xl transition-all shadow-sm"
                                                title="Decommission"
                                            >
                                                <Trash2 size={20} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock size={14} strokeWidth={2.5} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest border-b border-dotted border-slate-200">
                                                {quiz.createdAt?.toDate ? new Date(quiz.createdAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Alpha Stage'}
                                            </span>
                                        </div>
                                        <Link href={`/dashboard/teacher/quizzes/${quiz.id}`} className="group/btn">
                                            <button className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] group-hover/btn:gap-3 transition-all">
                                                Inspect Asset
                                                <ChevronRight size={16} strokeWidth={3} className="text-primary/40 group-hover/btn:text-primary transition-colors" />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Insight */}
                <div className="mt-24 text-center animate-fade-in [animation-delay:1000ms]">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] bg-white px-10 py-4 rounded-[2rem] border border-slate-50 shadow-premium">
                        Pedagogical Integrity Protocol v2.8.4 • {quizzes.length} Curriculum Units
                    </span>
                </div>
            </main>
        </div>
    );
}
