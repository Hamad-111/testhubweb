import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About TestHub - The Future of AI-Powered Learning",
  description: "Discover the mission behind TestHub. We're on a journey to transform classrooms through interactive AI-powered quiz generation and live engagement.",
};

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, Heart, Globe, Sparkles } from 'lucide-react';
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

const Footer = () => (
    <footer className="bg-[#0B0F19] py-12 border-t border-white/10 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm">© 2025 TestHub. All rights reserved.</p>
        </div>
    </footer>
);

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#0B0F19] text-white font-sans relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>

            <Nav />

            <main className="pt-40 pb-20 relative z-10">
                <div className="max-w-4xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-400 mb-6 backdrop-blur-sm">
                            <Sparkles size={16} />
                            <span className="text-sm font-bold uppercase tracking-wider">Our Mission</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">Making Learning Awesome for Everyone</h1>
                        <p className="text-xl text-gray-400 leading-relaxed">
                            TestHub was born out of a simple idea: learning should be as engaging as gaming. We're on a mission to empower teachers and inspire students through interactive AI-powered experiences.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        {[
                            { icon: <Users className="text-blue-500" />, title: "Community First", desc: "Built for teachers, by listening to teachers." },
                            { icon: <Heart className="text-red-500" />, title: "Student Centered", desc: "Designed to spark joy and curiosity in the classroom." },
                            { icon: <Globe className="text-green-500" />, title: "Global Reach", desc: "Breaking barriers in education across the world." }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md text-center hover:bg-white/10 transition-colors"
                            >
                                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-6">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="prose prose-lg max-w-none text-gray-400">
                        <h2 className="text-3xl font-black text-white mb-6">The TestHub Story</h2>
                        <p className="mb-6">
                            In 2024, a team of educators and developers saw a gap in existing classroom tools. While digital learning was growing, it often lacked the "spark" that keeps students truly engaged. We decided to build a platform that combines the power of Artificial Intelligence with the excitement of live competition.
                        </p>
                        <p className="mb-6">
                            Today, TestHub is used by thousands of classrooms to turn boring reviews into epic challenges. Our AI engine helps teachers generate high-quality questions in seconds, giving them more time to focus on what matters most: their students.
                        </p>
                        <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 text-white text-center mt-12 shadow-xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm -z-10"></div>
                            <h3 className="text-2xl font-bold mb-4">Join the Revolution</h3>
                            <p className="mb-8 text-blue-200">Ready to make your classroom awesome?</p>
                            <Link href="/login" className="px-10 py-4 bg-white text-gray-900 rounded-full font-bold hover:scale-105 transition-transform inline-block">
                                Get Started for Free
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
