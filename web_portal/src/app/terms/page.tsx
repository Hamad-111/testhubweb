"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Scale, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const Nav = () => (
    <nav className="fixed w-full z-50 top-0 left-0 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <Link href="/" className="flex items-center gap-3 group relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white relative group-hover:scale-110 transition-transform">
                        <GraduationCap size={24} fill="currentColor" />
                    </div>
                    <span className="text-2xl font-black text-white uppercase tracking-tight relative">TestHub</span>
                </Link>
                <Link href="/" className="text-gray-400 hover:text-white font-bold transition-colors">Back to Home</Link>
            </div>
        </div>
    </nav>
);

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#0B0F19] text-white font-sans relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>

            <Nav />

            <main className="pt-40 pb-20 relative z-10">
                <div className="max-w-3xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 text-center"
                    >
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mx-auto mb-6 border border-blue-500/20 shadow-sm">
                            <Scale size={32} />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-2">Terms of Service</h1>
                        <p className="text-gray-400">Effective Date: March 8, 2025</p>
                    </motion.div>

                    <div className="space-y-10 text-gray-400">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                            <p className="leading-relaxed">
                                By accessing or using TestHub, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use the service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                            <p className="leading-relaxed">
                                TestHub provides an AI-powered platform for generating and hosting interactive quizzes for educational purposes. We reserve the right to modify or discontinue any feature with or without notice.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. User Responsibility</h2>
                            <div className="grid gap-4 mt-4">
                                {[
                                    "You are responsible for maintaining the confidentiality of your account.",
                                    "You agree not to use the service for any illegal or unauthorized purpose.",
                                    "You are solely responsible for any content generated or hosted on your account.",
                                    "You must provide accurate and complete information during registration."
                                ].map((text, i) => (
                                    <div key={i} className="flex gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
                                        <span className="text-sm">{text}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Intellectual Property</h2>
                            <p className="leading-relaxed">
                                All content, trademarks, and data on TestHub, including but not limited to software, databases, text, and graphics, are the property of TestHub or licensed to us.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Limitation of Liability</h2>
                            <p className="leading-relaxed">
                                TestHub shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the service.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <footer className="bg-[#0B0F19] py-12 border-t border-white/10 mt-20 relative z-10">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-500 text-sm">© 2025 TestHub. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
