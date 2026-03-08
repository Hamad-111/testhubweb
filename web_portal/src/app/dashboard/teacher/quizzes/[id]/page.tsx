"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";

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
                // Calculate expiry time
                const expiryDate = new Date();
                expiryDate.setMinutes(expiryDate.getMinutes() + timerDuration);
                updateData.expiresAt = expiryDate;
                updateData.timerDuration = timerDuration;
            } else if (!isGoingLive) {
                // Clear timer when stopping
                updateData.expiresAt = null;
            }

            await updateDoc(docRef, updateData);
            setQuiz({ ...quiz, ...updateData });
        } catch (error) {
            console.error("Error toggling publish:", error);
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center text-[#46178f] font-bold">Loading...</div>;
    if (!user) return <div>Access Denied</div>;

    return (
        <div className="flex min-h-screen bg-[#f2f2f2]">
            <Sidebar role="instructor" userName={user.displayName || "Teacher"} />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-4xl mx-auto">
                    <button onClick={() => router.push('/dashboard/teacher')} className="flex items-center text-gray-500 mb-6 hover:text-[#46178f] font-bold">
                        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
                    </button>

                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-[#333] mb-2">{quiz?.title || "Quiz Builder"}</h1>
                            <div className="flex items-center gap-3">
                                <span className="bg-purple-100 text-[#46178f] px-3 py-1 rounded-full text-xs font-bold uppercase">
                                    {quiz?.topic || "Custom Quiz"}
                                </span>
                                <span className="text-gray-500 text-sm font-medium">{questions.length} Questions</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {!quiz?.isPublished && (
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Timer:</label>
                                    <select
                                        value={timerDuration}
                                        onChange={(e) => setTimerDuration(Number(e.target.value))}
                                        className="p-2 text-xs font-bold border rounded bg-white outline-none focus:border-[#46178f]"
                                        title="Select Quiz Duration"
                                    >
                                        <option value={0}>No Limit</option>
                                        <option value={5}>5 Mins</option>
                                        <option value={10}>10 Mins</option>
                                        <option value={30}>30 Mins</option>
                                        <option value={60}>1 Hour</option>
                                    </select>
                                </div>
                            )}
                            <button
                                onClick={handlePublish}
                                className={`px-6 py-2 text-white rounded font-bold shadow-md transition-all active:scale-95 ${quiz?.isPublished ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                            >
                                {quiz?.isPublished ? 'Published ✅' : 'Go Live 🚀'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {questions.map((q, idx) => (
                            <div key={q.id || idx} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#46178f]">
                                <div className="flex justify-between mb-4">
                                    <h3 className="font-bold text-lg text-[#333]">{idx + 1}. {q.question}</h3>
                                    <span className="text-gray-400 text-xs font-bold">{q.timeLimit}s</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {q.options.map((opt, i) => (
                                        <div key={i} className={`p-3 rounded border text-sm flex items-center gap-2 ${i === q.correctAnswer ? 'bg-green-50 border-green-200 text-green-800 font-bold' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${i === q.correctAnswer ? 'bg-green-500 text-white border-green-500' : 'bg-white border-gray-300'}`}>
                                                {["A", "B", "C", "D"][i]}
                                            </div>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {isAdding ? (
                            <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-[#46178f] animate-in fade-in zoom-in-95 duration-200">
                                <h3 className="font-bold text-lg mb-4 text-[#46178f]">New Question</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Question Text</label>
                                        <input
                                            className="w-full p-3 border border-gray-300 rounded focus:border-[#46178f] focus:outline-none focus:ring-1 focus:ring-[#46178f]"
                                            placeholder="e.g. What is the capital of France?"
                                            value={newQuestion.question}
                                            onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })}
                                            autoFocus
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {newQuestion.options.map((opt, i) => (
                                            <div key={i} className={`p-2 rounded border relative ${newQuestion.correctAnswer === i ? 'border-[#46178f] bg-purple-50' : 'border-gray-200'}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <input
                                                        type="radio"
                                                        name="correct"
                                                        checked={newQuestion.correctAnswer === i}
                                                        onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: i })}
                                                        className="accent-[#46178f] w-4 h-4 cursor-pointer"
                                                    />
                                                    <span className="text-xs font-bold text-gray-400 uppercase">Option {["A", "B", "C", "D"][i]}</span>
                                                    {newQuestion.correctAnswer === i && <span className="ml-auto text-xs font-bold text-[#46178f]">Correct Answer</span>}
                                                </div>
                                                <input
                                                    className="w-full p-2 border border-gray-200 rounded text-sm focus:border-[#46178f] focus:outline-none"
                                                    placeholder={`Answer ${i + 1}`}
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
                                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => setIsAdding(false)}
                                            className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAddQuestion}
                                            disabled={isSaving}
                                            className="bg-[#46178f] text-white px-8 py-2 rounded font-bold hover:bg-[#3c147a] transition-colors shadow-lg disabled:opacity-50"
                                        >
                                            {isSaving ? 'Saving...' : 'Save Question'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:border-[#46178f] hover:text-[#46178f] hover:bg-purple-50 transition-all flex items-center justify-center gap-2 group"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-[#46178f] group-hover:text-white flex items-center justify-center transition-colors">
                                    <Plus size={24} />
                                </div>
                                <span className="text-lg">Add New Question</span>
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
