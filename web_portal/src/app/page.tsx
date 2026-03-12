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
  X,
  Rocket
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

// --- Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 top-0 left-0 transition-all duration-500 ${scrolled ? 'py-4' : 'py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-all duration-500 rounded-full px-6 ${scrolled ? 'h-16 glass' : 'h-14 bg-transparent'}`}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-light to-secondary-light rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <GraduationCap size={24} fill="currentColor" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              TestHub
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-slate-300 hover:text-white text-sm font-semibold transition-colors">
              Features
            </Link>
            <Link href="/#pricing" className="text-slate-300 hover:text-white text-sm font-semibold transition-colors">
              Pricing
            </Link>
            <Link href="/join" className="text-slate-300 hover:text-white text-sm font-semibold transition-colors flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              Join Game
            </Link>
            <div className="flex items-center gap-4 ml-4">
              <Link
                href="/login"
                className="text-white/80 hover:text-white text-sm font-bold transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 rounded-full bg-white text-slate-900 text-sm font-bold hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300"
              >
                Sign Up
              </Link>
            </div>
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
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-slate-950">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-secondary/30 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border-white/20 text-white mb-10 mx-auto"
        >
          <div className="relative flex h-3 w-3">
            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
          </div>
          <span className="text-sm font-bold tracking-wide uppercase">Generative AI Workspace</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-black text-white mb-8 leading-[1.1] tracking-tight"
        >
          Make Learning <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-primary-light">
            Unforgettable
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed"
        >
          Create stunning quizzes with AI in seconds. Host live interactive games that students absolutely love, powered by real-time analytics.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24"
        >
          <Link href="/signup" className="group relative w-full sm:w-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-light to-secondary-light rounded-2xl blur opacity-70 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
            <div className="relative px-8 py-4 bg-slate-900 rounded-xl leading-none flex items-center justify-center gap-3 text-white font-bold text-lg hover:bg-slate-800 transition-colors">
              <Zap size={20} className="text-accent" />
              Start Creating Free
            </div>
          </Link>
          <Link href="/join" className="w-full sm:w-auto px-8 py-4 rounded-xl glass text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-3">
            <Play size={20} />
            Join Game
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {[
            { label: "Active Early Users", value: "25+", icon: <Users size={20} className="text-blue-400" /> },
            { label: "AI Quizzes Created", value: "150+", icon: <Sparkles size={20} className="text-accent" /> },
            { label: "Partner Institutions", value: "5+", icon: <Globe size={20} className="text-green-400" /> },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl glass-card flex items-center gap-6 text-left hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                {stat.icon}
              </div>
              <div>
                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-slate-400 font-medium text-sm text-balance">{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade out */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-950 to-transparent z-10"></div>
    </section>
  );
};


const Features = () => {
  return (
    <section id="features" className="py-32 bg-slate-900 border-t border-white/5 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute -left-32 top-32 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Built for Modern Educators</h2>
            <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto">Join our early access program and help shape the future of interactive learning.</p>
          </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Lightning Fast Engine", desc: "Create professional quizzes in under 60 seconds with our advanced AI-powered generator.", icon: <Zap size={28} />, color: "text-accent", bg: "bg-accent/10", border: "border-accent/20" },
            { title: "Live Multiplayer", desc: "Host real-time quiz sessions with your whole class simultaneously with zero lag.", icon: <Users size={28} />, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
            { title: "Smart Analytics API", desc: "Track progress with detailed insights, identify knowledge gaps, and export reports instantly.", icon: <BarChart2 size={28} />, color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-3xl glass-card group text-left relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500`} />

              <div className={`w-16 h-16 rounded-2xl ${feature.bg} ${feature.border} border flex items-center justify-center ${feature.color} mb-8 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{feature.desc}</p>

              <div className="mt-8 flex items-center text-sm font-bold text-white group-hover:text-primary-light transition-colors">
                Learn more <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
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
        `What is the central mechanism behind ${prompt}?`,
        `Analyze the impact of ${prompt} on contemporary society.`,
        `Which of the following elements is NOT associated with ${prompt}?`,
        `True or False: The fundamental principles of ${prompt} were established recently.`
      ]);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <section className="py-32 bg-slate-950 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950/50 pointer-events-none" />
      <div className="absolute -right-1/4 top-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Left Content */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary-light text-xs font-bold uppercase tracking-widest mb-8 border border-primary/30">
              <Sparkles size={14} /> AI Workspace
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-[1.1]">
              Generate Magic <br />in <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-400">Seconds</span>
            </h2>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed font-light">
              Just describe your topic and watch as our advanced AI constructs engaging questions, plausible distractors, and detailed explanations instantly.
            </p>

            <div className="glass-card p-6 rounded-3xl mb-10 border border-white/10 relative overflow-hidden bg-slate-900/80">
              {/* Shimmer effect */}

              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="font-bold text-white flex items-center gap-2"><Zap size={16} className="text-accent" /> Try the Sandbox</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${attempts > 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {attempts} free generations
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Quantum Physics, The Renaissance..."
                  className="flex-1 px-5 py-4 bg-slate-950/50 border border-slate-700/50 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                  ) : (
                    <Sparkles size={20} />
                  )}
                  {isGenerating ? 'Synthesizing...' : 'Generate'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { title: "Context Aware", desc: "Adapts to grade levels" },
                { title: "Export Ready", desc: "Directly to Kahoot/CSV" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary-light mt-1 flex-shrink-0 border border-primary/30">
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{item.title}</h4>
                    <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Mockup */}
          <div className="flex-1 w-full perspective-1000">
            <div className="rounded-3xl shadow-2xl bg-neutral-900 border border-neutral-800 relative overflow-hidden min-h-[450px] transform md:rotate-y-[-5deg] md:rotate-x-[5deg] transition-transform duration-700 hover:rotate-0">

              <div className="flex items-center gap-2 px-4 py-3 bg-neutral-950 border-b border-neutral-800">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <div className="mx-auto flex items-center gap-2 bg-neutral-900 px-3 py-1 rounded-md border border-neutral-800 text-neutral-500 text-xs font-mono">
                  <Sparkles size={12} /> Quiz Playground
                </div>
              </div>

              <div className="p-6">
                {result ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary-light rounded-lg text-xs font-mono mb-2">
                      &gt; Generated Module: {prompt}
                    </div>
                    {result.map((q, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/50 text-slate-300 text-sm">
                        <span className="font-mono text-primary-light">{i + 1}.</span>
                        <div className="space-y-3 flex-1">
                          <p className="font-medium text-white">{q}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="h-2 bg-neutral-700 rounded w-full"></div>
                            <div className="h-2 bg-neutral-700 rounded w-5/6"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 rounded-full border border-neutral-700 flex items-center justify-center relative z-10 bg-neutral-900">
                        <Zap size={32} className="text-neutral-500" />
                      </div>
                    </div>
                    <p className="text-neutral-500 font-mono text-sm uppercase tracking-widest">Sandbox Ready</p>
                  </div>
                )}
              </div>

              {/* Premium Modal Overlay */}
              {showPremiumModal && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-20 p-6">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card rounded-2xl p-8 text-center max-w-sm border-primary/30"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-accent to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-900 shadow-[0_0_30px_rgba(255,215,0,0.3)] rotate-12">
                      <Sparkles size={32} fill="currentColor" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">Pro Required</h3>
                    <p className="text-slate-400 mb-8 text-sm leading-relaxed">Sandbox limit reached. Upgrade to unlock unlimited AI generations and API access.</p>
                    <button
                      onClick={() => setShowPremiumModal(false)}
                      className="w-full py-4 rounded-xl premium-gradient text-white font-bold shadow-[0_0_20px_rgba(124,77,255,0.4)] hover:scale-[1.02] transition-transform"
                    >
                      Upgrade Workspace
                    </button>
                    <button
                      onClick={() => setShowPremiumModal(false)}
                      className="mt-6 text-sm text-slate-500 hover:text-white font-medium transition-colors"
                    >
                      Dismiss
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

const PaymentModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tid, setTid] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsProcessing(true);
    setError('');

    try {
      await addDoc(collection(db, 'subscription_requests'), {
        userId: 'guest',
        userName: 'Guest User',
        userEmail: email,
        userRole: 'instructor',
        planId: 'premium_monthly',
        amount: 3500,
        transactionId: tid,
        senderPhone: phone,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setStep(2);
    } catch (err: any) {
      console.error('Failed to submit payment request:', err);
      setError('Failed to submit request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header (Easypaisa Green) */}
        <div className="bg-[#00A15F] p-6 text-center">
          <h3 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            easypaisa
          </h3>
          <p className="text-green-100 text-sm mt-1 font-medium">Manual Transfer Verification</p>
        </div>

        <div className="p-8">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                <span className="text-slate-600 text-sm font-bold block mb-1">Please send Rs. 3,500 to:</span>
                <div className="text-2xl font-black text-[#00A15F] tracking-wider mb-1">0300 1234567</div>
                <div className="text-slate-500 text-xs font-medium uppercase tracking-widest">Account Title: TestHub Admin</div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Your Account Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A15F] focus:border-transparent font-medium text-slate-900 transition-all placeholder:font-normal"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">So we can link this payment to your account.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Sender Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+92</span>
                    <input
                      type="tel"
                      placeholder="3XX XXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A15F] focus:border-transparent font-medium text-slate-900 transition-all placeholder:font-normal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Transaction ID (TID)</label>
                  <input
                    type="text"
                    placeholder="Enter 11-digit TID"
                    value={tid}
                    onChange={(e) => setTid(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A15F] focus:border-transparent font-medium text-slate-900 transition-all placeholder:font-normal"
                  />
                  <p className="text-xs text-slate-500 mt-2">You will receive a TID via SMS from 3737 after sending the payment.</p>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={phone.length < 10 || tid.length < 5 || isProcessing}
                  className="w-full py-4 mt-2 bg-[#00A15F] text-white rounded-xl font-bold hover:bg-[#008F54] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#00A15F]/20"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : null}
                  {isProcessing ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
                <Check size={40} strokeWidth={3} />
              </div>
              <h4 className="text-2xl font-black text-slate-900 mb-2">Request Submitted!</h4>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Your payment reference has been sent to the admin panel.
                Your account will be upgraded to <strong className="text-slate-800">TestHub Pro</strong> as soon as the transaction is verified (usually within 15-30 minutes).
              </p>

              <button
                onClick={onClose}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                Return to Dashboard
              </button>
            </motion.div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 text-white hover:bg-black/20 transition-colors"
        >
          <X size={18} strokeWidth={3} />
        </button>
      </motion.div>
    </div>
  );
};

const Pricing = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const plans = [
    {
      name: "Starter",
      price: "Free",
      desc: "Perfect for evaluating the platform.",
      features: ["1 AI Generation daily", "Up to 5 concurrent players", "Basic analytics export", "Community support"],
      cta: "Current Plan",
      premium: false,
      onClick: () => { }
    },
    {
      name: "Pro",
      price: "Rs. 3,500",
      period: "/mo",
      desc: "For educators who need full power & scale.",
      features: ["Unlimited AI Engine Access", "Up to 25 concurrent players", "Advanced behavioral analytics", "Priority 24/7 support", "Custom branding"],
      cta: "Upgrade via easypaisa",
      premium: true,
      onClick: () => {
        if (!user) {
          router.push('/login');
        } else {
          setShowPaymentModal(true);
        }
      }
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "For entire districts and organizations.",
      features: ["Everything in Pro", "Up to 100 concurrent players", "SSO (SAML/OAuth) integration", "Dedicated account manager", "LMS Integration (Canvas/Moodle)"],
      cta: "Contact Sales",
      premium: false,
      onClick: () => { }
    }
  ];

  return (
    <section id="pricing" className="py-32 bg-slate-900 overflow-hidden relative border-t border-slate-800">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]"></div>

      <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Transparent Scaling</h2>
          <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto">
            Choose the tier that matches your deployment size. No hidden fees or complex contracts. Local payments supported via <span className="text-[#00A15F] font-bold">easypaisa</span>.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`p-8 rounded-[2rem] glass-card transition-all duration-300 relative group ${plan.premium ? 'md:-translate-y-4 border-[#00A15F]/50 bg-slate-800/80 shadow-[0_0_50px_rgba(0,161,95,0.15)] pb-12' : 'border-slate-800'
                }`}
            >
              {plan.premium && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#00A15F] text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg whitespace-nowrap">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className={`text-4xl font-black ${plan.premium ? 'text-white' : 'text-slate-200'}`}>{plan.price}</span>
                  {plan.period && <span className="text-slate-500 font-bold">{plan.period}</span>}
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{plan.desc}</p>
              </div>

              <div className="space-y-4 mb-10">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.premium ? 'bg-[#00A15F]/20 text-[#00A15F]' : 'bg-slate-800 text-slate-400'}`}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className={`text-sm font-medium ${plan.premium ? 'text-slate-200' : 'text-slate-400'}`}>{feature}</span>
                  </div>
                ))}
              </div>

              {plan.premium ? (
                <button
                  onClick={plan.onClick}
                  className="w-full py-4 rounded-xl font-bold transition-all bg-[#00A15F] text-white shadow-lg hover:shadow-[#00A15F]/20 hover:scale-105 hover:bg-[#008F54] flex items-center justify-center gap-2"
                >
                  <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center"><Zap size={10} className="text-[#00A15F]" /></span>
                  {plan.cta}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="block w-full text-center py-4 rounded-xl font-bold transition-all bg-slate-800 text-white hover:bg-slate-700"
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => {
  return (
    <section className="py-32 bg-[#020617] text-center relative overflow-hidden border-t border-slate-800">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"></div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
          Ready to Deploy?
        </h2>
        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
          Join our first group of educators already using TestHub to supercharge their learning environments.
        </p>
        <Link href="/signup" className="group relative inline-block">
          <div className="absolute -inset-1 premium-gradient rounded-full blur opacity-70 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative px-12 py-5 bg-slate-900 rounded-full leading-none flex items-center gap-3 text-white font-bold text-lg hover:bg-slate-800 transition-colors">
            <Rocket size={20} className="text-accent" />
            Launch Platform
          </div>
        </Link>
        <p className="mt-8 text-slate-600 text-sm font-medium">No credit card required • Deploy in seconds</p>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#020617] py-16 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary-light border border-primary/30">
            <GraduationCap size={24} fill="currentColor" />
          </div>
          <span className="text-2xl font-black text-white">TestHub</span>
        </div>

        <div className="flex justify-center gap-8 text-sm font-semibold mb-10">
          <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
          <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy API</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/support" className="hover:text-white transition-colors">System Support</Link>
        </div>

        <p className="text-slate-600 text-sm">© {new Date().getFullYear()} TestHub AI Platform. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />
      <Hero />
      <Features />
      <AISection />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
