"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, ShieldCheck, Lock, FileText } from 'lucide-react';
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

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <Nav />

            <main className="pt-40 pb-20">
                <div className="max-w-3xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck size={32} className="text-primary" />
                            <h1 className="text-4xl font-black text-gray-900">Privacy Policy</h1>
                        </div>
                        <p className="text-gray-500">Last Updated: March 2025</p>
                    </motion.div>

                    <div className="prose prose-purple prose-headings:font-black text-gray-600 space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <FileText size={20} className="text-primary" /> 1. Information We Collect
                            </h2>
                            <p>
                                We collect information you provide directly to us when you create an account, such as your name, email address, and any quiz content you generate. Using our AI features may also involve processing information you provide via prompts.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <Lock size={20} className="text-primary" /> 2. How We Use Your Data
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>To provide and maintain our service.</li>
                                <li>To provide AI-generated educational content based on your requests.</li>
                                <li>To enable live gameplay and interaction between students and teachers.</li>
                                <li>To process payments for premium features.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <ShieldCheck size={20} className="text-primary" /> 3. Data Protection
                            </h2>
                            <p>
                                We implement industry-standard security measures to protect your personal information. We do not sell your personal data to third parties. We use Firebase for secure authentication and data storage.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cookies</h2>
                            <p>
                                We use cookies to keep you logged in and improve your user experience. You can manage cookie preferences in your browser settings.
                            </p>
                        </section>

                        <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h2>
                            <p className="mb-0">
                                If you have any questions about our Privacy Policy, please contact us at <a href="mailto:shakirullah1515@gmail.com" className="text-primary font-bold">shakirullah1515@gmail.com</a>
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
