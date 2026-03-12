"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface SidebarProps {
    role: "student" | "instructor" | "admin";
    userName: string;
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ role, userName, isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const studentLinks = [
        { name: "Home", icon: "🏠", href: "/dashboard/student" },
        { name: "Discover", icon: "🧭", href: "/dashboard/student/discover" },
        { name: "Library", icon: "📚", href: "/dashboard/student/library" },
        { name: "Notes", icon: "📝", href: "/dashboard/student/notes" },
        { name: "Reports", icon: "📊", href: "/dashboard/student/reports" },
        { name: "Subscription", icon: "💎", href: "/dashboard/subscription" },
        { name: "Settings", icon: "⚙️", href: "/dashboard/settings" },
    ];

    const teacherLinks = [
        { name: "Home", icon: "🏠", href: "/dashboard/teacher" },
        { name: "Discover", icon: "🧭", href: "/dashboard/teacher/discover" },
        { name: "Library", icon: "📚", href: "/dashboard/teacher/library" },
        { name: "Reports", icon: "📊", href: "/dashboard/teacher/reports" },
        { name: "Students", icon: "👨‍🎓", href: "/dashboard/teacher/students" },
        { name: "Groups", icon: "👥", href: "/dashboard/teacher/groups" },
        { name: "Subscription", icon: "💎", href: "/dashboard/subscription" },
        { name: "Settings", icon: "⚙️", href: "/dashboard/settings" },
    ];

    const adminLinks = [
        { name: "Overview", icon: "📊", href: "/dashboard/admin" },
        { name: "Teachers", icon: "👨‍🏫", href: "/dashboard/admin/teachers" },
        { name: "Students", icon: "👨‍🎓", href: "/dashboard/admin/students" },
        { name: "Quizzes", icon: "📝", href: "/dashboard/admin/quizzes" },
        { name: "Activity", icon: "📜", href: "/dashboard/admin/activity" },
        { name: "Subscriptions", icon: "💳", href: "/dashboard/admin/subscriptions" },
        { name: "Settings", icon: "⚙️", href: "/dashboard/settings" },
    ];

    const links = role === "admin" ? adminLinks : role === "student" ? studentLinks : teacherLinks;

    const handleLogout = async () => {
        await auth.signOut();
        router.push("/");
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Sidebar Container */}
            <div className={`
                    w-72 bg-slate-900 h-screen fixed left-0 top-0 shadow-[20px_0_50px_rgba(0,0,0,0.2)] flex flex-col z-50 border-r border-slate-800
                    transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
                    md:translate-x-0 
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                `}>

                {/* Logo Area - Premium Gradient Background */}
                <div className="p-8 premium-gradient relative overflow-hidden group">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-2xl font-black tracking-tighter text-white">TESTHUB</span>
                            <span className="text-[10px] font-bold tracking-[0.2em] text-purple-200 mt-1 uppercase opacity-80">AI Learning Suite</span>
                        </div>
                        <button onClick={onClose} className="md:hidden text-white hover:bg-white/20 p-2 rounded-full transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>

                {/* User Profile Card - Modern Glass Look */}
                <div className="p-6 border-b border-slate-800 mx-4 mt-6 mb-2 rounded-2xl bg-slate-800/40 border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#46178f] to-[#1368ce] flex items-center justify-center text-white font-black text-xl shadow-lg border border-white/10 transform rotate-3 hover:rotate-0 transition-transform">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <h3 className="font-black text-sm text-white truncate tracking-tight">{userName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{role}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation - Modern Hover and Active States */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => onClose && onClose()}
                                className={`flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all duration-300 relative group ${isActive
                                    ? "bg-gradient-to-r from-purple-600/20 to-transparent text-white border-l-4 border-purple-500 shadow-[inset_10px_0_20px_rgba(124,77,255,0.05)]"
                                    : "text-slate-400 hover:text-white hover:bg-white/5 active:scale-95"
                                    }`}
                            >
                                <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-active:scale-95'}`}>
                                    {link.icon}
                                </span>
                                <span className="tracking-tight">{link.name}</span>
                                {isActive && (
                                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_10px_#7c4dff]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Create Button - Enhanced for Pro Feel */}
                {role === "instructor" && (
                    <div className="p-6 bg-slate-900/50 backdrop-blur-sm border-t border-slate-800">
                        <Link href="/dashboard/teacher/create" onClick={() => onClose && onClose()}>
                            <button className="w-full premium-gradient text-white py-4 rounded-xl font-black text-sm shadow-[0_10px_30px_rgba(70,23,143,0.3)] hover:shadow-[0_15px_40px_rgba(70,23,143,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group">
                                <span className="text-2xl group-hover:rotate-90 transition-transform duration-500">+</span>
                                <span className="tracking-widest uppercase">Create Quiz</span>
                            </button>
                        </Link>
                    </div>
                )}

                {/* Logout - Subtle but accessible */}
                <div className="p-6 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-3 text-slate-500 hover:text-rose-400 font-bold text-xs transition-all hover:bg-rose-400/5 rounded-xl border border-transparent hover:border-rose-400/20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        <span className="uppercase tracking-widest">Sign out</span>
                    </button>
                </div>
            </div>
        </>
    );
}
