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
        <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
            <Sidebar role="instructor" userName={user.displayName || "Teacher"} />

            <main className="flex-1 md:ml-72 p-6 md:p-12 w-full animate-fade-in">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumbs & Navigation */}
                    <Link href="/dashboard/teacher" className="inline-flex items-center text-[10px] font-black tracking-[0.2em] text-slate-400 mb-8 hover:text-primary transition-colors uppercase group">
                        <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Command Center
                    </Link>

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 animate-slide-up">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Student Directory</h1>
                            <p className="text-slate-500 font-medium mt-1">Manage enrollments and monitor academic performance.</p>
                        </div>

                        {/* Modern Search Bar */}
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all font-bold text-sm shadow-premium group-hover:shadow-lg"
                                title="Search students"
                            />
                        </div>
                    </div>

                    {/* Main Table - Modern Glass Aesthetic */}
                    <div className="bg-white rounded-[2.5rem] shadow-premium border border-white overflow-hidden animate-slide-up [animation-delay:200ms]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Learner Profile</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Communication</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Metrics</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Enrollment</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center group">
                                                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-3xl mb-4 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all transform group-hover:scale-110 duration-700 animate-float">👤</div>
                                                    <h3 className="font-black text-xl text-slate-800 tracking-tight mb-1">Awaiting students</h3>
                                                    <p className="text-slate-400 font-bold text-sm tracking-tight italic">Share your quiz code to start populating your directory.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((student) => {
                                            const name = student.displayName || student.name || "Anonymous";
                                            const joinDate = student.createdAt?.toDate ? student.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

                                            return (
                                                <tr key={student.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-14 h-14 rounded-2xl bg-white shadow-inner text-primary flex items-center justify-center font-black text-lg border border-slate-100 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                                                                {name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <span className="font-black text-slate-900 block text-lg tracking-tight group-hover:text-primary transition-colors">{name}</span>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">ID: {student.id.substring(0, 8)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3 text-slate-500 font-bold text-sm group-hover:translate-x-1 transition-transform">
                                                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-transparent group-hover:border-primary/20 group-hover:text-primary transition-all">
                                                                <Mail size={14} />
                                                            </div>
                                                            {student.email || 'No contact sync'}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-8">
                                                            <div className="flex flex-col gap-1" title="Quizzes Taken">
                                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Quizzes</span>
                                                                <div className="flex items-center gap-2">
                                                                    <BookOpen size={14} className="text-blue-500" />
                                                                    <span className="text-sm font-black text-slate-700">{student.quizzesTaken || 0}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-1" title="Total Score">
                                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Score</span>
                                                                <div className="flex items-center gap-2">
                                                                    <Award size={14} className="text-[#ffa602]" />
                                                                    <span className="text-sm font-black text-slate-700">{student.totalScore || 0}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="inline-flex flex-col items-start px-4 py-2 bg-slate-50 rounded-xl border border-transparent group-hover:border-slate-200 transition-all">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">Joined</span>
                                                            <span className="text-xs font-black text-slate-700">{joinDate}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-12 text-center animate-fade-in [animation-delay:800ms]">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] bg-white px-6 py-2 rounded-full border border-slate-50 shadow-sm">
                            Aggregate Sync: {filteredStudents.length} {filteredStudents.length === 1 ? 'Profile' : 'Profiles'}
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
}
