"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
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
        if (!confirm("⚠️ DANGER: Are you sure you want to PERMANENTLY delete this quiz? This action cannot be undone and it will be removed from all accounts.")) return;
        try {
            await deleteDoc(doc(db, "quizzes", quizId));
            setQuizzes(quizzes.filter(q => q.id !== quizId));
        } catch (error) {
            alert("Failed to delete quiz");
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
        <div className="flex min-h-screen bg-[#f8f9fa]">
            <Sidebar
                role="admin"
                userName={user.displayName || "Admin"}
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
                    <span className="font-black text-xl text-[#46178f]">Quiz Management</span>
                    <div className="w-8 h-8 rounded bg-[#1368ce] flex items-center justify-center text-white font-bold text-sm">
                        {user.displayName?.charAt(0).toUpperCase() || "A"}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-[#1F2937]">Quiz Repository</h1>
                            <p className="text-gray-500 mt-1">Monitor and control all quizzes across the platform.</p>
                        </div>
                        <button
                            onClick={fetchAllQuizzes}
                            className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-all text-[#46178f]"
                            title="Refresh Data"
                        >
                            <RefreshCcw size={20} />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by quiz title or instructor name..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#46178f] transition-all font-medium text-gray-700"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-gray-700 text-sm">Quiz Details</th>
                                        <th className="px-6 py-4 font-bold text-gray-700 text-sm">Created At</th>
                                        <th className="px-6 py-4 font-bold text-gray-700 text-sm">Instructor</th>
                                        <th className="px-6 py-4 font-bold text-gray-700 text-sm">Status</th>
                                        <th className="px-6 py-4 font-bold text-gray-700 text-sm">Stats</th>
                                        <th className="px-6 py-4 font-bold text-gray-700 text-sm text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredQuizzes.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className="text-4xl italic opacity-50">📝</span>
                                                    <p className="font-bold">No quizzes found matching your search.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredQuizzes.map((quiz) => (
                                            <tr key={quiz.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <span className="font-black text-gray-900 block group-hover:text-[#46178f] transition-colors">{quiz.title}</span>
                                                        <span className="text-xs text-gray-400 font-mono mt-1 opacity-60">ID: {quiz.id.substring(0, 8)}...</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-700">{formatDate(quiz.createdAt)}</span>
                                                        <span className="text-[10px] text-gray-400 font-medium">PKST Time</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-bold">
                                                            {quiz.instructorName?.charAt(0) || "I"}
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-600">{quiz.instructorName || "Unknown"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${quiz.isPublished ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
                                                        {quiz.isPublished ? "🟢 Live" : "⚪ Draft"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold text-gray-500">
                                                    {quiz.questions?.length || 0} Questions
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleToggleStatus(quiz.id, quiz.isPublished)}
                                                            className={`p-2 rounded-lg transition-all ${quiz.isPublished ? "bg-orange-50 text-orange-600 hover:bg-orange-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                                                            title={quiz.isPublished ? "Pause Quiz" : "Resume Quiz"}
                                                        >
                                                            {quiz.isPublished ? <Pause size={18} /> : <Play size={18} />}
                                                        </button>
                                                        {quiz.isPublished && (
                                                            <button
                                                                onClick={() => handleTerminate(quiz.id)}
                                                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                                                                title="Terminate Session"
                                                            >
                                                                <StopCircle size={18} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(quiz.id)}
                                                            className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all"
                                                            title="Delete Permanently"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                        <Link
                                                            href={`/play/${quiz.id}`}
                                                            target="_blank"
                                                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all"
                                                            title="View Live Page"
                                                        >
                                                            <ExternalLink size={18} />
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
            </main>
        </div>
    );
}
