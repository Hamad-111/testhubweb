"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import StatCard from "@/components/StatCard";
import { Users, BarChart3, BookOpen, Clock, ChevronRight, Search, Filter, Download, X, Check } from "lucide-react";

export default function ReportsPage() {
    const { user, loading } = useAuth();
    const [results, setResults] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedResult, setSelectedResult] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quizData, setQuizData] = useState<any>(null);
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

    const filteredResults = results.filter(r =>
        (r.studentName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.quizTitle || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleResultClick = async (result: any) => {
        setSelectedResult(result);
        setIsModalOpen(true);
        setQuizData(null);

        try {
            const quizDoc = await getDoc(doc(db, "quizzes", result.quizId));
            if (quizDoc.exists()) {
                setQuizData(quizDoc.data());
            }
        } catch (error) {
            console.error("Error fetching quiz data:", error);
        }
    };

    if (loading || (fetching && results.length === 0)) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f8f9fa]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Compiling Analytics</span>
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
                    {/* Header & Functional Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 animate-slide-up">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Performance Insights</h1>
                            <p className="text-slate-500 font-medium mt-1">Granular analysis of student engagement and curriculum efficacy.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm active:scale-95 group">
                                <Download size={20} strokeWidth={2.5} className="group-hover:translate-y-0.5 transition-transform" />
                            </button>
                            <button className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-premium active:scale-95 flex items-center gap-3">
                                <Filter size={16} strokeWidth={3} />
                                View Strategy
                            </button>
                        </div>
                    </div>

                    {/* Performance Metrics Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-slide-up [animation-delay:200ms]">
                        <StatCard
                            title="Cohort Reach"
                            value={summary.totalParticipants}
                            icon={<Users size={24} strokeWidth={2.5} />}
                            color="var(--primary)"
                        />
                        <StatCard
                            title="Command Level"
                            value={`${summary.averageScore}%`}
                            icon={<BarChart3 size={24} strokeWidth={2.5} />}
                            color="#10b981"
                        />
                        <StatCard
                            title="Asset Deployment"
                            value={summary.totalSessions}
                            icon={<BookOpen size={24} strokeWidth={2.5} />}
                            color="#6366f1"
                        />
                    </div>

                    {/* Analytics Stratagem Bar */}
                    <div className="bg-white rounded-[2.5rem] shadow-premium border border-white p-6 mb-8 animate-slide-up [animation-delay:400ms]">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={24} strokeWidth={3} />
                            <input
                                type="text"
                                placeholder="Query by student identity or curriculum title..."
                                className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.8rem] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold text-slate-700 placeholder:text-slate-300 text-lg tracking-tight"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Engagement Ledger */}
                    <div className="bg-white rounded-[2.5rem] shadow-premium border border-white overflow-hidden animate-slide-up [animation-delay:600ms]">
                        <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Engagement Registry</h2>
                        </div>

                        {filteredResults.length === 0 ? (
                            <div className="py-32 text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-[1.8rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <BarChart3 className="text-slate-200" size={32} strokeWidth={2} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">No Analytic Data Detected</h3>
                                <p className="text-slate-400 font-medium mt-2">Historical records will manifest as participants complete deployments.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Participant</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Identity</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Competency</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Verification</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredResults.map((result, index) => (
                                            <tr
                                                key={result.id}
                                                onClick={() => handleResultClick(result)}
                                                className="hover:bg-slate-50/80 transition-all duration-300 group cursor-pointer"
                                            >
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center font-black text-xs shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                                            {result.studentName?.charAt(0).toUpperCase() || "S"}
                                                        </div>
                                                        <span className="font-black text-slate-800 tracking-tight group-hover:text-primary transition-colors text-base">{result.studentName || "Anonymous Node"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                                        <span className="text-sm font-bold text-slate-600 tracking-tight">{result.quizTitle || "Untitled Asset"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className={`text-lg font-black tabular-nums tracking-tighter ${result.percentageScore >= 70 ? 'text-green-600' :
                                                            result.percentageScore >= 40 ? 'text-amber-600' : 'text-red-600'
                                                            }`}>
                                                            {result.percentageScore}%
                                                        </span>
                                                        <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-1000 ${result.percentageScore >= 70 ? 'bg-green-500' :
                                                                    result.percentageScore >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                                                    }`}
                                                                style={{ width: `${result.percentageScore}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <Clock size={14} strokeWidth={2.5} />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest leading-none">
                                                            {result.completedAt?.toDate ? new Date(result.completedAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Alpha Records'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 group/status">
                                                        <span className="text-[9px] font-black text-green-600 uppercase tracking-widest bg-green-50/50 px-3 py-1.5 rounded-xl border border-green-100 shadow-sm">
                                                            Verified
                                                        </span>
                                                        <ChevronRight size={16} strokeWidth={3} className="text-slate-200 group-hover:text-primary group-hover/status:translate-x-1 transition-all" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detailed Result Modal */}
                {isModalOpen && selectedResult && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-up">
                            {/* Modal Header */}
                            <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                <div>
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1 block">Analysis Breakdown</span>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedResult.studentName}</h2>
                                    <p className="text-slate-400 text-sm font-medium">{selectedResult.quizTitle}</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center hover:text-red-500 hover:border-red-100 transition-all shadow-sm group"
                                    title="Close Breakdown"
                                >
                                    <X size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-10 space-y-8">
                                {/* Overview Banner */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Score</span>
                                        <p className="text-2xl font-black text-slate-900 tracking-tighter">{selectedResult.score} / {selectedResult.totalQuestions}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Accuracy</span>
                                        <p className="text-2xl font-black text-green-600 tracking-tighter">{Math.round(selectedResult.percentageScore)}%</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Time taken</span>
                                        <p className="text-2xl font-black text-slate-900 tracking-tighter">{selectedResult.timeTaken}s</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Efficiency</span>
                                        <p className="text-2xl font-black text-slate-900 tracking-tighter">
                                            {selectedResult.score > 0 ? (selectedResult.timeTaken / selectedResult.score).toFixed(1) : '0'}s/pt
                                        </p>
                                    </div>
                                </div>

                                {/* Answers Ledger */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6">Decision Audit Trail</h3>
                                    {!quizData ? (
                                        <div className="py-12 flex flex-col items-center justify-center gap-4">
                                            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Reconstructing Curriculum</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {quizData.questions?.map((q: any, idx: number) => {
                                                const studentAnswer = selectedResult.answersGiven?.[idx];
                                                // Note: handle different property names for correctAnswer if necessary
                                                const isCorrect = studentAnswer === (q.correctAnswerIndex ?? q.correctAnswer);

                                                return (
                                                    <div key={idx} className={`p-6 rounded-2xl border transition-all ${isCorrect ? 'bg-green-50/30 border-green-100' : 'bg-red-50/30 border-red-100'}`}>
                                                        <div className="flex gap-4">
                                                            <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-xs ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                                                {idx + 1}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-slate-800 tracking-tight mb-4">{q.question || q.text}</h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    {q.options?.map((opt: string, optIdx: number) => {
                                                                        const isCorrectOption = optIdx === (q.correctAnswerIndex ?? q.correctAnswer);
                                                                        const isSelectedOption = optIdx === studentAnswer;

                                                                        return (
                                                                            <div key={optIdx} className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${isCorrectOption
                                                                                ? 'bg-green-100 border-green-200 text-green-800'
                                                                                : isSelectedOption
                                                                                    ? 'bg-red-100 border-red-200 text-red-800'
                                                                                    : 'bg-white border-slate-100 text-slate-400'
                                                                                }`}>
                                                                                <span>{opt}</span>
                                                                                <div className="flex gap-1">
                                                                                    {isCorrectOption && <Check size={12} strokeWidth={4} className="text-green-600" />}
                                                                                    {isSelectedOption && !isCorrectOption && <X size={12} strokeWidth={4} className="text-red-600" />}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-10 py-6 border-t border-slate-50 bg-slate-50/30 text-center">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                    Validated Performance Record • Verification ID: {selectedResult.id.slice(-8).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Insight */}
                <div className="mt-24 text-center animate-fade-in [animation-delay:1000ms]">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] bg-white px-10 py-4 rounded-[2rem] border border-slate-50 shadow-premium">
                        Analytic Integrity Protocol v3.1.2 • {results.length} Engagement Nodes
                    </span>
                </div>
            </main>
        </div>
    );
}
