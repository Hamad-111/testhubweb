"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateQuizQuestions } from "@/app/actions/generateQuiz";

import SubscriptionModal from "@/components/SubscriptionModal";

export default function CreateQuiz() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [mode, setMode] = useState<'selection' | 'manual' | 'ai'>('selection');
    const [title, setTitle] = useState("");
    const [topic, setTopic] = useState(""); // For AI only
    const [difficulty, setDifficulty] = useState("medium");
    const [questionCount, setQuestionCount] = useState(5);
    const [isCreating, setIsCreating] = useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [generatedPin, setGeneratedPin] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [isGenerated, setIsGenerated] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Check for subscription if AI mode is selected
        if (mode === 'ai' && user.subscriptionStatus !== 'active') {
            setShowSubscriptionModal(true);
            return;
        }

        setIsCreating(true);
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();

            if (!userData || userData.role !== 'instructor' || userData.status !== 'active') {
                throw new Error(`Permission Denied: You must be an active instructor. Current role: ${userData?.role}, Status: ${userData?.status}`);
            }

            // Generate a 6-digit PIN (matching Flutter app)
            const generatePIN = async () => {
                let pin = "";
                let isUnique = false;
                while (!isUnique) {
                    pin = Math.floor(100000 + Math.random() * 900000).toString();
                    const checkDoc = await getDoc(doc(db, "quizzes", pin));
                    if (!checkDoc.exists()) {
                        isUnique = true;
                    }
                }
                return pin;
            };

            const pin = await generatePIN();
            setGeneratedPin(pin);

            const quizData: any = {
                title,
                description: "", // Added default description
                mode: "live", // Use live mode so students can join lobby
                instructorId: user.uid,
                instructorName: userData.name || user.displayName || "Unknown", // Use verified name
                createdAt: serverTimestamp(),
                isPublished: true, // Publish immediately so students can join with PIN
                questions: [],
                type: mode,
                pin: pin,
                id: pin, // Added ID field for Flutter app compatibility
                participantCount: 0
            };

            // Save the quiz shell immediately so the PIN becomes valid across the platform
            await setDoc(doc(db, "quizzes", pin), quizData);

            if (mode === 'ai') {
                if (!title || (!topic && !selectedFile)) {
                    throw new Error("Please provide a title, and either a topic or document for AI generation.");
                }

                const finalTopic = topic || selectedFile?.name || 'Document Quiz';
                let contextData = '';

                if (selectedFile) {
                    setIsParsing(true);
                    const formData = new FormData();
                    formData.append('file', selectedFile);

                    try {
                        const parseRes = await fetch('/api/parse-pdf', {
                            method: 'POST',
                            body: formData
                        });

                        if (!parseRes.ok) throw new Error('Failed to parse document');

                        const parseData = await parseRes.json();
                        contextData = parseData.text;
                    } catch (parseError) {
                        console.error("PDF Parsing Error:", parseError);
                    }
                    setIsParsing(false);
                }

                // Connect to AI service
                const generatedQuestions = await generateQuizQuestions({
                    topic: finalTopic,
                    difficulty,
                    questionCount,
                    contextData
                });

                // Update the existing document with generated questions
                await updateDoc(doc(db, "quizzes", pin), {
                    questions: generatedQuestions,
                    isAiGenerated: true,
                    topic: finalTopic,
                    difficulty: difficulty,
                    questionCount: questionCount,
                    publishedAt: serverTimestamp()
                });
            }

            // Set generated state instead of redirecting
            setIsGenerated(true);
        } catch (error: any) {
            console.error("Error creating quiz:", error);
            alert(`Failed to create quiz.\n\nError details: ${error.message}\n\nPlease check your internet connection or report this to support.`);
        } finally {
            setIsCreating(false);
        }
    };

    const handleCopyPin = () => {
        if (!generatedPin) return;
        navigator.clipboard.writeText(generatedPin);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (loading) return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Loading...</div>;
    if (!user) return <div>Access Denied</div>;

    return (
        <div className="flex min-h-screen bg-[#f2f2f2]">
            <Sidebar role="instructor" userName={user.displayName || "Teacher"} />

            <SubscriptionModal
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
            />

            <main className="flex-1 ml-64 p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        {mode !== 'selection' && (
                            <button
                                onClick={() => setMode('selection')}
                                className="text-gray-500 hover:text-[#46178f] font-bold"
                            >
                                ← Back
                            </button>
                        )}
                        <h1 className="text-3xl font-black text-[#333]">
                            {mode === 'selection' ? 'Create a New Quiz' :
                                mode === 'ai' ? 'Generate with AI' : 'Create from Scratch'}
                        </h1>
                    </div>

                    {/* Mode Selection */}
                    {mode === 'selection' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button
                                onClick={() => setMode('manual')}
                                className="bg-white p-8 rounded-xl shadow-sm border-2 border-transparent hover:border-[#46178f] hover:shadow-md transition-all text-left group"
                            >
                                <div className="w-16 h-16 rounded-full bg-blue-100 text-[#1368ce] flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                                    ✏️
                                </div>
                                <h2 className="text-xl font-bold text-[#333] mb-2">Create from Scratch</h2>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Build your quiz manually, question by question. Perfect for existing material.
                                </p>
                            </button>

                            <button
                                onClick={() => setMode('ai')}
                                className="bg-white p-8 rounded-xl shadow-sm border-2 border-transparent hover:border-[#46178f] hover:shadow-md transition-all text-left group relative overflow-hidden"
                            >
                                {user.subscriptionStatus !== 'active' && (
                                    <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-1 rounded shadow-sm">
                                        PREMIUM
                                    </div>
                                )}
                                <div className="w-16 h-16 rounded-full bg-purple-100 text-[#46178f] flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                                    ✨
                                </div>
                                <h2 className="text-xl font-bold text-[#333] mb-2">Generate with AI</h2>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Enter a topic and let our AI generate a complete quiz for you in seconds.
                                </p>
                            </button>
                        </div>
                    )}

                    {/* AI Form */}
                    {mode === 'ai' && (
                        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
                            <form onSubmit={handleCreate} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Quiz Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded focus:border-[#46178f] focus:ring-1 focus:ring-[#46178f] outline-none transition"
                                        placeholder="e.g. Introduction to Physics"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Topic (for AI generation)</label>
                                    <input
                                        type="text"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded focus:border-[#46178f] focus:ring-1 focus:ring-[#46178f] outline-none transition"
                                        placeholder="e.g. Newton's Laws"
                                        required={!selectedFile}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Leave blank if uploading a comprehensive document below.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Or Upload Document (PDF/Text)</label>
                                    <div className="w-full relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center">
                                        <input
                                            type="file"
                                            accept=".pdf,.txt,.doc,.docx"
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="text-gray-500">
                                            {selectedFile ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="text-3xl mb-2">📄</span>
                                                    <span className="font-bold text-[#46178f]">{selectedFile.name}</span>
                                                    <span className="text-xs text-gray-400 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <span className="text-3xl mb-2">📁</span>
                                                    <span className="font-medium text-[#46178f]">Click to upload or drag and drop</span>
                                                    <span className="text-xs text-gray-400 mt-1">PDF, TXT, DOC up to 10MB</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {selectedFile && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedFile(null)}
                                            className="text-xs text-red-500 hover:text-red-700 font-medium mt-2"
                                        >
                                            Remove File
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
                                        <select
                                            value={difficulty}
                                            onChange={(e) => setDifficulty(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded focus:border-[#46178f] focus:ring-1 focus:ring-[#46178f] outline-none transition bg-white"
                                            title="Difficulty Level"
                                        >
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Number of Questions</label>
                                        <input
                                            id="questionCount"
                                            type="number"
                                            value={questionCount}
                                            onChange={(e) => setQuestionCount(Number(e.target.value))}
                                            min={1}
                                            max={20}
                                            className="w-full p-3 border border-gray-300 rounded focus:border-[#46178f] focus:ring-1 focus:ring-[#46178f] outline-none transition"
                                            title="Number of Questions"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 space-y-4">
                                    {isCreating && generatedPin && (
                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center animate-pulse">
                                            <p className="text-purple-800 font-bold mb-1">Quiz Lobby Created!</p>
                                            <p className="text-xs text-purple-600 mb-2">Students can join now while questions generate:</p>
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="text-3xl font-black text-[#46178f] tracking-widest bg-white inline-block px-6 py-2 rounded-lg border-2 border-purple-300">
                                                    {generatedPin}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleCopyPin}
                                                    className={`p-2 rounded-lg border transition-all ${isCopied
                                                        ? "bg-green-500 border-green-600 text-white"
                                                        : "bg-white border-purple-200 text-[#46178f] hover:bg-purple-100"
                                                        }`}
                                                    title="Copy PIN"
                                                >
                                                    {isCopied ? "✓" : "📋"}
                                                </button>
                                            </div>
                                            {isCopied && <p className="text-[10px] text-green-600 mt-1 font-bold">Copied to clipboard!</p>}
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3">
                                        {isGenerated ? (
                                            <button
                                                type="button"
                                                onClick={() => router.push(`/dashboard/teacher/quizzes/${generatedPin}`)}
                                                className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg flex items-center gap-2 animate-bounce"
                                            >
                                                🚀 Go to Quiz Builder
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                disabled={isCreating || isParsing}
                                                className="px-8 py-3 bg-[#46178f] text-white rounded-lg font-bold hover:bg-[#3c147a] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {isParsing ? 'Reading Document...' : isCreating ? 'Generating Questions...' : '✨ Generate Quiz'}
                                            </button>
                                        )}
                                    </div>
                                    {isGenerated && (
                                        <p className="text-center text-green-600 font-bold animate-in fade-in slide-in-from-top-2">
                                            ✅ Quiz successfully generated! You can now proceed to the builder.
                                        </p>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Manual Form */}
                    {mode === 'manual' && (
                        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
                            <form onSubmit={handleCreate} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Quiz Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded focus:border-[#46178f] focus:ring-1 focus:ring-[#46178f] outline-none transition"
                                        placeholder="e.g. Match the Elements"
                                        required
                                    />
                                </div>

                                <div className="p-4 bg-blue-50 rounded border border-blue-100 text-sm text-blue-800">
                                    ℹ️ You'll be able to add questions manually in the next step.
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    {isGenerated ? (
                                        <button
                                            type="button"
                                            onClick={() => router.push(`/dashboard/teacher/quizzes/${generatedPin}`)}
                                            className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg flex items-center gap-2 animate-bounce"
                                        >
                                            🚀 Go to Quiz Builder
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={isCreating}
                                            className="px-8 py-3 bg-[#1368ce] text-white rounded-lg font-bold hover:bg-[#0f54a8] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isCreating ? 'Creating...' : 'Create & Add Questions'}
                                        </button>
                                    )}
                                </div>
                                {isGenerated && (
                                    <p className="text-center text-green-600 font-bold mt-4 animate-in fade-in slide-in-from-top-2">
                                        ✅ Quiz shell created! Click above to add questions.
                                    </p>
                                )}
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
