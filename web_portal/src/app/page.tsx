"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Play,
  Zap,
  Users,
  BarChart2,
  Globe,
  Microscope,
  Calculator,
  BookOpen,
  Sparkles,
  Check,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --- Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 top-0 left-0 transition-all duration-300 ${scrolled ? 'bg-primary/90 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-lg group-hover:scale-110 transition-transform">
              <GraduationCap size={24} fill="currentColor" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Test Hub
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/join" className="text-white/90 hover:text-white font-medium transition-colors flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              Join Game
            </Link>
            <Link
              href="/login"
              className="px-6 py-2.5 rounded-full bg-white text-primary font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Create Quiz
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative pt-32 pb-32 overflow-hidden bg-gradient-to-br from-[#7C4DFF] via-[#651fff] to-[#2196F3]">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white mb-8"
        >
          <Sparkles size={16} className="text-yellow-300" />
          <span className="text-sm font-medium">Powered by AI Technology</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight"
        >
          Make Learning Awesome!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-white/90 mb-12 max-w-2xl mx-auto font-medium"
        >
          Create engaging quizzes with AI in seconds and host live games that students absolutely love.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-primary font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
            <Zap size={20} fill="currentColor" />
            Create Quiz Free
          </Link>
          <Link href="/join" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 border border-white/30 text-white font-bold text-lg backdrop-blur-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2">
            <Play size={20} fill="currentColor" />
            Join Game
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {[
            { label: "Active Players Daily", value: "10K+", icon: <Check size={24} /> },
            { label: "Quizzes Created", value: "5K+", icon: <BookOpen size={24} /> },
            { label: "Games Played", value: "50K+", icon: <Users size={24} /> },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md text-white">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                {stat.icon}
              </div>
              <div className="text-4xl font-black mb-1">{stat.value}</div>
              <div className="text-white/70 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const TrendingQuizzes = () => {
  const quizzes = [
    { title: "World Geography Challenge", questions: 15, plays: 932, color: "bg-card-red", icon: <Globe size={32} className="text-white" /> },
    { title: "Science Fundamentals", questions: 19, plays: 426, color: "bg-card-blue", icon: <Microscope size={32} className="text-white" /> },
    { title: "Math Quick Quiz", questions: 10, plays: 851, color: "bg-card-yellow", icon: <Calculator size={32} className="text-white" /> },
    { title: "History Trivia", questions: 12, plays: 734, color: "bg-card-green", icon: <BookOpen size={32} className="text-white" /> },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4">Trending Quizzes</h2>
          <p className="text-gray-600 font-medium">Jump into these popular quiz games right now</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quizzes.map((quiz, i) => (
            <div key={i} className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
              <div className={`h-32 ${quiz.color} flex items-center justify-center`}>
                <div className="transform group-hover:scale-110 transition-transform duration-300">
                  {quiz.icon}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-4 leading-tight min-h-[3rem]">{quiz.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <span className="flex items-center gap-1"><BookOpen size={14} /> {quiz.questions}</span>
                  <span className="flex items-center gap-1"><Users size={14} /> {quiz.plays}</span>
                </div>
                <Link href="/join" className={`block w-full text-center py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 ${quiz.color.replace('bg-', 'bg-')}`}>
                  Start Game
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="px-8 py-3 rounded-full border-2 border-gray-200 font-bold text-gray-600 hover:border-primary hover:text-primary transition-colors">
            Browse All Quizzes
          </button>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4">Why Teachers Love Test Hub</h2>
          <p className="text-gray-600 font-medium">Everything you need to create engaging learning experiences</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Lightning Fast", desc: "Create professional quizzes in under 60 seconds with our AI-powered quiz builder.", icon: <Zap size={32} />, color: "bg-card-red" },
            { title: "Live Gameplay", desc: "Host exciting real-time quiz sessions with hundreds of students simultaneously.", icon: <Users size={32} />, color: "bg-card-blue" },
            { title: "Smart Analytics", desc: "Track progress with detailed insights and identify areas where students need help.", icon: <BarChart2 size={32} />, color: "bg-card-green" },
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-3xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all text-center group">
              <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center text-white mx-auto mb-6 shadow-lg transform group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AISection = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string[] | null>(null);
  const [attempts, setAttempts] = useState(3);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    const savedAttempts = localStorage.getItem('ai_attempts');
    if (savedAttempts !== null) {
      setAttempts(parseInt(savedAttempts));
    }
  }, []);

  const handleGenerate = () => {
    if (attempts <= 0) {
      setShowPremiumModal(true);
      return;
    }

    if (!prompt.trim()) return;

    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const newAttempts = attempts - 1;
      setAttempts(newAttempts);
      localStorage.setItem('ai_attempts', newAttempts.toString());

      setResult([
        `What is the main concept of ${prompt}?`,
        `Explain the importance of ${prompt} in modern context.`,
        `Which of the following is NOT related to ${prompt}?`,
        `True or False: ${prompt} was discovered in the 20th century.`
      ]);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <section className="py-24 bg-purple-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-100 text-primary text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles size={14} /> AI-Powered
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
              Create Quizzes in Seconds with AI Magic
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Just describe your topic and let our AI generate engaging questions, multiple choice answers, and even explanations.
            </p>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-gray-900">Try it out!</span>
                <span className={`text-sm font-bold ${attempts > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {attempts} free generations left
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Solar System, World War II, Photosynthesis"
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles size={20} />
                  )}
                  Generate
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { title: "Instant Generation", desc: "Create complete quizzes with 10+ questions in under a minute" },
                { title: "Save Time", desc: "Spend less time preparing and more time teaching" },
                { title: "High Quality", desc: "AI ensures diverse, engaging questions every time" }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-primary mt-1 flex-shrink-0">
                    <Zap size={14} fill="currentColor" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 relative overflow-hidden min-h-[400px]">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>

              <div className="flex items-center gap-2 mb-6 text-gray-400 text-xs font-medium uppercase tracking-wider">
                <Sparkles size={14} /> AI Quiz Generator
              </div>

              {result ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-purple-50 rounded-xl p-4 border border-purple-100"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-primary bg-white px-2 py-1 rounded shadow-sm">Generated Quiz: {prompt}</span>
                  </div>
                  <div className="space-y-3">
                    {result.map((q, i) => (
                      <div key={i} className="flex gap-3 text-sm text-gray-700">
                        <span className="font-bold text-primary">{i + 1}.</span>
                        <span>{q}</span>
                      </div>
                    ))}
                    <div className="text-xs text-gray-400 pl-6">+ 6 more questions</div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Sparkles size={32} className="text-gray-300" />
                  </div>
                  <p>Enter a topic to see the magic happen!</p>
                </div>
              )}

              {/* Premium Modal Overlay */}
              {showPremiumModal && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 p-6">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-2xl shadow-2xl p-8 text-center border border-purple-100 max-w-sm"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                      <Sparkles size={32} fill="currentColor" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Upgrade to Premium</h3>
                    <p className="text-gray-600 mb-6">You've used all your free AI generations. Upgrade now for unlimited quizzes!</p>
                    <button
                      onClick={() => setShowPremiumModal(false)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg hover:scale-105 transition-transform"
                    >
                      Get Unlimited Access
                    </button>
                    <button
                      onClick={() => setShowPremiumModal(false)}
                      className="mt-4 text-sm text-gray-500 hover:text-gray-700 font-medium"
                    >
                      Maybe Later
                    </button>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CTA = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-[#7C4DFF] to-[#651fff] text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
          Ready to Transform Your Classroom?
        </h2>
        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Join thousands of teachers worldwide making learning fun with interactive AI-powered quizzes.
        </p>
        <Link href="/login" className="px-10 py-4 rounded-full bg-white text-primary font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-2 mx-auto">
          <Play size={20} fill="currentColor" />
          Start Creating Free
        </Link>
        <p className="mt-6 text-white/60 text-sm">No credit card required — Free forever</p>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white py-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <GraduationCap size={20} fill="currentColor" />
          </div>
          <span className="text-xl font-bold text-gray-900">Test Hub</span>
        </div>

        <div className="flex justify-center gap-8 text-sm text-gray-500 mb-8">
          <a href="#" className="hover:text-primary">About Us</a>
          <a href="#" className="hover:text-primary">Features</a>
          <a href="#" className="hover:text-primary">Pricing</a>
          <a href="#" className="hover:text-primary">Privacy</a>
          <a href="#" className="hover:text-primary">Terms</a>
          <a href="/login" className="hover:text-primary font-bold">Admin Portal</a>
          <a href="#" className="hover:text-primary">Support</a>
        </div>

        <p className="text-gray-400 text-sm">© 2025 Test Hub. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />
      <Hero />
      <TrendingQuizzes />
      <Features />
      <AISection />
      <CTA />
      <Footer />
    </div>
  );
}
