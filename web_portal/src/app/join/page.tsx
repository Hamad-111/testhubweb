"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export default function JoinGame() {
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [pendingJoin, setPendingJoin] = useState(false);
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    // Auto-join after successful login if flow was interrupted
    useEffect(() => {
        if (user && pendingJoin && !loading) {
            handleJoin();
            setPendingJoin(false);
        }
    }, [user, pendingJoin, loading]);

    const handleGoogleSignIn = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user document exists, if not create it
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

            setShowLoginModal(false);
            setPendingJoin(true); // Trigger auto-join effect
        } catch (error) {
            console.error("Error signing in with Google", error);
            setError("Failed to sign in. Please try again.");
        }
    };

    const handleJoin = async () => {
        if (!pin) return;

        // Wait for auth to initialize if it's still loading
        if (authLoading) return;

        if (!user) {
            setShowLoginModal(true);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const quizRef = doc(db, 'quizzes', pin);
            const quizSnap = await getDoc(quizRef);

            if (quizSnap.exists()) {
                const quizData = quizSnap.data();
                if (quizData.isPublished) {
                    router.push(`/play/${pin}`);
                } else {
                    setError("This quiz is not currently active.");
                    setLoading(false);
                }
            } else {
                setError("Game not found. Please check the PIN.");
                setLoading(false);
            }
        } catch (err) {
            console.error("Error joining game:", err);
            setError("Failed to join game. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#7C4DFF] to-[#C04DFF] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Header */}
            <div className="absolute top-8 left-8 flex items-center gap-2 text-white/80">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span className="font-bold">Test Hub</span>
            </div>

            <div className="absolute top-8 right-8 flex items-center gap-4">
                {!authLoading && !user && (
                    <button
                        onClick={() => setShowLoginModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm font-bold transition-colors">
                        <UserIcon size={16} />
                        Sign In
                    </button>
                )}
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm font-bold transition-colors">
                    Exit
                </button>
            </div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md text-center z-10"
            >
                <div className="inline-block px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-white font-medium mb-8">
                    Join at <span className="font-bold">testhub.app</span>
                </div>

                <h1 className="text-6xl md:text-7xl font-black text-white mb-2 tracking-tight">testhub.app</h1>

                <div className="mt-12 mb-8">
                    <p className="text-white/80 font-bold text-lg mb-4">Game PIN:</p>
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl relative">
                        <input
                            type="text"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                            placeholder="000 000"
                            className="w-full bg-transparent text-center text-5xl md:text-6xl font-black text-white placeholder-white/30 outline-none tracking-widest"
                            maxLength={7}
                            disabled={loading || authLoading}
                        />
                        {error && (
                            <div className="absolute -bottom-12 left-0 w-full text-red-200 font-bold bg-red-500/20 py-2 rounded-lg backdrop-blur-sm">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleJoin}
                    disabled={loading || authLoading || !pin}
                    className="w-full py-5 rounded-2xl bg-white text-primary font-black text-xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? "Joining..." : (authLoading ? "Initializing..." : "Enter")}
                    {!loading && !authLoading && <ArrowRight size={24} strokeWidth={3} />}
                </button>

                {!authLoading && user && (
                    <div className="mt-4 text-white/80 text-sm font-medium">
                        Playing as <span className="font-bold text-white">{user.displayName || user.email}</span>
                    </div>
                )}

            </motion.div>

            {/* Login Modal */}
            <AnimatePresence>
                {showLoginModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl"
                        >
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-[#F2F2F2] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Lock className="text-[#46178f]" size={32} />
                                </div>
                                <h2 className="text-2xl font-black text-[#333] mb-2">Sign in to Join</h2>
                                <p className="text-gray-500">You need to identify yourself to play this game.</p>
                            </div>

                            <button
                                onClick={handleGoogleSignIn}
                                className="w-full bg-white border-2 border-gray-200 hover:border-[#46178f] hover:bg-gray-50 text-[#333] font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all mb-4"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                                <span>Continue with Google</span>
                            </button>

                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="w-full text-gray-500 font-bold hover:text-[#333] transition-colors"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer Info */}
            <div className="absolute bottom-8 text-white/60 text-sm font-medium">
                Create your own quiz for free at <span className="text-white font-bold">testhub.com</span>
            </div>
        </div>
    );
}
