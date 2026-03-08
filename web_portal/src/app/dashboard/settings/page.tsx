"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { User, Lock, Save, Mail, Shield } from "lucide-react";

export default function SettingsPage() {
    const { user, loading } = useAuth();
    const [displayName, setDisplayName] = useState("");
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || "");
        }
    }, [user]);

    if (loading) return <div className="flex h-screen items-center justify-center font-bold text-primary">Loading...</div>;
    if (!user) return <div className="p-8">Access Denied</div>;

    // Determine the role for the sidebar based on URL or user data
    // For now, we can infer it or just pass a generic one. 
    // Usually, the app should know the role. 
    const role = user.email === "shakirullah1515@gmail.com" ? "admin" : "instructor"; // Simplified for now

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        setMessage({ type: "", text: "" });
        try {
            if (!auth.currentUser) throw new Error("No authenticated user found");
            await updateProfile(auth.currentUser, { displayName });
            setMessage({ type: "success", text: "Profile updated successfully!" });
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: "Failed to update profile." });
        } finally {
            setUpdating(false);
        }
    };

    const handleResetPassword = async () => {
        if (!user.email) return;
        setUpdating(true);
        setMessage({ type: "", text: "" });
        try {
            await sendPasswordResetEmail(auth, user.email);
            setMessage({ type: "success", text: "Password reset email sent!" });
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: "Failed to send reset email." });
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role={role} userName={user.displayName || "User"} />

            <main className="flex-1 ml-64 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-gray-900">Settings</h1>
                        <p className="text-gray-500 mt-1">Manage your account preferences and security.</p>
                    </div>

                    {message.text && (
                        <div className={`mb-6 p-4 rounded-xl font-bold flex items-center gap-2 ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                            }`}>
                            {message.type === "success" ? "✅" : "❌"} {message.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Profile Section */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <User size={24} />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div>
                                        <label htmlFor="display-name" className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
                                        <div className="relative">
                                            <input
                                                id="display-name"
                                                type="text"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-primary focus:bg-white outline-none transition-all"
                                                placeholder="Your Name"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="email-address" className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                id="email-address"
                                                type="email"
                                                value={user.email || ""}
                                                disabled
                                                className="w-full pl-12 pr-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl text-gray-500 cursor-not-allowed"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2 italic">Email cannot be changed from this portal.</p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                                    >
                                        <Save size={18} />
                                        {updating ? "Saving..." : "Save Changes"}
                                    </button>
                                </form>
                            </div>

                            {/* Security Section */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                        <Lock size={24} />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Security</h2>
                                </div>

                                <p className="text-gray-500 mb-6 font-medium">
                                    Keeping your account secure is our priority. You can request a password reset link to update your credentials.
                                </p>

                                <button
                                    onClick={handleResetPassword}
                                    disabled={updating}
                                    className="px-6 py-3 border-2 border-purple-100 text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-all disabled:opacity-50"
                                >
                                    Reset Password via Email
                                </button>
                            </div>
                        </div>

                        {/* Account Summary sidebar in settings */}
                        <div className="space-y-6">
                            <div className="bg-[#46178f] p-8 rounded-3xl text-white">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                                    <Shield size={32} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Account Type</h3>
                                <p className="text-white/70 font-medium mb-4 capitalize">{role}</p>
                                <div className="h-px bg-white/10 my-6"></div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-white/60">Status</span>
                                        <span className="bg-green-400/20 text-green-300 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Active</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-white/60">ID</span>
                                        <span className="font-mono text-[10px] opacity-60">{user.uid.substring(0, 8)}...</span>
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
