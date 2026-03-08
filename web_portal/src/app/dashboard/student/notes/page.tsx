"use client";

import React, { useEffect, useState } from "react";
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

        setIsGenerating(true);
        setStatus("Reading file and generating notes with AI...");

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const result = await generateNotes({
                fileData: buffer,
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
            setStatus(`Error: ${error.message || "Something went wrong"}`);
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

    const downloadAsFile = (note: any, format: 'txt' | 'md') => {
        const element = document.createElement("a");
        const file = new Blob([note.content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${note.title}.${format}`;
        document.body.appendChild(element);
        element.click();
    };

    if (loading) return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Loading...</div>;
    if (!user) return <div className="p-8 font-bold text-red-500">Access Denied</div>;

    return (
        <div className="flex min-h-screen bg-[#f8f9fa]">
            <Sidebar
                role="student"
                userName={user.displayName || "Student"}
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Note Viewer Modal */}
            {selectedNote && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-purple-600 text-white">
                            <div>
                                <h2 className="text-xl font-bold uppercase tracking-tight">{selectedNote.title}</h2>
                                <p className="text-xs text-purple-100 mt-1">{selectedNote.sourceFileName}</p>
                            </div>
                            <button
                                onClick={() => setSelectedNote(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                title="Close"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 md:p-12">
                            <div className="prose prose-purple max-w-none">
                                {selectedNote.content.split('\n').map((line: string, i: number) => (
                                    <p key={i} className="mb-4 text-gray-700 leading-relaxed">{line}</p>
                                ))}
                            </div>

                            <div className="mt-12 pt-8 border-t border-gray-100">
                                <h3 className="font-black text-sm text-gray-400 uppercase mb-4 tracking-widest">Key Takeaways</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedNote.keyPoints?.map((point: string, i: number) => (
                                        <div key={i} className="flex gap-3 items-start p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                            <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                                                {i + 1}
                                            </div>
                                            <p className="text-sm font-bold text-gray-700">{point}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => downloadAsFile(selectedNote, 'md')}
                                className="px-6 py-2 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-100 transition-all flex items-center gap-2"
                            >
                                <Download size={18} />
                                Download PDF
                            </button>
                            <button
                                onClick={() => setSelectedNote(null)}
                                className="px-8 py-2 bg-[#46178f] text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1 md:ml-64 p-4 md:p-8">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm">
                    <button onClick={() => setSidebarOpen(true)} className="text-[#46178f]" title="Open Menu">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                    <span className="font-black text-xl text-[#46178f]">AI Notes</span>
                    <div className="w-8 h-8 rounded bg-[#1368ce] flex items-center justify-center text-white font-bold text-sm">
                        {user.displayName?.charAt(0).toUpperCase() || "S"}
                    </div>
                </div>

                <div className="max-w-6xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                            <Sparkles className="text-purple-600" />
                            Smart Study Notes
                        </h1>
                        <p className="text-gray-500">Upload your documents and let AI generate perfect study notes for you.</p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Generation Panel */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <Upload className="text-blue-500" size={20} />
                                    Create New Notes
                                </h2>

                                <div className="space-y-4">
                                    {/* File Dropzone */}
                                    <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${selectedFile ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-purple-400'}`}>
                                        <input
                                            type="file"
                                            id="file-upload"
                                            className="hidden"
                                            accept=".pdf,.docx,.txt"
                                            onChange={handleFileChange}
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            {selectedFile ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <CheckCircle2 className="text-green-500" size={32} />
                                                    <span className="text-sm font-bold text-gray-700 truncate max-w-full px-4 text-center">
                                                        {selectedFile.name}
                                                    </span>
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); setSelectedFile(null); }}
                                                        className="text-xs text-red-500 hover:underline mt-1"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                                                        <FileIcon size={24} />
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-600">Click to upload file</p>
                                                    <p className="text-[10px] text-gray-400">PDF, DOCX, or TXT up to 10MB</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>

                                    {/* Note Type Selection */}
                                    <div>
                                        <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Note Style</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { id: 'summary', label: 'Summary' },
                                                { id: 'detailed', label: 'Detailed' },
                                                { id: 'keyPoints', label: 'Key Points' },
                                                { id: 'qa', label: 'Q&A Style' }
                                            ].map((type) => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setNoteType(type.id as any)}
                                                    className={`p-3 text-xs font-bold rounded-xl border transition-all ${noteType === type.id ? 'bg-purple-600 border-purple-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-purple-200'}`}
                                                >
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleGenerate}
                                        disabled={!selectedFile || isGenerating}
                                        className="w-full py-4 bg-[#46178f] text-white rounded-xl font-black text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="animate-spin" size={18} />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={18} />
                                                Generate Notes
                                            </>
                                        )}
                                    </button>

                                    {status && (
                                        <div className={`p-4 rounded-xl text-xs font-medium text-center ${status.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {status}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notes List */}
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
                                <BookOpen className="text-green-500" size={20} />
                                My Study Library
                            </h2>

                            {loadingNotes ? (
                                <div className="flex justify-center p-12">
                                    <Loader2 className="animate-spin text-purple-600" size={32} />
                                </div>
                            ) : notes.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                                    <div className="text-5xl mb-4">📚</div>
                                    <p className="font-bold text-gray-700">Your library is empty</p>
                                    <p className="text-sm text-gray-400 mt-1">Upload a file to create your first study notes!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {notes.map((note) => (
                                        <div key={note.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="cursor-pointer" onClick={() => setSelectedNote(note)}>
                                                        <h3 className="font-black text-xl text-gray-900 group-hover:text-purple-600 transition-colors uppercase tracking-tight">
                                                            {note.title}
                                                        </h3>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                                                                <Clock size={12} />
                                                                {note.createdAt?.toDate ? note.createdAt.toDate().toLocaleDateString() : 'Recent'}
                                                            </span>
                                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-black rounded uppercase tracking-wider">
                                                                {note.noteType}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setSelectedNote(note)}
                                                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                            title="View Notes"
                                                        >
                                                            <ChevronRight size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => downloadAsFile(note, 'md')}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Download Notes"
                                                        >
                                                            <Download size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(note.id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div
                                                    className="bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                                                    onClick={() => setSelectedNote(note)}
                                                >
                                                    <div className="prose prose-sm max-w-none text-gray-600 line-clamp-6">
                                                        {note.content.split('\n').map((line: string, i: number) => (
                                                            <p key={i} className="mb-2 last:mb-0">{line}</p>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {note.keyPoints?.slice(0, 3).map((point: string, i: number) => (
                                                        <span key={i} className="text-[10px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                                                            • {point}
                                                        </span>
                                                    ))}
                                                    {note.keyPoints?.length > 3 && (
                                                        <span className="text-[10px] font-bold text-purple-600 px-3 py-1 bg-purple-50 rounded-full">
                                                            +{note.keyPoints.length - 3} more
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
