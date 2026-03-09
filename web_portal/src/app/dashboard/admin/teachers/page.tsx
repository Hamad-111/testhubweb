"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MoreVertical, UserX, UserCheck, Trash2, Mail } from "lucide-react";

export default function TeacherManagement() {
    const { user, loading } = useAuth();
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const fetchTeachers = async () => {
        try {
            const q = query(collection(db, "users"), where("role", "==", "instructor"));
            const snapshot = await getDocs(q);
            const list: any[] = [];
            snapshot.forEach(doc => {
                list.push({ id: doc.id, ...doc.data() });
            });
            setTeachers(list);
        } catch (error) {
            console.error("Error fetching teachers:", error);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (!loading && user?.role === "admin") {
            fetchTeachers();
        }
    }, [user, loading]);

    const toggleStatus = async (teacherId: string, currentStatus: string) => {
        const newStatus = currentStatus === "active" ? "suspended" : "active";
        try {
            const updates: any = { status: newStatus };
            if (newStatus === "active" && currentStatus === "pending") {
                updates.approvedAt = new Date().toISOString(); // Using ISO string to match Flutter's preference for some fields if needed, or serverTimestamp for others.
            }

            await updateDoc(doc(db, "users", teacherId), updates);
            setTeachers(teachers.map(t => t.id === teacherId ? { ...t, ...updates } : t));
        } catch (error: any) {
            console.error("Error updating teacher status:", error);
            alert(`Failed to update status: ${error.message || "Unknown error"}`);
        }
    };

    if (loading || loadingData) return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Loading...</div>;
    if (!user || user.role !== "admin") return <div className="p-8">Access Denied</div>;

    return (
        <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
            <Sidebar role="admin" userName={user.displayName || "Admin"} />

            <main className="flex-1 md:ml-72 p-6 md:p-12 w-full animate-fade-in">
                {/* Header & Stats Overview */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 animate-slide-up">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Instructor Hub</h1>
                        <p className="text-slate-500 font-medium mt-1">Review credentials and manage access for the instructional ecosystem.</p>
                    </div>
                </div>

                {/* Teachers Grid/Table Container */}
                <div className="bg-white rounded-[2.5rem] shadow-premium border border-white overflow-hidden animate-slide-up [animation-delay:200ms]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Instructor Profile</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Channels</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Administrative Ops</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {teachers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-24 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-40">
                                                <span className="text-6xl">👥</span>
                                                <p className="text-slate-500 font-black text-sm uppercase tracking-widest">No instructional entities found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    teachers.map((teacher, index) => (
                                        <tr key={teacher.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-110 group-hover:premium-gradient group-hover:text-white transition-all duration-500">
                                                        {teacher.name?.charAt(0).toUpperCase() || teacher.email?.charAt(0).toUpperCase() || "T"}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors text-base">{teacher.name || "Anonymous Instructor"}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Verified Educator</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 group/mail">
                                                    <div className="p-2 bg-slate-100 text-slate-400 rounded-lg group-hover/mail:bg-primary/10 group-hover/mail:text-primary transition-colors">
                                                        <Mail size={14} strokeWidth={3} />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-600 tracking-tight">{teacher.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-1000 ${teacher.status === "active" ? "bg-green-500" :
                                                        teacher.status === "pending" ? "bg-amber-500" :
                                                            "bg-red-500"
                                                        }`} />
                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border ${teacher.status === "active" ? "bg-green-50/50 text-green-600 border-green-100" :
                                                        teacher.status === "pending" ? "bg-amber-50/50 text-amber-600 border-amber-100" :
                                                            "bg-red-50/50 text-red-600 border-red-100"
                                                        }`}>
                                                        {teacher.status || "Active"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-3 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                    {teacher.status === "pending" ? (
                                                        <>
                                                            <button
                                                                onClick={() => toggleStatus(teacher.id, "pending")}
                                                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-md hover:shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2"
                                                                title="Grant Access"
                                                            >
                                                                <UserCheck size={16} strokeWidth={3} />
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (confirm("Reject this instructional request?")) {
                                                                        await deleteDoc(doc(db, "users", teacher.id));
                                                                        setTeachers(teachers.filter(t => t.id !== teacher.id));
                                                                    }
                                                                }}
                                                                className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95 flex items-center gap-2"
                                                                title="Deny Access"
                                                            >
                                                                <Trash2 size={16} strokeWidth={3} />
                                                                Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => toggleStatus(teacher.id, teacher.status || "active")}
                                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-sm ${teacher.status === "suspended"
                                                                ? "bg-green-50 text-green-600 border border-green-100 hover:bg-green-100"
                                                                : "bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100"
                                                                }`}
                                                            title={teacher.status === "suspended" ? "Re-Activate" : "De-Activate"}
                                                        >
                                                            {teacher.status === "suspended" ? (
                                                                <><UserCheck size={16} strokeWidth={3} /> Activate</>
                                                            ) : (
                                                                <><UserX size={16} strokeWidth={3} /> Suspend</>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Insight */}
                <div className="mt-12 text-center animate-fade-in [animation-delay:800ms]">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] bg-white px-8 py-3 rounded-2xl border border-slate-50 shadow-sm">
                        Instructional Integrity Protocol v1.2.0 • {teachers.length} Active Records
                    </span>
                </div>
            </main>
        </div>
    );
}
