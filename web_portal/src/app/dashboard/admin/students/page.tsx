"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Search, Mail, BookOpen, Award } from "lucide-react";

export default function StudentManagement() {
    const { user, loading } = useAuth();
    const [students, setStudents] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchStudents = async () => {
        try {
            const q = query(collection(db, "users"), where("role", "==", "student"));
            const snapshot = await getDocs(q);
            const list: any[] = [];
            snapshot.forEach(doc => {
                list.push({ id: doc.id, ...doc.data() });
            });
            setStudents(list);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (!loading && user?.role === "admin") {
            fetchStudents();
        }
    }, [user, loading]);

    const filteredStudents = students.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading || loadingData) return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Loading...</div>;
    if (!user || user.role !== "admin") return <div className="p-8">Access Denied</div>;

    return (
        <div className="flex min-h-screen bg-[#f8f9fa]">
            <Sidebar role="admin" userName={user.displayName || "Admin"} />

            <main className="flex-1 ml-64 p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1F2937]">Student Management</h1>
                        <p className="text-gray-500 mt-1">Monitor and support student progress.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search students by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                            />
                        </div>
                    </div>

                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold text-gray-700 text-sm">Student</th>
                                <th className="px-6 py-4 font-bold text-gray-700 text-sm">Email</th>
                                <th className="px-6 py-4 font-bold text-gray-700 text-sm">Level</th>
                                <th className="px-6 py-4 font-bold text-gray-700 text-sm italic">Stats</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No students found matching your search.</td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                                    {student.name?.charAt(0) || "S"}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-gray-800 block">{student.name || "Anonymous"}</span>
                                                    <span className="text-[10px] text-gray-400">ID: {student.id.substring(0, 8)}...</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} className="text-gray-400" />
                                                {student.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[11px] font-bold">
                                                {student.grade || "Primary"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4 text-gray-400">
                                                <div className="flex items-center gap-1" title="Quizzes Taken">
                                                    <BookOpen size={14} />
                                                    <span className="text-xs font-bold text-gray-600">{student.quizzesTaken || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1" title="Average Score">
                                                    <Award size={14} />
                                                    <span className="text-xs font-bold text-gray-600">{student.avgScore || 0}%</span>
                                                </div>
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
