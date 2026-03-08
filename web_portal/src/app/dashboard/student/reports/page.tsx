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
                    <span className="font-black text-xl text-[#46178f]">Reports</span>
                    <div className="w-8 h-8 rounded bg-[#1368ce] flex items-center justify-center text-white font-bold text-sm">
                        {user?.displayName?.charAt(0).toUpperCase() || "S"}
                    </div>
                </div>

                <div className="max-w-6xl mx-auto">
                    <div className="hidden md:block mb-8">
                        <h1 className="text-3xl font-black text-[#333]">Reports</h1>
                        <p className="text-gray-500 text-sm mt-1">Detailed breakdown of your performance and accuracy</p>
                    </div>

                    {reports.length === 0 ? (
                        <div className="bg-white rounded-3xl p-16 text-center border-l-8 border-[#ffa602] shadow-sm">
                            <span className="text-7xl mb-6 block">📊</span>
                            <h2 className="text-2xl font-black text-[#333] mb-4">No reports available</h2>
                            <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">Reports are generated automatically after you complete a quiz. Start playing to track your performance!</p>
                            <Link href="/join" className="btn btn-primary px-10">Start Playing</Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 uppercase text-[10px] font-black tracking-widest text-gray-500">
                                        <th className="px-6 py-4">Quiz Title</th>
                                        <th className="px-6 py-4">Accuracy</th>
                                        <th className="px-6 py-4">Correct / Total</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {reports.map((report) => (
                                        <tr key={report.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-[#f2f2f2] rounded-lg flex items-center justify-center text-lg">📝</div>
                                                    <span className="font-bold text-[#333] group-hover:text-[#46178f] transition-colors">{report.quizTitle || "Untitled Quiz"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${report.percentageScore >= 80 ? 'bg-green-500' : report.percentageScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                            style={{ width: `${report.percentageScore}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-black text-[#333]">{report.percentageScore}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-bold text-gray-500">
                                                {report.correctAnswers} / {report.totalQuestions}
                                            </td>
                                            <td className="px-6 py-5 text-sm font-bold text-gray-400">
                                                {new Date(report.completedAt?.seconds * 1000).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button className="text-[10px] font-black uppercase tracking-widest bg-gray-50 text-[#46178f] hover:bg-[#46178f] hover:text-white px-4 py-2 rounded-lg transition-all">
                                                    Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
