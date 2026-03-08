"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, Heart, Globe, Sparkles } from 'lucide-react';
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

const Footer = () => (
    <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-400 text-sm">© 2025 Test Hub. All rights reserved.</p>
        </div>
    </footer>
);

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <Nav />

            <main className="pt-40 pb-20">
                <div className="max-w-4xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 text-primary mb-6">
                            <Sparkles size={16} />
                            <span className="text-sm font-bold uppercase tracking-wider">Our Mission</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">Making Learning Awesome for Everyone</h1>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            Test Hub was born out of a simple idea: learning should be as engaging as gaming. We're on a mission to empower teachers and inspire students through interactive AI-powered experiences.
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
                                className="p-8 rounded-3xl bg-gray-50 border border-gray-100 text-center"
                            >
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-6">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="prose prose-lg max-w-none text-gray-600">
                        <h2 className="text-3xl font-black text-gray-900 mb-6">The Test Hub Story</h2>
                        <p className="mb-6">
                            In 2024, a team of educators and developers saw a gap in existing classroom tools. While digital learning was growing, it often lacked the "spark" that keeps students truly engaged. We decided to build a platform that combines the power of Artificial Intelligence with the excitement of live competition.
                        </p>
                        <p className="mb-6">
                            Today, Test Hub is used by thousands of classrooms to turn boring reviews into epic challenges. Our AI engine helps teachers generate high-quality questions in seconds, giving them more time to focus on what matters most: their students.
                        </p>
                        <div className="p-8 rounded-3xl bg-primary text-white text-center mt-12 shadow-xl">
                            <h3 className="text-2xl font-bold mb-4">Join the Revolution</h3>
                            <p className="mb-8 opacity-90">Ready to make your classroom awesome?</p>
                            <Link href="/login" className="px-10 py-4 bg-white text-primary rounded-full font-bold hover:scale-105 transition-transform inline-block">
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
