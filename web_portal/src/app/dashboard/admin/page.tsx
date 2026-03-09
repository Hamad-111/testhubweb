"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const [stats, setStats] = useState({
        totalTeachers: 0,
        totalStudents: 0,
        totalQuizzes: 0,
        totalAttempts: 0,
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        async function fetchAdminStats() {
            if (user && user.role === "admin") {
                try {
                    // Fetch Teachers count
                    const teachersQuery = query(collection(db, "users"), where("role", "==", "instructor"));
                    const teachersSnapshot = await getDocs(teachersQuery);

                    // Fetch Students count
                    const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
                    const studentsSnapshot = await getDocs(studentsQuery);

                    // Fetch Quizzes count
                    const quizzesSnapshot = await getDocs(collection(db, "quizzes"));

                    // Fetch Quiz Results count
                    const resultsSnapshot = await getDocs(collection(db, "quiz_results"));

                    setStats({
                        totalTeachers: teachersSnapshot.size,
                        totalStudents: studentsSnapshot.size,
                        totalQuizzes: quizzesSnapshot.size,
                        totalAttempts: resultsSnapshot.size,
                    });

                    // Fetch recent activity (e.g., last 5 quiz results)
                    const activityQuery = query(collection(db, "quiz_results"), limit(5));
                    const activitySnapshot = await getDocs(activityQuery);
                    const activities: any[] = [];
                    activitySnapshot.forEach(doc => {
                        activities.push({ id: doc.id, ...doc.data() });
                    });
                    setRecentActivity(activities);

                } catch (error) {
                    console.error("Error fetching admin stats:", error);
                } finally {
                    setLoadingStats(false);
                }
            }
        }

        if (!loading) {
            if (user && user.role === "admin") {
                fetchAdminStats();
            } else {
                setLoadingStats(false);
            }
        }
    }, [user, loading]);

    if (loading || loadingStats) return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Loading Admin Panel...</div>;
    if (!user || user.role !== "admin") return <div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Access Denied</h1><p>You do not have permission to view this page.</p></div>;

    return (
        <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
            <Sidebar role="admin" userName={user.displayName || "Admin"} />

            <main className="flex-1 md:ml-72 p-6 md:p-12 w-full animate-fade-in">
                {/* Top Bar - Modern & Clean */}
                <div className="flex justify-between items-center mb-12 animate-slide-up">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Command Center</h1>
                        <p className="text-slate-500 font-medium mt-1">Platform-wide oversight and ecosystem management.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all uppercase tracking-widest active:scale-95 flex items-center gap-2">
                            ⚙️ Settings
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="animate-slide-up [animation-delay:100ms]">
                        <StatCard
                            title="Instructors"
                            value={stats.totalTeachers}
                            icon="👨‍🏫"
                            color="#4F46E5"
                        />
                    </div>
                    <div className="animate-slide-up [animation-delay:200ms]">
                        <StatCard
                            title="Learners"
                            value={stats.totalStudents}
                            icon="👨‍+🎓"
                            color="#10B981"
                        />
                    </div>
                    <div className="animate-slide-up [animation-delay:300ms]">
                        <StatCard
                            title="Total Content"
                            value={stats.totalQuizzes}
                            icon="📝"
                            color="#F59E0B"
                        />
                    </div>
                    <div className="animate-slide-up [animation-delay:400ms]">
                        <StatCard
                            title="Engagements"
                            value={stats.totalAttempts}
                            icon="🚀"
                            color="#EC4899"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity - Glass Card */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-premium p-10 border border-white animate-slide-up [animation-delay:500ms]">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <div className="w-2 h-8 bg-primary rounded-full" />
                                Ecosystem Activity
                            </h2>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Real-time Sync</span>
                        </div>

                        <div className="space-y-4">
                            {recentActivity.length === 0 ? (
                                <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-16 text-center group">
                                    <div className="text-6xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110 animate-float">📡</div>
                                    <h3 className="font-black text-xl text-slate-800 tracking-tight mb-2">Passive Phase</h3>
                                    <p className="text-slate-500 font-medium">No system-wide activity detected in the current cycle.</p>
                                </div>
                            ) : (
                                recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-center justify-between p-6 bg-slate-50 border border-transparent rounded-3xl hover:bg-white hover:border-slate-100 hover:shadow-premium transition-all duration-500 group">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-white shadow-inner flex items-center justify-center text-2xl group-hover:rotate-6 transition-transform">
                                                📊
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-lg tracking-tight group-hover:text-primary transition-colors">
                                                    {activity.studentName || 'A Student'} <span className="text-slate-400 font-bold">completed</span> {activity.quizTitle || 'Quiz'}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-primary">Score: {activity.percentageScore || 0}%</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">ID: {activity.id.substring(0, 8)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest hidden sm:block">JUST NOW</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Controls - Sidebar Card */}
                    <div className="space-y-8 animate-slide-up [animation-delay:600ms]">
                        <div className="bg-white rounded-[2.5rem] shadow-premium p-8 border border-white group overflow-hidden relative">
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />

                            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-8 relative z-10 flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-accent rounded-full" />
                                Administration
                            </h2>

                            <div className="grid grid-cols-1 gap-4 relative z-10">
                                <Link href="/dashboard/admin/teachers" className="group/btn">
                                    <div className="p-5 bg-slate-50 border border-transparent rounded-3xl group-hover/btn:bg-white group-hover/btn:border-slate-100 group-hover/btn:shadow-premium transition-all duration-500 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black transition-transform group-hover/btn:scale-110">
                                                👨‍🏫
                                            </div>
                                            <span className="font-black text-slate-900 text-sm tracking-tight group-hover/btn:text-primary transition-colors">Manage Teachers</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/btn:text-primary group-hover/btn:translate-x-1 transition-all">
                                            →
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/dashboard/admin/students" className="group/btn">
                                    <div className="p-5 bg-slate-50 border border-transparent rounded-3xl group-hover/btn:bg-white group-hover/btn:border-slate-100 group-hover/btn:shadow-premium transition-all duration-500 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black transition-transform group-hover/btn:scale-110">
                                                👨‍🎓
                                            </div>
                                            <span className="font-black text-slate-900 text-sm tracking-tight group-hover/btn:text-primary transition-colors">Manage Students</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/btn:text-primary group-hover/btn:translate-x-1 transition-all">
                                            →
                                        </div>
                                    </div>
                                </Link>

                                <div className="p-5 bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl opacity-60 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-black">
                                            🔒
                                        </div>
                                        <span className="font-black text-slate-900 text-sm tracking-tight">Maintenance Mode</span>
                                    </div>
                                    <span className="px-3 py-1 bg-slate-200 text-slate-500 text-[10px] rounded-lg font-black uppercase tracking-widest">ENABLED</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50 text-center uppercase tracking-[0.2em] font-black text-[9px] text-slate-300">
                                CORE SYSTEM CONTROLS
                            </div>
                        </div>

                        {/* System Health */}
                        <div className="bg-slate-900 rounded-[2.5rem] shadow-premium p-8 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                            <div className="relative z-10">
                                <h3 className="text-white font-black text-lg tracking-tight mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
                                    System Performance
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                            <span>API Latency</span>
                                            <span className="text-green-400">Optimal</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full w-[85%] bg-primary rounded-full" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                            <span>Database Sync</span>
                                            <span className="text-green-400">Stable</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full w-[92%] bg-accent rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
