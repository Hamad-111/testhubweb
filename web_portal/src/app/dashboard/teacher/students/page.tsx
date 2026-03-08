"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Search, Mail, BookOpen, Award, User as UserIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TeacherStudentManagement() {
    const { user, loading } = useAuth();
    const [students, setStudents] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchStudents = async () => {
        try {
            // Fetch all users with role 'student'
            // In a larger app, we might want to filter this by students who have taken this teacher's quizzes,
            // but for now, the requirement is "all the students who registered".
            const q = query(
                collection(db, "users"),
                where("role", "==", "student"),
                orderBy("createdAt", "desc"),
                limit(100)
            );
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
        if (!loading && user) {
            fetchStudents();
        }
    }, [user, loading]);

    const filteredStudents = students.filter(s =>
        (s.displayName || s.name || "Anonymous").toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading || loadingData) return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Loading...</div>;
    if (!user) return <div className="p-8">Access Denied</div>;

    return (
        <div className="flex min-h-screen bg-[#f2f2f2]">
            <Sidebar role="instructor" userName={user.displayName || "Teacher"} />

            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    <Link href="/dashboard/teacher" className="flex items-center text-gray-500 mb-6 hover:text-[#46178f] font-bold transition-colors">
                        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
                    </Link>

                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-[#333]">Student Directory</h1>
                            <p className="text-gray-500 mt-1">View all students registered on the platform.</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <div className="relative max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#46178f]/20 focus:border-[#46178f] transition-all font-medium text-sm shadow-sm"
                                    title="Search students"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 font-black text-[#333] text-xs uppercase tracking-wider">Student</th>
                                        <th className="px-6 py-4 font-black text-[#333] text-xs uppercase tracking-wider">Contact Info</th>
                                        <th className="px-6 py-4 font-black text-[#333] text-xs uppercase tracking-wider">Performance</th>
                                        <th className="px-6 py-4 font-black text-[#333] text-xs uppercase tracking-wider">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center opacity-40">
                                                    <UserIcon size={48} className="mb-2" />
                                                    <p className="font-bold text-gray-500">No students found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((student) => {
                                            const name = student.displayName || student.name || "Anonymous";
                                            const joinDate = student.createdAt?.toDate ? student.createdAt.toDate().toLocaleDateString() : 'N/A';

                                            return (
                                                <tr key={student.id} className="hover:bg-[#46178f]/5 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#46178f] flex items-center justify-center font-black text-lg border-2 border-purple-200 group-hover:scale-110 transition-transform shadow-sm">
                                                                {name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <span className="font-bold text-[#333] block text-base">{name}</span>
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {student.id.substring(0, 8)}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-gray-600 font-bold text-sm">
                                                            <Mail size={16} className="text-gray-400" />
                                                            {student.email || 'No email provided'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-6">
                                                            <div className="flex items-center gap-1.5" title="Quizzes Taken">
                                                                <BookOpen size={16} className="text-blue-500" />
                                                                <span className="text-sm font-black text-gray-700">{student.quizzesTaken || 0}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5" title="Total Score">
                                                                <Award size={16} className="text-[#ffa602]" />
                                                                <span className="text-sm font-black text-gray-700">{student.totalScore || 0}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{joinDate}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-6 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                        Total {filteredStudents.length} {filteredStudents.length === 1 ? 'Student' : 'Students'}
                    </div>
                </div>
            </main>
        </div>
    );
}
