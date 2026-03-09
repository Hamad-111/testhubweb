"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Search, Filter, Globe, BookOpen, Users, Compass, ChevronRight, Bookmark } from "lucide-react";

export default function DiscoverPage() {
    const { user, loading } = useAuth();
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchPublicQuizzes = async () => {
        setFetching(true);
        try {
            let q = query(collection(db, "quizzes"), where("isPublished", "==", true), limit(20));
            let querySnapshot = await getDocs(q);

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
        <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
            <Sidebar role="instructor" userName={user?.displayName || "Guest"} />

            <main className="flex-1 md:ml-72 p-6 md:p-12 w-full animate-fade-in">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-12 animate-slide-up">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                Global Hub
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                4.2k Active Resources
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                            Global Discovery
                            <Compass size={28} className="text-primary animate-pulse" />
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">Explore and leverage professional assessments from the global Test Hub collective.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                        {/* Sidebar Filters - Modern Glass */}
                        <div className="lg:col-span-1 space-y-8 animate-slide-up [animation-delay:100ms]">
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-premium border border-white group">
                                <h3 className="font-black text-slate-900 mb-8 uppercase text-[10px] tracking-[0.3em] flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-xl group-hover:text-primary transition-colors">
                                        <Filter size={14} />
                                    </div>
                                    Refine Search
                                </h3>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-black text-slate-400 block uppercase tracking-widest ml-1">Academic Subjects</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {categories.map(cat => (
                                                <div key={cat} className="flex items-center justify-between group/item cursor-pointer">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-4 h-4 rounded border-2 border-slate-200 group-hover/item:border-primary transition-all flex items-center justify-center p-0.5">
                                                            <div className="w-full h-full bg-primary rounded-[1px] opacity-0 group-hover/item:opacity-20 transition-all" />
                                                        </div>
                                                        <label htmlFor={cat} className="text-xs text-slate-600 font-bold group-hover/item:text-slate-900 transition-colors cursor-pointer">{cat}</label>
                                                    </div>
                                                    <span className="text-[10px] text-slate-300 font-black tracking-tighter opacity-0 group-hover/item:opacity-100 transition-all">+</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-50" />

                                    <div className="space-y-4">
                                        <label className="text-[9px] font-black text-slate-400 block uppercase tracking-widest ml-1">Instructional Level</label>
                                        <div className="relative">
                                            <select title="Select education level" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-primary transition-all appearance-none cursor-pointer">
                                                <option>Universal Access</option>
                                                <option>Elementary Tier</option>
                                                <option>Secondary Tier</option>
                                                <option>Higher Education</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <ChevronRight size={14} className="rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-premium border border-slate-800 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                <h4 className="text-white font-black text-lg tracking-tight mb-2 relative z-10">Premium Vault</h4>
                                <p className="text-slate-400 text-[10px] font-medium leading-relaxed mb-6 relative z-10 uppercase tracking-widest">PRO FEATURES ENABLED</p>
                                <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all relative z-10 shadow-xl">
                                    Access Templates
                                </button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3 space-y-8 animate-slide-up [animation-delay:200ms]">
                            {/* Search Glass */}
                            <div className="bg-white rounded-[2rem] shadow-premium border border-white p-3 flex group">
                                <div className="relative flex-1">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-primary transition-colors">
                                        <Search size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Scan community curriculum architecture..."
                                        className="w-full pl-14 pr-4 py-5 bg-transparent font-bold text-slate-900 placeholder:text-slate-300 outline-none transition-all text-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button className="px-10 py-4 premium-gradient text-white rounded-[1.4rem] font-black text-[10px] uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all">
                                    Initiate Sync
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {filteredQuizzes.length === 0 ? (
                                    <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                                        <div className="text-6xl mb-6 grayscale opacity-20 animate-float">📡</div>
                                        <h3 className="font-black text-slate-800 text-xl tracking-tight mb-2">No Signal Detected</h3>
                                        <p className="text-slate-400 font-medium uppercase text-[10px] tracking-[0.2em]">Try adjusting your refine parameters</p>
                                    </div>
                                ) : (
                                    filteredQuizzes.map((quiz, idx) => (
                                        <div key={quiz.id} className="group bg-white rounded-[2.5rem] border border-white overflow-hidden shadow-premium hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                            <div className="h-44 bg-slate-50 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-20 h-20 rounded-3xl bg-white shadow-premium flex items-center justify-center transform group-hover:rotate-12 transition-all duration-700">
                                                        <BookOpen size={32} className="text-primary" />
                                                    </div>
                                                </div>
                                                <div className="absolute top-6 right-6">
                                                    <button className="p-3 bg-white/80 backdrop-blur-md rounded-xl text-slate-400 hover:text-primary shadow-sm hover:shadow-md transition-all">
                                                        <Bookmark size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-8 flex flex-col h-full">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h3 className="font-black text-xl text-slate-900 tracking-tighter leading-tight group-hover:text-primary transition-colors">{quiz.title}</h3>
                                                </div>

                                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-300 mb-8">
                                                    <span className="flex items-center gap-1.5 text-slate-400">
                                                        <Globe size={12} /> {quiz.questions?.length || 0} Modules
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <span className="flex items-center gap-1.5">
                                                        <Users size={12} /> {quiz.instructorName || "System"}
                                                    </span>
                                                </div>

                                                <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Verified Content</span>
                                                    </div>
                                                    <Link href={`/play/${quiz.id}`} className="group/lnk flex items-center gap-2 px-6 py-2.5 bg-slate-50 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                                        Execute Solo <ChevronRight size={14} className="group-hover/lnk:translate-x-1 transition-transform" />
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
