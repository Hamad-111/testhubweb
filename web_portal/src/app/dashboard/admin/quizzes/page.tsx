"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Search, Trash2, Pause, Play, StopCircle, RefreshCcw, MoreVertical, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AdminQuizManagement() {
    const { user, loading } = useAuth();
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const fetchAllQuizzes = async () => {
        setLoadingData(true);
        try {
            const q = query(collection(db, "quizzes"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            const list: any[] = [];
            snapshot.forEach(doc => {
                list.push({ id: doc.id, ...doc.data() });
            });
            setQuizzes(list);
        } catch (error) {
            console.error("Error fetching all quizzes:", error);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (!loading && user?.role === "admin") {
            fetchAllQuizzes();
        }
    }, [user, loading]);

    const handleToggleStatus = async (quizId: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, "quizzes", quizId), { isPublished: !currentStatus });
            setQuizzes(quizzes.map(q => q.id === quizId ? { ...q, isPublished: !currentStatus } : q));
        } catch (error) {
            alert("Failed to update quiz status");
        }
    };

    const handleTerminate = async (quizId: string) => {
        if (!confirm("Are you sure you want to terminate this live session? It will set it to draft status.")) return;
        try {
            await updateDoc(doc(db, "quizzes", quizId), { isPublished: false });
            setQuizzes(quizzes.map(q => q.id === quizId ? { ...q, isPublished: false } : q));
        } catch (error) {
            alert("Failed to terminate quiz session");
        }
    };

    const handleDelete = async (quizId: string) => {
        if (!confirm("⚠️ DANGER: Are you sure you want to PERMANENTLY delete this quiz and ALL associated results? This action cannot be undone.")) return;

        setLoadingData(true);
        try {
            // 1. Delete all results associated with this quiz
            const resultsQuery = query(collection(db, "quiz_results"), where("quizId", "==", quizId));
            const resultsSnapshot = await getDocs(resultsQuery);
            const deleteResultsPromises = resultsSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deleteResultsPromises);

            // 2. Delete the quiz itself
            await deleteDoc(doc(db, "quizzes", quizId));

            setQuizzes(quizzes.filter(q => q.id !== quizId));
            alert("✅ Quiz and all associated results deleted successfully.");
        } catch (error: any) {
            console.error("Error deleting quiz:", error);
            alert(`Failed to delete quiz: ${error.message}`);
        } finally {
            setLoadingData(false);
        }
    };

    const handleClearAll = async () => {
        if (!confirm("🚨 CRITICAL WARNING: This will PERMANENTLY DELETE ALL QUIZZES, ALL RESULTS, and RESET ALL STUDENT STATS from the entire platform! This action is IRREVERSIBLE. Are you ABSOLUTELY sure?")) return;
        if (!confirm("FINAL CONFIRMATION: Are you certain you want to wipe the entire database? This cannot be undone.")) return;

        setLoadingData(true);
        try {
            // 1. Clear all quizzes
            const quizSnapshot = await getDocs(collection(db, "quizzes"));
            const deleteQuizPromises = quizSnapshot.docs.map(doc => deleteDoc(doc.ref));

            // 2. Clear all results
            const resultsSnapshot = await getDocs(collection(db, "quiz_results"));
            const deleteResultsPromises = resultsSnapshot.docs.map(doc => deleteDoc(doc.ref));

            // 3. Reset student stats (quizzesTaken and totalScore)
            const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
            const studentsSnapshot = await getDocs(studentsQuery);
            const resetStatsPromises = studentsSnapshot.docs.map(docRef =>
                updateDoc(docRef.ref, {
                    totalScore: 0,
                    quizzesTaken: 0
                })
            );

            await Promise.all([
                ...deleteQuizPromises,
                ...deleteResultsPromises,
                ...resetStatsPromises
            ]);

            setQuizzes([]);
            alert("✅ Success: The database has been completely cleared and student stats have been reset.");
        } catch (error: any) {
            console.error("Error clearing database:", error);
            alert(`Failed to clear database: ${error.message}`);
        } finally {
            setLoadingData(false);
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat("en-PK", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
    };

    const filteredQuizzes = quizzes.filter(quiz =>
        quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.instructorName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading || loadingData) return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Loading...</div>;
    if (!user || user.role !== "admin") return <div className="p-8 font-bold text-red-500">Access Denied</div>;

    return (
        <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
            <Sidebar
                role="admin"
                userName={user.displayName || "Admin"}
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="flex-1 md:ml-72 p-6 md:p-12 w-full animate-fade-in">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between mb-8 glass-card p-4 rounded-3xl border-white/50">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-primary hover:bg-primary/5 rounded-xl transition-colors"
                        title="Open Menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                    <span className="font-black text-xl text-slate-900 tracking-tighter">Quiz Vault</span>
                    <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center text-white font-black text-sm shadow-lg">
                        {user.displayName?.charAt(0).toUpperCase() || "A"}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-slide-up">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Repository Alpha</h1>
                            <p className="text-slate-500 font-medium mt-1">Global oversight and operational control of the instructional asset layer.</p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={handleClearAll}
                                className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-2 shadow-sm active:scale-95"
                            >
                                <Trash2 size={16} strokeWidth={3} />
                                Purge Ecosystem
                            </button>
                            <button
                                onClick={fetchAllQuizzes}
                                className="p-3 bg-white border border-slate-200 rounded-2xl text-primary shadow-sm hover:shadow-md transition-all active:scale-95"
                                title="Sync Repository"
                            >
                                <RefreshCcw size={20} className="animate-spin-slow" />
                            </button>
                        </div>
                    </div>

                    {/* Search Stratagem */}
                    <div className="bg-white rounded-[2.5rem] shadow-premium border border-white p-6 mb-12 animate-slide-up [animation-delay:200ms]">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={24} strokeWidth={3} />
                            <input
                                type="text"
                                placeholder="Query by curriculum title or instructor entity..."
                                className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.8rem] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold text-slate-700 placeholder:text-slate-300 text-lg tracking-tight"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Repository Terminal */}
                    <div className="bg-white rounded-[2.5rem] shadow-premium border border-white overflow-hidden animate-slide-up [animation-delay:400ms]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Curriculum Asset</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Source Entity</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Complexity</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ops</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredQuizzes.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-24 text-center">
                                                <div className="flex flex-col items-center gap-6 opacity-40">
                                                    <span className="text-6xl animate-bounce-slow">📝</span>
                                                    <p className="font-black text-slate-500 uppercase tracking-[0.3em] text-sm">No curriculum matches detected</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredQuizzes.map((quiz, index) => (
                                            <tr key={quiz.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-slate-900 text-lg tracking-tighter group-hover:text-primary transition-colors leading-tight">{quiz.title}</span>
                                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">UID: {quiz.id.substring(0, 12)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-600 tracking-tight">{formatDate(quiz.createdAt)}</span>
                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Standard PKST</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-[10px] font-black shadow-sm group-hover:premium-gradient group-hover:text-white transition-all">
                                                            {quiz.instructorName?.charAt(0).toUpperCase() || "I"}
                                                        </div>
                                                        <span className="text-sm font-black text-slate-700 tracking-tight">{quiz.instructorName || "Entity Unknown"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full animate-pulse ${quiz.isPublished ? "bg-green-500" : "bg-slate-300"}`} />
                                                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${quiz.isPublished
                                                            ? "bg-green-50/50 text-green-600 border-green-100"
                                                            : "bg-slate-50/50 text-slate-400 border-slate-100"
                                                            }`}>
                                                            {quiz.isPublished ? "Live Node" : "Draft Cache"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-sm font-black text-slate-500 tabular-nums tracking-tighter">
                                                        {quiz.questions?.length || 0} Modules
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                        <button
                                                            onClick={() => handleToggleStatus(quiz.id, quiz.isPublished)}
                                                            className={`p-3 rounded-2xl transition-all shadow-sm active:scale-90 ${quiz.isPublished
                                                                ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                                                                : "bg-green-50 text-green-600 hover:bg-green-100"
                                                                }`}
                                                            title={quiz.isPublished ? "Kill Switch" : "Activate Node"}
                                                        >
                                                            {quiz.isPublished ? <Pause size={18} strokeWidth={3} /> : <Play size={18} strokeWidth={3} />}
                                                        </button>
                                                        {quiz.isPublished && (
                                                            <button
                                                                onClick={() => handleTerminate(quiz.id)}
                                                                className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all shadow-sm active:scale-90"
                                                                title="Force Terminate"
                                                            >
                                                                <StopCircle size={18} strokeWidth={3} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(quiz.id)}
                                                            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-700 transition-all shadow-sm active:scale-90"
                                                            title="Purge Object"
                                                        >
                                                            <Trash2 size={18} strokeWidth={3} />
                                                        </button>
                                                        <Link
                                                            href={`/play/${quiz.id}`}
                                                            target="_blank"
                                                            className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all shadow-sm active:scale-90"
                                                            title="Inspect Deployment"
                                                        >
                                                            <ExternalLink size={18} strokeWidth={3} />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer Insight */}
                <div className="mt-12 text-center animate-fade-in [animation-delay:800ms]">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] bg-white px-8 py-3 rounded-2xl border border-slate-50 shadow-sm">
                        Curriculum Integrity Layer v4.1.0 • {filteredQuizzes.length} Active Objects
                    </span>
                </div>
            </main>
        </div>
    );
}
