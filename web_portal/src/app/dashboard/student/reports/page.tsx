"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function StudentReportsPage() {
    const { user, loading } = useAuth();
    const [reports, setReports] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const fetchReports = async () => {
        if (!user) return;
        setFetching(true);
        try {
            const q = query(
                collection(db, "quiz_results"),
                where("studentId", "==", user.uid),
                orderBy("completedAt", "desc"),
                limit(50)
            );
            const querySnapshot = await getDocs(q);

            const fetchedReports: any[] = [];
            querySnapshot.forEach((doc) => {
                fetchedReports.push({ ...doc.data(), id: doc.id });
            });
            setReports(fetchedReports);
        } catch (error) {
            console.error("Error fetching student reports:", error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (!loading && user) {
            fetchReports();
        }
    }, [user, loading]);

    if (loading || (fetching && reports.length === 0 && user)) {
        return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Loading...</div>;
    }

    return (
        <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
            <Sidebar
                role="student"
                userName={user?.displayName || "Student"}
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="flex-1 md:ml-72 p-6 md:p-12 w-full animate-fade-in">
                {/* Mobile Header - Glass Effect */}
                <div className="md:hidden flex items-center justify-between mb-8 glass-card p-5 rounded-3xl shadow-premium border-white/40">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-primary hover:scale-110 transition-transform p-1"
                        title="Open Menu"
                        aria-label="Open Menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                    <span className="font-black text-xl tracking-tighter text-slate-900">Performance</span>
                    <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-sm shadow-lg">
                        {user?.displayName?.charAt(0).toUpperCase() || "S"}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="hidden md:flex flex-col mb-12 animate-slide-up">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Academic Insights</h1>
                        <p className="text-slate-500 font-medium mt-1">Detailed breakdown of your performance and accuracy over time.</p>
                    </div>

                    {reports.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] p-24 text-center border border-white shadow-premium animate-slide-up">
                            <div className="text-8xl mb-8 grayscale opacity-50 animate-float">📊</div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">No insights available</h2>
                            <p className="text-slate-500 max-w-lg mx-auto mb-10 text-lg font-medium leading-relaxed">Reports are generated automatically after you complete a quiz. Embark on a learning journey to track your evolution!</p>
                            <Link href="/join">
                                <button className="px-12 py-4 premium-gradient text-white rounded-2xl font-black text-sm shadow-xl hover:-translate-y-1 transition-all uppercase tracking-widest active:scale-95">
                                    Launch Your First Quiz
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2.5rem] shadow-premium border border-white overflow-hidden animate-slide-up [animation-delay:200ms]">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Quiz Curriculum</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Accuracy Index</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Metrics</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timeline</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {reports.map((report) => (
                                            <tr key={report.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 bg-white shadow-inner rounded-2xl flex items-center justify-center text-xl border border-slate-100 group-hover:rotate-6 transition-transform">
                                                            📚
                                                        </div>
                                                        <div>
                                                            <span className="font-black text-slate-900 block text-lg tracking-tight group-hover:text-primary transition-colors">{report.quizTitle || "Incomplete Title"}</span>
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">UUID: {report.id.substring(0, 8)}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${report.percentageScore >= 80 ? 'bg-green-500' : report.percentageScore >= 50 ? 'bg-[#ffa602]' : 'bg-red-500'
                                                                    }`}
                                                                style={{ width: `${report.percentageScore}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm font-black text-slate-900 tracking-tighter">{report.percentageScore}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-700 tracking-tight">{report.correctAnswers} / {report.totalQuestions}</span>
                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Questions Hit</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-500 tracking-tight">
                                                            {new Date(report.completedAt?.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Sync Date</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button className="text-[10px] font-black uppercase tracking-[0.2em] bg-white text-primary border border-slate-100 hover:bg-primary hover:text-white px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95">
                                                        Open Report
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Aggregate Summary Placeholder */}
                <div className="mt-12 text-center animate-fade-in [animation-delay:800ms]">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] bg-white px-6 py-2 rounded-full border border-slate-50 shadow-sm">
                        Historical Data Point: {reports.length} Records Synthetic
                    </span>
                </div>
            </main>
        </div>
    );
}
