"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    FileText,
    Upload,
    Trash2,
    Download,
    Loader2,
    ChevronRight,
    FileIcon,
    Sparkles,
    CheckCircle2,
    Clock
} from "lucide-react";
import { generateNotes } from "@/app/actions/generateNotes";
import { jsPDF } from "jspdf";

export default function StudentNotes() {
    const { user, loading } = useAuth();
    const [notes, setNotes] = useState<any[]>([]);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingNotes, setLoadingNotes] = useState(true);

    // Upload State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [noteType, setNoteType] = useState<'summary' | 'detailed' | 'keyPoints' | 'qa'>('summary');
    const [status, setStatus] = useState<string>("");
    const [isLimitReached, setIsLimitReached] = useState(false);

    useEffect(() => {
        if (user) {
            fetchNotes();
        }
    }, [user]);

    const fetchNotes = async () => {
        if (!user) return;
        setLoadingNotes(true);
        try {
            const q = query(
                collection(db, "notes"),
                where("userId", "==", user.uid),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotes(list);

            // Check if limit is reached for free users
            if (user.subscriptionStatus !== "active" && list.length >= 3) {
                setIsLimitReached(true);
            } else {
                setIsLimitReached(false);
            }
        } catch (error) {
            console.error("Error fetching notes:", error);
        } finally {
            setLoadingNotes(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setStatus("");
        }
    };

    const handleGenerate = async () => {
        if (!selectedFile || !user) return;

        if (isLimitReached) {
            setStatus("Error: You have reached the limit for free notes. Please upgrade to Pro.");
            return;
        }

        setIsGenerating(true);
        setStatus("Reading file and generating notes with AI...");

        try {
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve, reject) => {
                reader.onload = () => {
                    const base64String = (reader.result as string).split(',')[1];
                    resolve(base64String);
                };
                reader.onerror = reject;
                reader.readAsDataURL(selectedFile);
            });

            const base64Data = await base64Promise;

            const result = await generateNotes({
                fileData: base64Data,
                fileName: selectedFile.name,
                fileType: selectedFile.type,
                noteType: noteType
            });

            // Save to Firestore
            const noteData = {
                userId: user.uid,
                title: result.title || selectedFile.name.split('.')[0],
                content: result.content,
                keyPoints: result.keyPoints || [],
                boldedTerms: result.boldedTerms || [],
                sourceFileName: selectedFile.name,
                noteType: noteType,
                createdAt: Timestamp.now(),
                isPersonal: true,
                sharedWith: []
            };

            const docRef = await addDoc(collection(db, "notes"), noteData);
            setNotes([{ id: docRef.id, ...noteData }, ...notes]);

            setStatus("Notes generated successfully!");
            setSelectedFile(null);
        } catch (error: any) {
            console.error("Error generating notes:", error);
            // Check for specific NEXT.JS error messages
            const errorMessage = error.message || "Something went wrong";
            setStatus(`Error: ${errorMessage}`);

            if (errorMessage.includes("unexpected response")) {
                console.log("Next.js infrastructure error detected. Possible causes: Body size limit, Server crash, or Serialization error.");
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete these notes?")) return;
        try {
            await deleteDoc(doc(db, "notes", id));
            setNotes(notes.filter(n => n.id !== id));
        } catch (error) {
            alert("Failed to delete notes");
        }
    };

    const [selectedNote, setSelectedNote] = useState<any | null>(null);

    const downloadAsPDF = (note: any) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        let cursorY = 20;

        // Title
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text(note.title.toUpperCase(), margin, cursorY);
        cursorY += 10;

        // Subtitle / Date
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        const dateStr = note.createdAt?.toDate ? note.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString();
        doc.text(`Generated on: ${dateStr} | Source: ${note.sourceFileName || 'Manual'}`, margin, cursorY);
        cursorY += 15;

        // Key Takeaways Section
        if (note.keyPoints && note.keyPoints.length > 0) {
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(70, 23, 143); // Purple theme
            doc.text("KEY TAKEAWAYS", margin, cursorY);
            cursorY += 8;

            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0);

            note.keyPoints.forEach((point: string) => {
                const lines = doc.splitTextToSize(`• ${point}`, contentWidth);
                if (cursorY + (lines.length * 6) > 280) {
                    doc.addPage();
                    cursorY = 20;
                }
                doc.text(lines, margin, cursorY);
                cursorY += (lines.length * 7);
            });
            cursorY += 5;
        }

        // Main Content
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(70, 23, 143);
        doc.text("STUDY NOTES", margin, cursorY);
        cursorY += 8;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);

        const contentLines = doc.splitTextToSize(note.content, contentWidth);
        contentLines.forEach((line: string) => {
            if (cursorY > 280) {
                doc.addPage();
                cursorY = 20;
            }
            doc.text(line, margin, cursorY);
            cursorY += 7;
        });

        // Footer
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount} | Generated by TestHub AI`, pageWidth / 2, 290, { align: "center" });
        }

        doc.save(`${note.title.replace(/\s+/g, '_')}_Notes.pdf`);
    };

    if (loading) return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Loading...</div>;
    if (!user) return <div className="p-8 font-bold text-red-500">Access Denied</div>;

    return (
        <div className="flex min-h-screen bg-[#f8f9fa] font-sans selection:bg-purple-200 selection:text-purple-900">
            <Sidebar
                role="student"
                userName={user.displayName || "Student"}
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Note Viewer Modal - Enhanced Glassmorphism */}
            {selectedNote && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
                    <div className="bg-white/90 backdrop-blur-2xl w-full max-w-4xl max-h-[90vh] rounded-[2rem] overflow-hidden flex flex-col shadow-premium border border-white/40">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between premium-gradient text-white">
                            <div className="animate-slide-up">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">{selectedNote.title}</h2>
                                <div className="flex items-center gap-2 mt-2 opacity-80">
                                    <FileText size={14} />
                                    <p className="text-xs font-bold tracking-widest uppercase">{selectedNote.sourceFileName}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedNote(null)}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all hover:rotate-90 duration-300 shadow-inner"
                                title="Close"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-10 md:p-14 custom-scrollbar">
                            <div className="prose prose-purple max-w-none animate-slide-up [animation-delay:100ms]">
                                {selectedNote.content.split('\n').map((line: string, i: number) => (
                                    <p key={i} className="mb-6 text-slate-700 leading-relaxed font-medium text-lg">{line}</p>
                                ))}
                            </div>

                            <div className="mt-16 pt-10 border-t border-slate-100 animate-slide-up [animation-delay:200ms]">
                                <h3 className="font-black text-xs text-slate-400 uppercase mb-8 tracking-[0.3em]">Key Takeaways</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {selectedNote.keyPoints?.map((point: string, i: number) => (
                                        <div key={i} className="flex gap-4 items-start p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                                            <div className="w-8 h-8 rounded-xl premium-gradient text-white flex items-center justify-center shrink-0 text-xs font-black shadow-lg group-hover:scale-110 transition-transform">
                                                {i + 1}
                                            </div>
                                            <p className="text-md font-bold text-slate-800 leading-snug">{point}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-8 border-t border-gray-100 bg-white/50 flex justify-end gap-4">
                            <button
                                onClick={() => downloadAsPDF(selectedNote)}
                                className="px-8 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs text-slate-700 hover:bg-slate-50 hover:shadow-lg transition-all flex items-center gap-3 uppercase tracking-widest"
                            >
                                <Download size={18} className="text-secondary" />
                                Export PDF
                            </button>
                            <button
                                onClick={() => setSelectedNote(null)}
                                className="px-10 py-3 premium-gradient text-white rounded-2xl font-black text-xs hover:shadow-[0_10px_30px_rgba(70,23,143,0.3)] hover:-translate-y-1 transition-all uppercase tracking-widest"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1 md:ml-72 p-6 md:p-12 animate-fade-in overflow-x-hidden">
                {/* Mobile Header - Sleek Glass */}
                <div className="md:hidden flex items-center justify-between mb-8 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-premium">
                    <button onClick={() => setSidebarOpen(true)} className="text-primary p-2 hover:bg-primary/5 rounded-xl transition-colors" title="Open Menu">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                    <span className="font-black text-xl tracking-tighter text-gradient">AI NOTES</span>
                    <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center text-white font-black text-md shadow-lg">
                        {user.displayName?.charAt(0).toUpperCase() || "S"}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto">
                    <header className="mb-12 animate-slide-up">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
                                <Sparkles size={24} />
                            </div>
                            <span className="text-[10px] font-black tracking-[0.3em] text-purple-600 uppercase">Intelligent Learning</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter leading-[0.9]">
                            Smart Study <br />
                            <span className="text-gradient">Assistant.</span>
                        </h1>
                        <p className="text-lg font-medium text-slate-500 max-w-xl leading-relaxed">
                            Transform any document into structured, high-quality study materials in seconds using advanced AI.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                        {/* Generation Panel - Premium Glass Card */}
                        <div className="xl:col-span-4 space-y-8 animate-slide-up [animation-delay:100ms]">
                            <div className="bg-white rounded-[2.5rem] shadow-premium border border-white p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-purple-50 rounded-full blur-3xl group-hover:bg-purple-100 transition-colors duration-700" />

                                <h2 className="text-xl font-black mb-8 flex items-center gap-3 tracking-tight">
                                    <Upload className="text-secondary" size={22} />
                                    Drafting Studio
                                </h2>

                                <div className="space-y-6 relative z-10">
                                    {/* File Dropzone - Modern Design */}
                                    <div className={`relative group/zone transition-all duration-500 ${selectedFile ? 'scale-[1.02]' : ''}`}>
                                        <input
                                            type="file"
                                            id="file-upload"
                                            className="hidden"
                                            accept=".pdf,.docx,.txt"
                                            onChange={handleFileChange}
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className={`
                                                cursor-pointer border-2 border-dashed rounded-[2rem] p-10 text-center block transition-all duration-500
                                                ${selectedFile
                                                    ? 'border-green-400 bg-green-50/30'
                                                    : 'border-slate-200 hover:border-purple-400 hover:bg-purple-50/30'}
                                            `}
                                        >
                                            {selectedFile ? (
                                                <div className="flex flex-col items-center gap-4 animate-scale-in">
                                                    <div className="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                                                        <CheckCircle2 size={32} />
                                                    </div>
                                                    <span className="text-sm font-black text-slate-800 truncate max-w-full px-4">
                                                        {selectedFile.name}
                                                    </span>
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); setSelectedFile(null); }}
                                                        className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest mt-2 px-4 py-2 bg-rose-50 rounded-lg transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-[1.5rem] flex items-center justify-center group-hover/zone:bg-purple-600 group-hover/zone:text-white group-hover/zone:rotate-6 transition-all duration-500">
                                                        <FileIcon size={32} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800 tracking-tight">Deploy your document</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">PDF, DOCX, TXT • MAX 10MB</p>
                                                    </div>
                                                </div>
                                            )}
                                        </label>
                                    </div>

                                    {/* Note Type Selection - Modern Pills */}
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase mb-4 block tracking-[0.3em]">Curation Style</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'summary', label: 'Summary', icon: '📝' },
                                                { id: 'detailed', label: 'Detailed', icon: '📖' },
                                                { id: 'keyPoints', label: 'Key Points', icon: '📍' },
                                                { id: 'qa', label: 'Q&A Style', icon: '❓' }
                                            ].map((type) => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setNoteType(type.id as any)}
                                                    className={`
                                                        p-4 text-xs font-black rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 group/btn
                                                        ${noteType === type.id
                                                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
                                                            : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-primary/30 hover:bg-white'}
                                                    `}
                                                >
                                                    <span className="text-xl group-hover/btn:scale-125 transition-transform">{type.icon}</span>
                                                    <span className="tracking-tight">{type.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleGenerate}
                                        disabled={!selectedFile || isGenerating || isLimitReached}
                                        className="w-full py-5 premium-gradient text-white rounded-[1.5rem] font-black text-sm shadow-[0_15px_40px_rgba(70,23,143,0.3)] hover:shadow-[0_20px_50px_rgba(70,23,143,0.4)] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 uppercase tracking-widest active:scale-95"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                Synthesizing...
                                            </>
                                        ) : isLimitReached ? (
                                            <>
                                                <Sparkles className="opacity-50" size={20} />
                                                Quota Exceeded
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={20} className="animate-pulse" />
                                                Ignite AI
                                            </>
                                        )}
                                    </button>

                                    {isLimitReached && (
                                        <div className="bg-slate-900 p-6 rounded-[2rem] text-center border border-white/10 shadow-2xl relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-transparent pointer-events-none" />
                                            <p className="text-xs font-black text-white mb-4 relative z-10 tracking-tight uppercase">
                                                💎 Join TestHub Pro
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 mb-6 relative z-10 leading-relaxed uppercase tracking-wider">
                                                Unlock infinite AI memory <br /> and premium features.
                                            </p>
                                            <Link
                                                href="/dashboard/subscription"
                                                className="w-full py-3 px-6 bg-white text-primary rounded-xl font-black text-[10px] inline-block hover:scale-105 transition-all shadow-xl uppercase tracking-[0.2em] relative z-10"
                                            >
                                                Ascend to Pro
                                            </Link>
                                        </div>
                                    )}

                                    {status && (
                                        <div className={`p-4 rounded-2xl text-[11px] font-bold text-center animate-fade-in ${status.includes('Error') ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                            {status}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notes List - Modern Masonry-like Layout */}
                        <div className="xl:col-span-8 space-y-8 animate-slide-up [animation-delay:200ms]">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xl font-black flex items-center gap-3 tracking-tight">
                                    <div className="w-2 h-8 bg-primary rounded-full" />
                                    Archive Library
                                </h2>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{notes.length} Collections</span>
                            </div>

                            {loadingNotes ? (
                                <div className="flex flex-col items-center justify-center p-24 bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
                                    <Loader2 className="animate-spin text-primary mb-4" size={40} />
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Retrieving data...</p>
                                </div>
                            ) : notes.length === 0 ? (
                                <div className="bg-white rounded-[2.5rem] border border-dashed border-slate-200 p-24 text-center group hover:border-primary/50 transition-colors">
                                    <div className="text-6xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110">📚</div>
                                    <p className="font-black text-xl text-slate-800 tracking-tight">Your vault is empty</p>
                                    <p className="text-sm font-medium text-slate-400 mt-2">Initialize your first AI extraction above.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                                    {notes.map((note, index) => (
                                        <div
                                            key={note.id}
                                            className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden hover-lift group animate-slide-up"
                                            style={{ animationDelay: `${(index + 3) * 100}ms` } as React.CSSProperties}
                                        >
                                            <div className="p-8">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="cursor-pointer max-w-[70%]" onClick={() => setSelectedNote(note)}>
                                                        <h3 className="font-black text-xl text-slate-900 group-hover:text-primary transition-colors tracking-tighter leading-none mb-3">
                                                            {note.title}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black rounded-lg uppercase tracking-wider border border-slate-200">
                                                                {note.noteType}
                                                            </span>
                                                            <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                                <Clock size={12} />
                                                                {note.createdAt?.toDate ? note.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Just now'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => downloadAsPDF(note)}
                                                            className="p-3 bg-blue-50 text-secondary hover:bg-secondary hover:text-white rounded-xl transition-all shadow-sm hover:shadow-blue-200 active:scale-90"
                                                            title="Export PDF"
                                                        >
                                                            <Download size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(note.id)}
                                                            className="p-3 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-rose-100 active:scale-90"
                                                            title="Purge"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div
                                                    className="bg-slate-50 rounded-2xl p-6 h-40 overflow-hidden border border-slate-100 cursor-pointer relative group-hover:bg-slate-100/50 transition-colors"
                                                    onClick={() => setSelectedNote(note)}
                                                >
                                                    <div className="prose prose-sm max-w-none text-slate-500 font-medium leading-relaxed italic">
                                                        {note.content.substring(0, 300)}...
                                                    </div>
                                                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-50 to-transparent transition-colors group-hover:from-slate-100/50" />
                                                    <div className="absolute bottom-4 right-6 p-2 bg-white rounded-lg shadow-sm group-hover:translate-x-1 transition-transform">
                                                        <ChevronRight size={16} className="text-primary" />
                                                    </div>
                                                </div>

                                                <div className="mt-6 flex flex-wrap gap-2">
                                                    {note.keyPoints?.slice(0, 2).map((point: string, i: number) => (
                                                        <span key={i} className="text-[9px] font-bold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm truncate max-w-[150px]">
                                                            • {point}
                                                        </span>
                                                    ))}
                                                    {note.keyPoints?.length > 2 && (
                                                        <span className="text-[9px] font-black text-primary px-3 py-1.5 bg-purple-50 rounded-full border border-purple-100">
                                                            +{note.keyPoints.length - 2} insights
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function BookOpen(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    );
}
