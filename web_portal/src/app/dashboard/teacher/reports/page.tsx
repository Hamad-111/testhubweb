"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import StatCard from "@/components/StatCard";

export default function ReportsPage() {
    const { user, loading } = useAuth();
    const [results, setResults] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [summary, setSummary] = useState({
        totalParticipants: 0,
        averageScore: 0,
        totalSessions: 0
    });

    useEffect(() => {
        const fetchResults = async () => {
            if (!user) return;
            setFetching(true);
            try {
                const q = query(collection(db, "quiz_results"), where("instructorId", "==", user.uid));
                const querySnapshot = await getDocs(q);
                const fetchedResults: any[] = [];
                let totalScore = 0;

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    fetchedResults.push({ id: doc.id, ...data });
                    totalScore += (data.percentageScore || 0);
                });

                setResults(fetchedResults);
                setSummary({
                    totalParticipants: fetchedResults.length,
                    averageScore: fetchedResults.length > 0 ? Math.round(totalScore / fetchedResults.length) : 0,
                    totalSessions: new Set(fetchedResults.map(r => r.quizId)).size
                });
            } catch (error) {
                console.error("Error fetching results:", error);
            } finally {
                setFetching(false);
            }
        };

        if (!loading && user) {
            fetchResults();
        }
    }, [user, loading]);

    if (loading || (fetching && results.length === 0)) {
        return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Loading...</div>;
    }

    if (!user) return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Access Denied</div>;

    return (
        <div className="flex min-h-screen bg-[#f2f2f2]">
            <Sidebar role="instructor" userName={user.displayName || "Teacher"} />

            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-[#333]">Reports</h1>
                        <p className="text-gray-500 text-sm mt-1">Analyze student performance and quiz insights</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatCard
                            title="Total Participants"
                            value={summary.totalParticipants}
                            icon="👥"
                            color="#1368ce"
                        />
                        <StatCard
                            title="Average Score"
                            value={`${summary.averageScore}%`}
                            icon="📈"
                            color="#26890c"
                        />
                        <StatCard
                            title="Active Quizzes"
                            value={summary.totalSessions}
                            icon="📝"
                            color="#46178f"
                        />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="font-bold text-lg text-[#333]">Recent Activity</h2>
                        </div>

                        {results.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="text-5xl mb-4">📊</div>
                                <h3 className="text-lg font-bold text-[#333]">No reports available</h3>
                                <p className="text-gray-500">Wait for students to complete your quizzes to see data here.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Quiz Title</th>
                                        <th className="px-6 py-4">Score</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {results.map((result) => (
                                        <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                        {result.studentName?.charAt(0) || "S"}
                                                    </div>
                                                    <span className="font-medium text-[#333]">{result.studentName || "Anonymous Student"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                                {result.quizTitle || "Untitled Quiz"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-bold ${result.percentageScore >= 70 ? 'text-green-600' : result.percentageScore >= 40 ? 'text-orange-600' : 'text-red-600'}`}>
                                                    {result.percentageScore}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-400">
                                                {result.completedAt?.toDate ? new Date(result.completedAt.toDate()).toLocaleDateString() : 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase">
                                                    Completed
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
