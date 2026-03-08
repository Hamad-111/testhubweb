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
        <div className="flex min-h-screen bg-[#f8f9fa]">
            <Sidebar role="admin" userName={user.displayName || "Admin"} />

            <main className="flex-1 ml-64 p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1F2937]">Teacher Management</h1>
                        <p className="text-gray-500 mt-1">Review and manage instructor access.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold text-gray-700 text-sm">Instructor</th>
                                <th className="px-6 py-4 font-bold text-gray-700 text-sm">Email</th>
                                <th className="px-6 py-4 font-bold text-gray-700 text-sm">Status</th>
                                <th className="px-6 py-4 font-bold text-gray-700 text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {teachers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No instructors found.</td>
                                </tr>
                            ) : (
                                teachers.map((teacher) => (
                                    <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                                                    {teacher.name?.charAt(0) || teacher.email?.charAt(0) || "T"}
                                                </div>
                                                <span className="font-bold text-gray-800">{teacher.name || "Untitled"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} className="text-gray-400" />
                                                {teacher.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${teacher.status === "active" ? "bg-green-100 text-green-700" :
                                                teacher.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                                    "bg-red-100 text-red-700"
                                                }`}>
                                                {teacher.status || "Active"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {teacher.status === "pending" ? (
                                                    <>
                                                        <button
                                                            onClick={() => toggleStatus(teacher.id, "pending")}
                                                            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                                            title="Approve"
                                                        >
                                                            <UserCheck size={18} />
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (confirm("Are you sure you want to reject this request?")) {
                                                                    await deleteDoc(doc(db, "users", teacher.id));
                                                                    setTeachers(teachers.filter(t => t.id !== teacher.id));
                                                                }
                                                            }}
                                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                            title="Reject"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => toggleStatus(teacher.id, teacher.status || "active")}
                                                        className={`p-2 rounded-lg transition-colors ${teacher.status === "suspended" ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                                                            }`}
                                                        title={teacher.status === "suspended" ? "Activate" : "Suspend"}
                                                    >
                                                        {teacher.status === "suspended" ? <UserCheck size={18} /> : <UserX size={18} />}
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
            </main>
        </div>
    );
}
