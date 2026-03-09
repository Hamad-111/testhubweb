"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, ShieldCheck, Lock, FileText } from 'lucide-react';
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
                    <span className="text-2xl font-black text-white uppercase tracking-tight relative">Test Hub</span>
                </Link>
                <Link href="/" className="text-gray-400 hover:text-white font-bold transition-colors">Back to Home</Link>
            </div>
        </div>
    </nav>
);

export default function PrivacyPage() {
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
                        className="mb-12"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck size={32} className="text-blue-400" />
                            <h1 className="text-4xl font-black text-white">Privacy Policy</h1>
                        </div>
                        <p className="text-gray-400">Last Updated: March 2025</p>
                    </motion.div>

                    <div className="prose prose-invert prose-headings:font-black text-gray-400 space-y-8 max-w-none">
                        <section>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
                                <FileText size={20} className="text-blue-400" /> 1. Information We Collect
                            </h2>
                            <p>
                                We collect information you provide directly to us when you create an account, such as your name, email address, and any quiz content you generate. Using our AI features may also involve processing information you provide via prompts.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
                                <Lock size={20} className="text-blue-400" /> 2. How We Use Your Data
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>To provide and maintain our service.</li>
                                <li>To provide AI-generated educational content based on your requests.</li>
                                <li>To enable live gameplay and interaction between students and teachers.</li>
                                <li>To process payments for premium features.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
                                <ShieldCheck size={20} className="text-blue-400" /> 3. Data Protection
                            </h2>
                            <p>
                                We implement industry-standard security measures to protect your personal information. We do not sell your personal data to third parties. We use Firebase for secure authentication and data storage.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Cookies</h2>
                            <p>
                                We use cookies to keep you logged in and improve your user experience. You can manage cookie preferences in your browser settings.
                            </p>
                        </section>

                        <section className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
                            <h2 className="text-xl font-bold text-white mb-4">Contact Us</h2>
                            <p className="mb-0">
                                If you have any questions about our Privacy Policy, please contact us at <a href="mailto:hadekhan681@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors font-bold">hadekhan681@gmail.com</a>
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <footer className="bg-[#0B0F19] py-12 border-t border-white/10 mt-20 relative z-10">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-500 text-sm">© 2025 Test Hub. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
