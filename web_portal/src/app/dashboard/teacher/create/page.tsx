"use client";
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateQuizQuestions } from "@/app/actions/generateQuiz";
import { ArrowLeft, Sparkles, Edit3, Clipboard, Rocket, Check, FileText, Upload, Plus, ChevronRight } from "lucide-react";
import SubscriptionModal from "@/components/SubscriptionModal";

export default function CreateQuiz() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [mode, setMode] = useState<'selection' | 'manual' | 'ai'>('selection');
    const [title, setTitle] = useState("");
    const [topic, setTopic] = useState("");
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

        if (mode === 'ai' && user.subscriptionStatus !== 'active') {
            setShowSubscriptionModal(true);
            return;
        }

        setIsCreating(true);
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();

            if (!userData || userData.role !== 'instructor' || userData.status !== 'active') {
                throw new Error(`Permission Denied: You must be an active instructor.`);
            }

            const generatePIN = async () => {
                let pin = "";
                let isUnique = false;
                while (!isUnique) {
                    pin = Math.floor(100000 + Math.random() * 900000).toString();
                    const checkDoc = await getDoc(doc(db, "quizzes", pin));
                    if (!checkDoc.exists()) isUnique = true;
                }
                return pin;
            };

            const pin = await generatePIN();
            setGeneratedPin(pin);

            const quizData: any = {
                title,
                description: "",
                mode: "live",
                instructorId: user.uid,
                instructorName: userData.name || user.displayName || "Teacher",
                createdAt: serverTimestamp(),
                isPublished: true,
                questions: [],
                type: mode,
                pin: pin,
                id: pin,
                participantCount: 0
            };

            await setDoc(doc(db, "quizzes", pin), quizData);

            if (mode === 'ai') {
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
                    } catch (error) {
                        console.error("PDF Parsing Error:", error);
                    }
                    setIsParsing(false);
                }

                const generatedQuestions = await generateQuizQuestions({
                    topic: finalTopic,
                    difficulty,
                    questionCount,
                    contextData
                });

                await updateDoc(doc(db, "quizzes", pin), {
                    questions: generatedQuestions,
                    isAiGenerated: true,
                    topic: finalTopic,
                    difficulty: difficulty,
                    questionCount: questionCount,
                    publishedAt: serverTimestamp()
                });
            }

            setIsGenerated(true);
        } catch (error: any) {
            console.error("Error creating quiz:", error);
            alert(`Failed: ${error.message}`);
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

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f8f9fa]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return <div className="p-8 font-black uppercase tracking-widest text-red-500">Access Denied</div>;

    return (
        <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
            <Sidebar role="instructor" userName={user.displayName || "Teacher"} />

            <SubscriptionModal isOpen={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} />

            <main className="flex-1 md:ml-72 p-6 md:p-12 w-full animate-fade-in">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-12 animate-slide-up">
                        {mode !== 'selection' && (
                            <button
                                onClick={() => setMode('selection')}
                                className="inline-flex items-center text-[10px] font-black tracking-[0.2em] text-slate-400 mb-6 hover:text-primary transition-colors uppercase group"
                            >
                                <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                                Return to Blueprint Selection
                            </button>
                        )}
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                            {mode === 'selection' ? 'Architect New Curriculum' :
                                mode === 'ai' ? 'AI-Driven Generation' : 'Manual Manifestation'}
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">
                            {mode === 'selection' ? 'Select your primary methodology for curriculum deployment.' :
                                mode === 'ai' ? 'Synthesize high-fidelity assessments using advanced neural intelligence.' :
                                    'Construct granular educational experiences with complete creative control.'}
                        </p>
                    </div>

                    {/* Mode Selection */}
                    {mode === 'selection' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up [animation-delay:200ms]">
                            <button
                                onClick={() => setMode('manual')}
                                className="group relative bg-white p-10 rounded-[2.5rem] shadow-premium hover:shadow-2xl transition-all duration-500 border border-white hover:-translate-y-2 text-left"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                    <Edit3 size={32} strokeWidth={2.5} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Manual Construct</h2>
                                <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8">
                                    Build your curriculum question by question. Ideal for precise material control.
                                </p>
                                <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                    Initialize Builder <ChevronRight size={14} strokeWidth={3} />
                                </div>
                            </button>

                            <button
                                onClick={() => setMode('ai')}
                                className="group relative bg-white p-10 rounded-[2.5rem] shadow-premium hover:shadow-2xl transition-all duration-500 border border-white hover:-translate-y-2 text-left overflow-hidden"
                            >
                                <div className="absolute top-6 right-6 px-3 py-1 bg-gradient-to-r from-primary to-blue-600 text-white text-[9px] font-black rounded-lg shadow-lg tracking-widest uppercase">
                                    Neural AI
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-purple-50 text-primary flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                    <Sparkles size={32} strokeWidth={2.5} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">AI Synthesis</h2>
                                <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8">
                                    Deploy advanced AI to generate complete assessments from topics or documents.
                                </p>
                                <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                                    Engage Synthesis <ChevronRight size={14} strokeWidth={3} />
                                </div>
                            </button>
                        </div>
                    )}

                    {/* AI Form */}
                    {mode === 'ai' && (
                        <div className="bg-white rounded-[2.5rem] shadow-premium border border-white p-10 animate-slide-up [animation-delay:200ms]">
                            <form onSubmit={handleCreate} className="space-y-8">
                                <div className="grid grid-cols-1 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Curriculum Identity</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold text-slate-700 placeholder:text-slate-300"
                                            placeholder="e.g. Advanced Quantum Mechanics"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Objective or Document</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold text-slate-700 placeholder:text-slate-300"
                                                placeholder="Enter specific topic..."
                                                required={!selectedFile}
                                            />
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    accept=".pdf,.txt"
                                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] group-hover:bg-white transition-all">
                                                    <Upload size={18} className="text-primary" />
                                                    <span className="font-bold text-slate-400 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                                        {selectedFile ? selectedFile.name : 'Upload PDF Source'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Complexity Level</label>
                                        <select
                                            value={difficulty}
                                            onChange={(e) => setDifficulty(e.target.value)}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-black text-slate-700 appearance-none cursor-pointer"
                                            title="Difficulty"
                                        >
                                            <option value="easy">Introductory</option>
                                            <option value="medium">Intermediate</option>
                                            <option value="hard">Advanced Mastery</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Node Count</label>
                                        <input
                                            type="number"
                                            value={questionCount}
                                            onChange={(e) => setQuestionCount(Number(e.target.value))}
                                            min={1}
                                            max={20}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-black text-slate-700"
                                            title="Questions"
                                        />
                                    </div>
                                </div>

                                <div className="pt-8 space-y-6">
                                    {isCreating && generatedPin && (
                                        <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10 text-center animate-pulse">
                                            <p className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-4">Lobby Active • Generating Neural Nodes</p>
                                            <div className="flex items-center justify-center gap-4">
                                                <div className="text-4xl font-black text-slate-900 tracking-[0.5em] bg-white px-8 py-4 rounded-2xl border border-slate-100 shadow-sm ml-4">
                                                    {generatedPin}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleCopyPin}
                                                    className={`p-4 rounded-2xl transition-all shadow-sm ${isCopied ? "bg-green-500 text-white" : "bg-white text-slate-400 hover:text-primary"}`}
                                                >
                                                    {isCopied ? <Check size={20} strokeWidth={3} /> : <Clipboard size={20} strokeWidth={2.5} />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col items-center gap-4">
                                        {isGenerated ? (
                                            <button
                                                type="button"
                                                onClick={() => router.push(`/dashboard/teacher/quizzes/${generatedPin}`)}
                                                className="w-full py-5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-lg shadow-green-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 animate-bounce"
                                            >
                                                <Rocket size={20} strokeWidth={3} />
                                                Initialize Blueprint Builder
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                disabled={isCreating || isParsing}
                                                className="w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-premium hover:bg-black hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 group"
                                            >
                                                {isParsing ? 'Deciphering Source...' : isCreating ? 'Synthesizing Nodes...' : (
                                                    <>
                                                        <Sparkles size={20} strokeWidth={3} className="text-primary group-hover:rotate-12 transition-transform" />
                                                        Manifest AI Assessment
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Manual Form */}
                    {mode === 'manual' && (
                        <div className="bg-white rounded-[2.5rem] shadow-premium border border-white p-10 animate-slide-up [animation-delay:200ms]">
                            <form onSubmit={handleCreate} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Curriculum Identity</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all font-bold text-slate-700 placeholder:text-slate-300"
                                        placeholder="e.g. Critical Thinking Seminar"
                                        required
                                    />
                                </div>

                                <div className="flex items-start gap-4 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-blue-800">
                                    <div className="mt-1"><Plus size={16} strokeWidth={3} className="text-blue-500" /></div>
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                        Protocol Initiated: Direct node construction will follow shell establishment.
                                    </p>
                                </div>

                                <div className="pt-4">
                                    {isGenerated ? (
                                        <button
                                            type="button"
                                            onClick={() => router.push(`/dashboard/teacher/quizzes/${generatedPin}`)}
                                            className="w-full py-5 bg-green-500 text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-lg shadow-green-200 hover:scale-[1.02] transition-all flex items-center justify-center gap-4 animate-bounce"
                                        >
                                            <Rocket size={20} strokeWidth={3} />
                                            Initialize Blueprint Builder
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={isCreating}
                                            className="w-full py-5 bg-blue-600 text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-premium hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-4"
                                        >
                                            <Plus size={20} strokeWidth={3} />
                                            Establish Shell & Construct
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
