"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Check, Rocket, Timer, HelpCircle, Save, X, Trash2, Edit3 } from "lucide-react";

interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    timeLimit: number;
}

export default function QuizBuilder() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const quizId = params?.id as string;

    const [quiz, setQuiz] = useState<any>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [results, setResults] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [timerDuration, setTimerDuration] = useState(0); // in minutes, 0 = no limit

    // New Question State
    const [isAdding, setIsAdding] = useState(false);
    const [newQuestion, setNewQuestion] = useState<Question>({
        id: "",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        timeLimit: 30
    });

    useEffect(() => {
        if (!user || !quizId) return;

        const fetchQuiz = async () => {
            try {
                const docRef = doc(db, "quizzes", quizId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setQuiz(data);
                    if (data.questions) {
                        setQuestions(data.questions);
                    }
                } else {
                    alert("Quiz not found");
                    router.push("/dashboard/teacher");
                }
            } catch (error) {
                console.error("Error fetching quiz:", error);
            }
        };
        fetchQuiz();

        // Real-time results listener
        const resultsQuery = query(collection(db, "quiz_results"), where("quizId", "==", quizId));
        const unsubscribe = onSnapshot(resultsQuery, (snapshot) => {
            const fetchedResults: any[] = [];
            snapshot.forEach((doc) => {
                fetchedResults.push({ id: doc.id, ...doc.data() });
            });

            // Safer sort handling potential null/pending timestamps
            const sortedResults = fetchedResults.sort((a, b) => {
                const timeA = a.completedAt?.toMillis?.() || a.completedAt?.seconds * 1000 || 0;
                const timeB = b.completedAt?.toMillis?.() || b.completedAt?.seconds * 1000 || 0;
                return timeB - timeA;
            });

            setResults(sortedResults);
        });

        return () => unsubscribe();
    }, [user, quizId, router]);

    const handleAddQuestion = async () => {
        if (!newQuestion.question || newQuestion.options.some(opt => !opt)) {
            alert("Please fill in all fields");
            return;
        }

        setIsSaving(true);
        try {
            const questionToAdd = {
                ...newQuestion,
                id: Date.now().toString()
            };

            const docRef = doc(db, "quizzes", quizId);
            await updateDoc(docRef, {
                questions: arrayUnion(questionToAdd)
            });

            setQuestions([...questions, questionToAdd]);
            setIsAdding(false);
            setNewQuestion({
                id: "",
                question: "",
                options: ["", "", "", ""],
                correctAnswer: 0,
                timeLimit: 30
            });
        } catch (error) {
            console.error("Error adding question:", error);
            alert("Failed to save question");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        try {
            const docRef = doc(db, "quizzes", quizId);
            const isGoingLive = !quiz?.isPublished;

            const updateData: any = {
                isPublished: isGoingLive
            };

            if (isGoingLive && timerDuration > 0) {
                const expiryDate = new Date();
                expiryDate.setMinutes(expiryDate.getMinutes() + timerDuration);
                updateData.expiresAt = expiryDate;
                updateData.timerDuration = timerDuration;
            } else if (!isGoingLive) {
                updateData.expiresAt = null;
            }

            await updateDoc(docRef, updateData);
            setQuiz({ ...quiz, ...updateData });
            alert(isGoingLive ? "Quiz Launched Successfully!" : "Quiz Stopped Successfully!");
        } catch (error: any) {
            console.error("Error toggling publish:", error);
            alert(`Failed to update status: ${error.message || "Unknown error"}`);
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Loading...</div>;
    if (!user) return <div>Access Denied</div>;

    return (
        <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
            <Sidebar role="instructor" userName={user.displayName || "Teacher"} />

            <main className="flex-1 md:ml-72 p-6 md:p-12 w-full animate-fade-in mb-20">
                <div className="max-w-5xl mx-auto">
                    {/* Back Link */}
                    <button
                        onClick={() => router.push('/dashboard/teacher')}
                        className="group flex items-center text-slate-400 mb-8 hover:text-primary transition-all font-black text-[10px] uppercase tracking-[0.2em]"
                    >
                        <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Library
                    </button>

                    {/* Header Section */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 animate-slide-up">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                    {quiz?.topic || "Custom Assessment"}
                                </span>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {questions.length} Concepts Defined
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                                {quiz?.title || "Curriculum Engine"}
                                <Edit3 size={20} className="text-slate-300 hover:text-primary cursor-pointer transition-colors" />
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            {!quiz?.isPublished && (
                                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                                    <Timer size={16} className="text-slate-400" />
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Session Duration</span>
                                        <select
                                            value={timerDuration}
                                            onChange={(e) => setTimerDuration(Number(e.target.value))}
                                            className="bg-transparent text-xs font-black text-slate-900 outline-none focus:text-primary transition-colors cursor-pointer"
                                            title="Select Quiz Duration"
                                        >
                                            <option value={0}>∞ No Limit</option>
                                            <option value={5}>05 Mins</option>
                                            <option value={10}>10 Mins</option>
                                            <option value={30}>30 Mins</option>
                                            <option value={60}>60 Mins</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handlePublish}
                                className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg ${quiz?.isPublished
                                    ? 'bg-slate-900 text-white hover:bg-orange-600'
                                    : 'premium-gradient text-white hover:shadow-[0_15px_40px_rgba(70,23,143,0.4)]'
                                    }`}
                            >
                                {quiz?.isPublished ? (
                                    <><X size={18} /> Stop Session</>
                                ) : (
                                    <><Rocket size={18} /> Launch Quiz</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Results Section */}
                    {(results.length > 0 || quiz?.isPublished) && (
                        <div className="mb-12 animate-slide-up [animation-delay:200ms]">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <div className="w-2 h-7 bg-green-500 rounded-full" />
                                    Session Result Registry
                                </h2>
                                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
                                    {results.length} Nodes Synchronized
                                </span>
                            </div>

                            <div className="bg-white rounded-[2rem] shadow-premium border border-white overflow-hidden">
                                {results.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                                            <Timer className="text-slate-200 animate-pulse" size={24} />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Awaiting Synchronized Data</h3>
                                        <p className="text-slate-400 text-sm font-medium mt-1">Results will materialize here as participants complete the assessment.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-slate-50/50">
                                                <tr>
                                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Participant</th>
                                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Competency</th>
                                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Activity</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {results.map((result) => (
                                                    <tr key={result.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-black text-[10px] shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                                                    {result.studentName?.charAt(0).toUpperCase() || "S"}
                                                                </div>
                                                                <span className="font-black text-slate-800 tracking-tight text-sm">{result.studentName || "Anonymous Node"}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <span className="text-sm font-black text-slate-600 tabular-nums">
                                                                {result.score} / {result.totalQuestions}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-4">
                                                                <span className={`text-sm font-black tabular-nums transition-colors ${result.percentageScore >= 70 ? 'text-green-600' : result.percentageScore >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                                                                    {Math.round(result.percentageScore)}%
                                                                </span>
                                                                <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden shadow-inner hidden sm:block">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-1000 ${result.percentageScore >= 70 ? 'bg-green-500' : result.percentageScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                                        style={{ width: `${result.percentageScore}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tabular-nums">
                                                                {result.timeTaken}s
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Questions Grid */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <div className="w-2 h-7 bg-primary rounded-full" />
                                Knowledge Architecture
                            </h2>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ORDER: CHRONOLOGICAL</span>
                        </div>

                        {questions.map((q, idx) => (
                            <div key={q.id || idx} className="group bg-white rounded-[2rem] shadow-premium p-8 border border-white hover:border-primary/20 transition-all duration-500 animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-xl text-slate-900 tracking-tight leading-relaxed max-w-2xl">{q.question}</h3>
                                            <div className="mt-2 flex items-center gap-4">
                                                <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                                    <Timer size={12} /> {q.timeLimit}s Allocation
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                <span className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-wider">
                                                    <HelpCircle size={12} /> Multiple Choice
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-3 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all" title="Edit Concept">
                                            <Edit3 size={18} />
                                        </button>
                                        <button className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Remove Concept">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {q.options.map((opt, i) => (
                                        <div key={i} className={`group/opt p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 ${i === q.correctAnswer
                                            ? 'bg-green-50 border-green-200 shadow-sm'
                                            : 'bg-slate-50/50 border-transparent hover:bg-white hover:border-slate-100 hover:shadow-md'
                                            }`}>
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${i === q.correctAnswer
                                                ? 'bg-green-500 text-white'
                                                : 'bg-white border border-slate-200 text-slate-400 group-hover/opt:border-primary group-hover/opt:text-primary'
                                                }`}>
                                                {["A", "B", "C", "D"][i]}
                                            </div>
                                            <span className={`text-sm font-bold tracking-tight ${i === q.correctAnswer ? 'text-green-900' : 'text-slate-600'}`}>{opt}</span>
                                            {i === q.correctAnswer && <Check size={16} className="ml-auto text-green-500" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Interaction Hub (Add Question) */}
                        {isAdding ? (
                            <div className="bg-white rounded-[2.5rem] shadow-premium p-10 border-2 border-primary animate-scale-up">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg">
                                        <Plus size={20} />
                                    </div>
                                    <h3 className="font-black text-2xl text-slate-900 tracking-tight">Engineer New Concept</h3>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Universal Prompt</label>
                                        <div className="relative">
                                            <input
                                                className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:border-primary focus:bg-white outline-none font-bold text-slate-900 placeholder:text-slate-300 transition-all shadow-inner"
                                                placeholder="Enter the core question or prompt..."
                                                value={newQuestion.question}
                                                onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })}
                                                autoFocus
                                            />
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">
                                                <Timer size={14} className="text-slate-400" />
                                                <input
                                                    type="number"
                                                    className="w-10 bg-transparent text-xs font-black text-slate-900 outline-none"
                                                    value={newQuestion.timeLimit}
                                                    onChange={e => setNewQuestion({ ...newQuestion, timeLimit: parseInt(e.target.value) })}
                                                    title="Seconds"
                                                />
                                                <span className="text-[8px] font-black text-slate-300 uppercase">SEC</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {newQuestion.options.map((opt, i) => (
                                            <div key={i} className={`p-6 rounded-[2rem] border-2 transition-all duration-500 relative ${newQuestion.correctAnswer === i ? 'border-green-500 bg-green-50/30' : 'border-slate-100 bg-slate-50/30'}`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border transition-all ${newQuestion.correctAnswer === i ? 'bg-green-500 text-white border-green-500' : 'bg-white text-slate-400 border-slate-200'}`}>
                                                            {["A", "B", "C", "D"][i]}
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RESPONSE {i + 1}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => setNewQuestion({ ...newQuestion, correctAnswer: i })}
                                                        className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${newQuestion.correctAnswer === i ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
                                                    >
                                                        {newQuestion.correctAnswer === i ? 'CORRECT' : 'MARK CORRECT'}
                                                    </button>
                                                </div>
                                                <input
                                                    className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-primary transition-all placeholder:text-slate-200"
                                                    placeholder={`Variant ${i + 1}...`}
                                                    value={opt}
                                                    onChange={e => {
                                                        const newOptions = [...newQuestion.options];
                                                        newOptions[i] = e.target.value;
                                                        setNewQuestion({ ...newQuestion, options: newOptions });
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end gap-4 pt-8 border-t border-slate-50">
                                        <button
                                            onClick={() => setIsAdding(false)}
                                            className="px-8 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
                                        >
                                            Discard Draft
                                        </button>
                                        <button
                                            onClick={handleAddQuestion}
                                            disabled={isSaving}
                                            className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-primary hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-50 active:scale-95"
                                        >
                                            {isSaving ? (
                                                <>Processing...</>
                                            ) : (
                                                <><Save size={16} /> Deploy Concept</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="w-full py-16 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black hover:border-primary hover:text-primary hover:bg-slate-50 group transition-all duration-500 flex flex-col items-center justify-center gap-4 animate-slide-up"
                                style={{ animationDelay: '500ms' }}
                            >
                                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all duration-500 transform group-hover:scale-110 shadow-sm group-hover:shadow-lg">
                                    <Plus size={32} />
                                </div>
                                <div className="text-center">
                                    <span className="text-xl tracking-tight block group-hover:translate-y-0.5 transition-transform">Craft New Assessment Module</span>
                                    <span className="text-[10px] uppercase tracking-[0.3em] opacity-60 mt-2 block">Universal Concept Engine</span>
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            </main>

            {/* Float Action Bar (Bottom) - Only shows when questions exist */}
            {questions.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
                    <div className="bg-white/80 backdrop-blur-xl border border-white p-2 rounded-[2rem] shadow-premium flex items-center gap-2">
                        <div className="px-6 py-3">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Architecture</span>
                            <span className="text-xs font-black text-slate-900">{questions.length} Concepts Defined</span>
                        </div>
                        <div className="h-8 w-px bg-slate-100 mx-2" />
                        <button
                            onClick={handlePublish}
                            className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${quiz?.isPublished
                                ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                : 'premium-gradient text-white'
                                }`}
                        >
                            {quiz?.isPublished ? 'Live Now' : 'Launch Session'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
