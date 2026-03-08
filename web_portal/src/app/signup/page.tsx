"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Mail, Lock, ArrowRight, User, Sparkles, ChevronLeft, UserPlus, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

type SignupView = 'role-selection' | 'details';
type UserRole = 'student' | 'instructor';

export default function Signup() {
    const [view, setView] = useState<SignupView>('role-selection');
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole) return;

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });

            // Create Firestore user document
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                name: name,
                role: selectedRole,
                createdAt: serverTimestamp(),
                subscriptionStatus: 'inactive',
                planId: 'free'
            });

            // Redirect based on role
            if (selectedRole === 'student') {
                router.push('/dashboard/student');
            } else {
                router.push('/dashboard/teacher');
            }
        } catch (error: any) {
            console.error(error);
            let errorMessage = "Registration failed. Please try again.";
            if (error.code === "auth/email-already-in-use") {
                errorMessage = "This email is already registered.";
            } else if (error.code === "auth/weak-password") {
                errorMessage = "Password should be at least 6 characters.";
            }
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        if (!selectedRole) {
            alert("Please select a role first.");
            return;
        }

        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName,
                    role: selectedRole,
                    createdAt: serverTimestamp(),
                    subscriptionStatus: 'inactive',
                    planId: 'free'
                });
            }

            if (selectedRole === 'student') {
                router.push('/dashboard/student');
            } else {
                router.push('/dashboard/teacher');
            }
        } catch (error) {
            console.error(error);
            alert("Google Sign-In failed.");
        } finally {
            setLoading(false);
        }
    };

    const RoleCard = ({ type, icon: Icon, title, desc, color }: { type: UserRole, icon: any, title: string, desc: string, color: string }) => (
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
                setSelectedRole(type);
                setView('details');
            }}
            className={`cursor-pointer p-8 rounded-[2.5rem] bg-white border-2 border-transparent hover:border-${color}-400 shadow-xl transition-all duration-300 flex flex-col items-center text-center group relative overflow-hidden`}
        >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${color}-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            <div className={`w-20 h-20 rounded-3xl bg-${color}-50 text-${color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <Icon size={40} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-500 font-medium leading-relaxed">{desc}</p>
            <div className={`mt-8 w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-${color}-600 group-hover:text-white transition-all duration-300`}>
                <ArrowRight size={20} />
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px] pointer-events-none"></div>

            <AnimatePresence mode="wait">
                {view === 'role-selection' ? (
                    <motion.div
                        key="role-selection"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="w-full max-w-4xl z-10"
                    >
                        <div className="text-center mb-16">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-primary/20"
                            >
                                <UserPlus size={32} />
                            </motion.div>
                            <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">Create your account</h1>
                            <p className="text-xl text-gray-500 font-medium tracking-tight">How will you be using Test Hub today?</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <RoleCard
                                type="student"
                                icon={User}
                                title="As a Student"
                                desc="Join games, track your learning, and earn rewards."
                                color="blue"
                            />
                            <RoleCard
                                type="instructor"
                                icon={GraduationCap}
                                title="As a Teacher"
                                desc="Create AI quizzes, host live games, and manage results."
                                color="purple"
                            />
                        </div>

                        <div className="mt-12 text-center">
                            <p className="text-gray-500 font-bold">
                                Already have an account? <Link href="/login" className="text-primary hover:underline">Log in here</Link>
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="signup-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 border border-gray-100"
                    >
                        <button
                            onClick={() => setView('role-selection')}
                            className="absolute top-8 left-8 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                            title="Back to role selection"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <div className="text-center mb-10 pt-4">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${selectedRole === 'student' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                {selectedRole === 'student' ? <User size={32} /> : <GraduationCap size={32} />}
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-2">
                                {selectedRole === 'student' ? 'Student Signup' : 'Teacher Signup'}
                            </h2>
                            <p className="text-gray-500 font-medium tracking-tight">Join the Test Hub community</p>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase tracking-wider text-gray-400 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-medium"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase tracking-wider text-gray-400 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-medium"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase tracking-wider text-gray-400 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl mb-4">
                                <ShieldCheck size={16} className="text-green-500 flex-shrink-0" />
                                <p className="text-[10px] text-gray-500 leading-tight">By signing up, you agree to our Terms of Service and Privacy Policy.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 rounded-2xl font-black text-lg text-white shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 ${selectedRole === 'student' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'}`}
                            >
                                {loading ? "Creating Account..." : "Create Account"}
                                {!loading && <ArrowRight size={20} />}
                            </button>
                        </form>

                        <div className="my-6 flex items-center gap-4 text-gray-300">
                            <div className="h-[1px] flex-1 bg-current"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">or join with</span>
                            <div className="h-[1px] flex-1 bg-current"></div>
                        </div>

                        <button
                            onClick={handleGoogleSignup}
                            disabled={loading}
                            className="w-full py-3.5 border-2 border-gray-100 rounded-2xl flex items-center justify-center gap-3 font-bold text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                            Continue with Google
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
