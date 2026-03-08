"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, MessageSquare, LifeBuoy, FileQuestion } from 'lucide-react';
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

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <Nav />

            <main className="pt-40 pb-20">
                <div className="max-w-5xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-6 shadow-sm">
                            <LifeBuoy size={40} />
                        </div>
                        <h1 className="text-5xl font-black text-gray-900 mb-4">How can we help?</h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Our support team is here to ensure you and your students have the best experience possible.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 mb-20">
                        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-purple-50 text-primary rounded-xl flex items-center justify-center mb-6">
                                <Mail size={24} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Email Support</h3>
                            <p className="text-gray-500 mb-8">Send us an email anytime and we'll get back to you within 24 hours.</p>
                            <a href="mailto:hadekhan681@gmail.com" className="text-xl font-bold text-primary hover:underline">
                                hadekhan681@gmail.com
                            </a>
                        </div>

                        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6">
                                <MessageSquare size={24} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Live Q&A</h3>
                            <p className="text-gray-500 mb-8">Join our community forum for quick tips and common solutions from fellow teachers.</p>
                            <button className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors">
                                Visit Community
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-[3rem] p-12">
                        <div className="flex items-center gap-3 mb-10">
                            <FileQuestion size={28} className="text-primary" />
                            <h2 className="text-3xl font-black text-gray-900">Frequently Asked Questions</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                            {[
                                { q: "How do I create an AI quiz?", a: "Simply log in to your dashboard, click 'Create Quiz', and enter a topic. Our AI will handle the rest!" },
                                { q: "Is Test Hub free for students?", a: "Yes! Students can join games for free using a game PIN. No account is required for students to play." },
                                { q: "How many questions can I generate?", a: "Free accounts get 3 daily generations. Premium users get unlimited access to all AI features." },
                                { q: "Can I use Test Hub for remote learning?", a: "Absolutely! Test Hub works perfectly on Zoom, Teams, or Google Meet." }
                            ].map((faq, i) => (
                                <div key={i} className="space-y-2">
                                    <h4 className="font-bold text-gray-900">{faq.q}</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-white py-12 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-400 text-sm">© 2025 Test Hub. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
