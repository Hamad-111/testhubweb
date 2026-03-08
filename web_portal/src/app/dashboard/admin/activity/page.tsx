"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { collection, getDocs, query, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Activity, Shield, Settings, Bell } from "lucide-react";

export default function AdminActivity() {
    const { user, loading } = useAuth();
    const [activities, setActivities] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const fetchActivities = async () => {
        try {
            // Fetch recent quiz results as "activities"
            const q = query(
                collection(db, "quiz_results"),
                orderBy("completedAt", "desc"),
                limit(20)
            );
            const snapshot = await getDocs(q);
            const list: any[] = [];
            snapshot.forEach(doc => {
                list.push({ id: doc.id, ...doc.data() });
            });
            setActivities(list);
        } catch (error) {
            console.error("Error fetching activity log:", error);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (!loading && user?.role === "admin") {
            fetchActivities();
        }
    }, [user, loading]);

    if (loading || loadingData) return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Loading Log...</div>;
    if (!user || user.role !== "admin") return <div className="p-8">Access Denied</div>;

    const formatDate = (timestamp: any) => {
        if (!timestamp) return "Just now";
        const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    };

    return (
        <div className="flex min-h-screen bg-[#f8f9fa]">
            <Sidebar role="admin" userName={user.displayName || "Admin"} />

            <main className="flex-1 ml-64 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-[#1F2937]">System Activity & Control</h1>
                    <p className="text-gray-500 mt-1">Monitor live interactions and manage portal settings.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Activity Log */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Activity className="text-purple-600" size={24} />
                                    Live Activity Log
                                </h2>
                                <button
                                    onClick={fetchActivities}
                                    className="text-sm font-bold text-purple-600 hover:bg-purple-50 px-3 py-1 rounded-lg transition-colors"
                                >
                                    Refresh
                                </button>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {activities.length === 0 ? (
                                    <div className="p-12 text-center text-gray-400">No recent activity detected.</div>
                                ) : (
                                    activities.map((item) => (
                                        <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                                        <Shield size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800">
                                                            {item.studentName || "A student"} completed "{item.quizTitle || "a quiz"}"
                                                        </p>
                                                        <p className="text-sm text-gray-500 mt-0.5">
                                                            Instructor ID: {item.instructorId?.substring(0, 8)}... • Score: {item.percentageScore}%
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wider">
                                                            {formatDate(item.completedAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded uppercase">
                                                    Success
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Portal Controls */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Settings className="text-gray-400" size={20} />
                                Portal Controls
                            </h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="text-sm font-bold text-gray-700">Maintenance Mode</p>
                                        <p className="text-[10px] text-gray-400">Lock portal for updates</p>
                                    </div>
                                    <div className="w-10 h-5 bg-gray-200 rounded-full relative">
                                        <div className="w-4 h-4 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="text-sm font-bold text-gray-700">Allow Signups</p>
                                        <p className="text-[10px] text-gray-400">Enable new registrations</p>
                                    </div>
                                    <div className="w-10 h-5 bg-green-500 rounded-full relative">
                                        <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                                    </div>
                                </div>

                                <button className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl text-sm hover:bg-red-100 transition-colors mt-4">
                                    Clear System Cache
                                </button>
                            </div>
                        </div>

                        <div className="bg-[#46178f] p-6 rounded-2xl shadow-lg relative overflow-hidden text-white">
                            <div className="relative z-10">
                                <Bell className="mb-4" size={32} />
                                <h3 className="font-bold text-lg mb-2">Global Broadcast</h3>
                                <p className="text-sm text-purple-100 mb-4 font-medium opacity-80 leading-relaxed">
                                    Send a notification to all active teachers and students.
                                </p>
                                <button className="w-full py-3 bg-white text-[#46178f] font-bold rounded-xl text-sm shadow-xl hover:shadow-2xl transition-all">
                                    Compose Alert
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
