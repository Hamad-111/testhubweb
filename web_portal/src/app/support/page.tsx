import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support & Help Center - TestHub",
  description: "Get help with TestHub AI. Find answers to frequently asked questions, email our support team, or join our community of educators.",
};

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, MessageSquare, LifeBuoy, FileQuestion } from 'lucide-react';
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

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-[#0B0F19] text-white font-sans relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>

            <Nav />

            <main className="pt-40 pb-20 relative z-10">
                <div className="max-w-5xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-400 mx-auto mb-6 border border-blue-500/20 shadow-sm">
                            <LifeBuoy size={40} />
                        </div>
                        <h1 className="text-5xl font-black text-white mb-4 tracking-tight">How can we help?</h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Our support team is here to ensure you and your students have the best experience possible.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 mb-20">
                        <div className="bg-white/5 p-10 rounded-3xl border border-white/10 backdrop-blur-md shadow-sm hover:bg-white/10 transition-colors">
                            <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mb-6">
                                <Mail size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Email Support</h3>
                            <p className="text-gray-400 mb-8">Send us an email anytime and we'll get back to you within 24 hours.</p>
                            <a href="mailto:hadekhan681@gmail.com" className="text-xl font-bold text-purple-400 hover:text-purple-300 hover:underline">
                                hadekhan681@gmail.com
                            </a>
                        </div>

                        <div className="bg-white/5 p-10 rounded-3xl border border-white/10 backdrop-blur-md shadow-sm hover:bg-white/10 transition-colors">
                            <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center mb-6">
                                <MessageSquare size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Live Q&A</h3>
                            <p className="text-gray-400 mb-8">Join our community forum for quick tips and common solutions from fellow teachers.</p>
                            <button className="px-8 py-3 bg-white text-gray-900 rounded-xl font-bold hover:scale-105 transition-transform">
                                Visit Community
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-[3rem] p-12 border border-white/10 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-10">
                            <FileQuestion size={28} className="text-blue-400" />
                            <h2 className="text-3xl font-black text-white">Frequently Asked Questions</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                            {[
                                { q: "How do I create an AI quiz?", a: "Simply log in to your dashboard, click 'Create Quiz', and enter a topic. Our AI will handle the rest!" },
                                { q: "Is TestHub free for students?", a: "Yes! Students can join games for free using a game PIN. No account is required for students to play." },
                                { q: "How many questions can I generate?", a: "Free accounts get 3 daily generations. Premium users get unlimited access to all AI features." },
                                { q: "Can I use TestHub for remote learning?", a: "Absolutely! TestHub works perfectly on Zoom, Teams, or Google Meet." }
                            ].map((faq, i) => (
                                <div key={i} className="space-y-2">
                                    <h4 className="font-bold text-white text-lg">{faq.q}</h4>
                                    <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
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
