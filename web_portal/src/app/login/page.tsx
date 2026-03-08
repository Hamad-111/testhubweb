"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, ArrowRight, Github } from 'lucide-react';
import Link from 'next/link';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            if (email === "shakirullah1515@gmail.com") {
                router.push('/dashboard/admin');
            } else {
                router.push('/dashboard/teacher');
            }
        } catch (error: any) {
            console.error(error);
            let errorMessage = "Login failed. Please try again.";
            if (error.code === "auth/invalid-credential") {
                errorMessage = "Invalid email or password. Please check your credentials.";
            } else if (error.code === "auth/user-not-found") {
                errorMessage = "No account found with this email.";
            } else if (error.code === "auth/wrong-password") {
                errorMessage = "Incorrect password.";
            } else if (error.code === "auth/too-many-requests") {
                errorMessage = "Too many failed login attempts. Please try again later.";
            }
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">

                {/* Left Side - Form */}
                <div className="flex-1 p-12 flex flex-col justify-center">
                    <div className="mb-10">
                        <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-xl mb-8">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                                <GraduationCap size={20} />
                            </div>
                            Test Hub
                        </Link>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">Welcome back!</h1>
                        <p className="text-gray-500">Sign in to your Teacher or Admin dashboard.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-medium"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded text-primary focus:ring-primary border-gray-300" />
                                <span className="text-sm font-medium text-gray-600">Remember me</span>
                            </label>
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!email) {
                                        alert("Please enter your email address first.");
                                        return;
                                    }
                                    try {
                                        const { sendPasswordResetEmail } = await import('firebase/auth');
                                        await sendPasswordResetEmail(auth, email);
                                        alert("Password reset email sent! Please check your inbox.");
                                    } catch (error) {
                                        console.error(error);
                                        alert("Failed to send reset email.");
                                    }
                                }}
                                className="text-sm font-bold text-primary hover:underline"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 font-medium">
                            Don't have an account? <Link href="/signup" className="text-primary font-bold hover:underline">Sign up for free</Link>
                        </p>
                    </div>
                </div>

                {/* Right Side - Visual */}
                <div className="hidden md:flex flex-1 bg-primary relative overflow-hidden items-center justify-center p-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#7C4DFF] to-[#2196F3]"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                    <div className="relative z-10 text-center text-white max-w-md">
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-12">
                            <GraduationCap size={48} />
                        </div>
                        <h2 className="text-4xl font-black mb-6">Make Learning Awesome!</h2>
                        <p className="text-lg text-white/80 leading-relaxed">
                            Join millions of players and creators on the world's most engaging learning platform.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
