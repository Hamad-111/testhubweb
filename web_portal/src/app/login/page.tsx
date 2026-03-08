"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Mail, Lock, ArrowRight, User, Sparkles, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

type LoginView = 'role-selection' | 'login';
type UserRole = 'student' | 'instructor';

export default function Login() {
    const [view, setView] = useState<LoginView>('role-selection');
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Redirect based on role
            if (email === "hadekhan681@gmail.com") {
                router.push('/dashboard/admin');
            } else if (selectedRole === 'student') {
                router.push('/dashboard/student');
            } else {
                router.push('/dashboard/teacher');
            }
        } catch (error: any) {
            console.error(error);
            let errorMessage = "Login failed. Please try again.";
            if (error.code === "auth/invalid-credential") {
                errorMessage = "Invalid email or password.";
            } else if (error.code === "auth/user-not-found") {
                errorMessage = "No account found with this email.";
            }
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // For Google sign-in, we check/create user doc if it's a new student
            if (selectedRole === 'student') {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    await setDoc(userRef, {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        role: 'student',
                        createdAt: serverTimestamp(),
                    });
                }
            }

            if (user.email === "hadekhan681@gmail.com") {
                router.push('/dashboard/admin');
            } else if (selectedRole === 'student') {
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
                setView('login');
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-4xl z-10"
                    >
                        <div className="text-center mb-16">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-primary/20"
                            >
                                <GraduationCap size={32} />
                            </motion.div>
                            <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">Log in to Test Hub</h1>
                            <p className="text-xl text-gray-500 font-medium tracking-tight">Select your role to continue your journey</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <RoleCard
                                type="student"
                                icon={User}
                                title="I'm a Student"
                                desc="Join games, view your results, and track your progress."
                                color="blue"
                            />
                            <RoleCard
                                type="instructor"
                                icon={GraduationCap}
                                title="I'm a Teacher"
                                desc="Create AI quizzes, manage classes, and host live games."
                                color="purple"
                            />
                        </div>

                        <div className="mt-12 text-center">
                            <Link href="/join" className="inline-flex items-center gap-2 text-primary font-bold hover:underline group">
                                <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                                Just want to join a game? Click here
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="login-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl relative z-10 border border-gray-100"
                    >
                        <button
                            onClick={() => setView('role-selection')}
                            className="absolute top-8 left-8 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                            title="Back to role selection"
                            aria-label="Back to role selection"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <div className="text-center mb-10 pt-4">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${selectedRole === 'student' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                {selectedRole === 'student' ? <User size={32} /> : <GraduationCap size={32} />}
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-2">
                                {selectedRole === 'student' ? 'Student Login' : 'Teacher Login'}
                            </h2>
                            <p className="text-gray-500 font-medium">Please enter your details</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-medium"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 rounded-2xl font-black text-lg text-white shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 ${selectedRole === 'student' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'}`}
                            >
                                {loading ? "Signing in..." : "Continue"}
                                {!loading && <ArrowRight size={20} />}
                            </button>
                        </form>

                        <div className="my-8 flex items-center gap-4 text-gray-300">
                            <div className="h-[1px] flex-1 bg-current"></div>
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">or</span>
                            <div className="h-[1px] flex-1 bg-current"></div>
                        </div>

                        <button
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full py-4 border-2 border-gray-100 rounded-2xl flex items-center justify-center gap-3 font-bold text-gray-700 hover:bg-gray-50 transition-all mb-8"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                            Continue with Google
                        </button>

                        <p className="text-center text-gray-500 font-bold text-sm">
                            Don't have an account? <Link href="/signup" className="text-primary hover:underline">Sign up</Link>
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
