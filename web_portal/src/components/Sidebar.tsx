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
                className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Sidebar Container */}
            <div className={`
                    w-64 bg-white h-screen fixed left-0 top-0 shadow-lg flex flex-col z-50 border-r border-gray-200 
                    transition-transform duration-300 ease-in-out
                    md:translate-x-0 
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                `}>
                {/* Logo Area */}
                <div className="p-4 bg-[#46178f] text-white flex items-center justify-between">
                    <span className="text-2xl font-black tracking-tight">Test Hub!</span>
                    {/* Close Button for Mobile */}
                    <button onClick={onClose} className="md:hidden text-white hover:bg-white/10 p-1 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* ... (rest of the component remains strictly the same) ... */}
                {/* User Profile Card */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#1368ce] flex items-center justify-center text-white font-bold text-lg">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <h3 className="font-bold text-sm truncate text-[#333]">{userName}</h3>
                            <p className="text-xs text-gray-500 capitalize">{role}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-2 space-y-1 overflow-y-auto mt-2">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => onClose && onClose()} // Close sidebar on link click (mobile)
                                className={`flex items-center gap-3 px-4 py-3 rounded font-bold transition-all ${isActive
                                    ? "bg-[#f2f2f2] text-[#46178f] border-l-4 border-[#46178f]"
                                    : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                <span className="text-xl">{link.icon}</span>
                                <span>{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Create Button (Teacher Only) */}
                {role === "instructor" && (
                    <div className="p-4 mt-auto">
                        <Link href="/dashboard/teacher/create" onClick={() => onClose && onClose()}>
                            <button className="w-full bg-[#46178f] text-white py-3 rounded-lg font-bold shadow-lg hover:bg-[#3c147a] hover:shadow-xl transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                                <span className="text-xl">+</span>
                                <span>Create</span>
                            </button>
                        </Link>
                    </div>
                )}

                {/* Logout */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-2 text-gray-500 hover:text-[#e21b3c] font-bold text-sm transition-colors"
                    >
                        <span>Sign out</span>
                    </button>
                </div>
            </div>
        </>
    );
}
