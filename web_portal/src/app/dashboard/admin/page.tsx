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
        <div className="flex min-h-screen bg-[#f8f9fa]">
            <Sidebar role="admin" userName={user.displayName || "Admin"} />

            <main className="flex-1 ml-64 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-[#1F2937]">Admin Overview</h1>
                    <p className="text-gray-500 mt-1">Platform-wide statistics and activity control.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Teachers"
                        value={stats.totalTeachers}
                        icon="👨‍🏫"
                        color="#4F46E5"
                    />
                    <StatCard
                        title="Total Students"
                        value={stats.totalStudents}
                        icon="👨‍🎓"
                        color="#10B981"
                    />
                    <StatCard
                        title="Total Quizzes"
                        value={stats.totalQuizzes}
                        icon="📝"
                        color="#F59E0B"
                    />
                    <StatCard
                        title="Quiz Attempts"
                        value={stats.totalAttempts}
                        icon="🚀"
                        color="#EC4899"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Trends / Activity */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            Recent Activity
                        </h2>
                        <div className="space-y-4">
                            {recentActivity.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No recent activity detected.</p>
                            ) : (
                                recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <div>
                                            <p className="font-bold text-gray-800">{activity.studentName || 'A Student'} completed a quiz</p>
                                            <p className="text-xs text-gray-500">{activity.quizTitle || 'Quiz'} • Score: {activity.percentageScore || 0}%</p>
                                        </div>
                                        <span className="text-xs font-medium text-gray-400">Just now</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Controls */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-4">Quick Controls</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <Link href="/dashboard/admin/teachers" className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-between">
                                <span className="font-bold text-indigo-700">Manage Teachers</span>
                                <span className="text-xl">→</span>
                            </Link>
                            <Link href="/dashboard/admin/students" className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-between">
                                <span className="font-bold text-emerald-700">Manage Students</span>
                                <span className="text-xl">→</span>
                            </Link>
                            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl opacity-60 cursor-not-allowed flex items-center justify-between">
                                <span className="font-bold text-gray-700">Global Maintenance Mode</span>
                                <span className="px-2 py-1 bg-gray-300 text-white text-[10px] rounded font-bold">OFF</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
