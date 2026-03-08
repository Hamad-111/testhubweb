"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Scale, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const Nav = () => (
    <nav className="fixed w-full z-50 top-0 left-0 bg-primary shadow-lg py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-lg group-hover:scale-110 transition-transform">
                        <GraduationCap size={24} fill="currentColor" />
                    </div>
                    <span className="text-2xl font-bold text-white uppercase tracking-tight">Test Hub</span>
                </Link>
                <Link href="/" className="text-white hover:text-white/80 font-bold transition-colors">Back to Home</Link>
            </div>
        </div>
    </nav>
);

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <Nav />

            <main className="pt-40 pb-20">
                <div className="max-w-3xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 text-center"
                    >
                        <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                            <Scale size={32} />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">Terms of Service</h1>
                        <p className="text-gray-500">Effective Date: March 8, 2025</p>
                    </motion.div>

                    <div className="space-y-10 text-gray-600">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                            <p className="leading-relaxed">
                                By accessing or using Test Hub, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use the service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                            <p className="leading-relaxed">
                                Test Hub provides an AI-powered platform for generating and hosting interactive quizzes for educational purposes. We reserve the right to modify or discontinue any feature with or without notice.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Responsibility</h2>
                            <div className="grid gap-4 mt-4">
                                {[
                                    "You are responsible for maintaining the confidentiality of your account.",
                                    "You agree not to use the service for any illegal or unauthorized purpose.",
                                    "You are solely responsible for any content generated or hosted on your account.",
                                    "You must provide accurate and complete information during registration."
                                ].map((text, i) => (
                                    <div key={i} className="flex gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
                                        <span className="text-sm">{text}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Intellectual Property</h2>
                            <p className="leading-relaxed">
                                All content, trademarks, and data on Test Hub, including but not limited to software, databases, text, and graphics, are the property of Test Hub or licensed to us.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Limitation of Liability</h2>
                            <p className="leading-relaxed">
                                Test Hub shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the service.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <footer className="bg-white py-12 border-t border-gray-100 mt-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-400 text-sm">© 2025 Test Hub. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
