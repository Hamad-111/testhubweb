"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc, setDoc, orderBy, limit, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Users, Plus, ShieldCheck, BookOpen, GraduationCap, ChevronRight, X, UserPlus, Settings2, Rocket, Copy, CheckCircle2, Search, Mail, Calendar } from "lucide-react";

export default function GroupsPage() {
    const { user, loading } = useAuth();
    const [groups, setGroups] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [isRosterOpen, setIsRosterOpen] = useState(false);

    // Helper to generate 6-char alphanumeric code
    const generateClassCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const fetchGroups = async () => {
        if (!user) return;
        setFetching(true);
        try {
            const q = query(collection(db, "classes"), where("instructorId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            const fetchedGroups: any[] = [];
            for (const document of querySnapshot.docs) {
                const data = document.data();
                if (!data.classCode) {
                    const newCode = generateClassCode();
                    await updateDoc(document.ref, { classCode: newCode });
                    fetchedGroups.push({ id: document.id, ...data, classCode: newCode });
                } else {
                    fetchedGroups.push({ id: document.id, ...data });
                }
            }
            setGroups(fetchedGroups);
        } catch (error) {
            console.error("Error fetching groups:", error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (!loading && user) {
            fetchGroups();
        }
    }, [user, loading]);

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName.trim() || !user) return;

        setIsCreating(true);
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();

            if (!userData || userData.role !== 'instructor') {
                throw new Error(`Profile verify failed: Role is ${userData?.role || 'user'}. Please click "Repair Profile"!`);
            }

            const classCode = generateClassCode();

            await addDoc(collection(db, "classes"), {
                name: newGroupName,
                classCode: classCode,
                instructorId: user.uid,
                instructorName: userData.name || user.displayName || "Unknown",
                createdAt: serverTimestamp(),
                studentCount: 0,
                status: 'active'
            });

            setNewGroupName("");
            setIsModalOpen(false);
            fetchGroups();
            setIsCreating(false);
        } catch (error: any) {
            console.error(`Failed to create group:`, error);
            alert(`Permission Denied: ${error.message}\n\nIf this persists, please use the "Repair Profile" button.`);
            setIsCreating(false);
        }
    };

    const repairPermissions = async () => {
        if (!user) return;
        try {
            await setDoc(doc(db, "users", user.uid), {
                name: user.displayName || "Teacher",
                email: user.email,
                role: "instructor",
                status: "active",
                updatedAt: serverTimestamp()
            }, { merge: true });
            alert("Permissions repaired! Please try creating a group now.");
        } catch (e: any) {
            alert("Failed to repair: " + e.message);
        }
    };

    if (loading || (fetching && groups.length === 0)) {
        return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Loading...</div>;
    }

    if (!user) return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Access Denied</div>;

    return (
        <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
            <Sidebar role="instructor" userName={user.displayName || "Teacher"} />

            <main className="flex-1 md:ml-72 p-6 md:p-12 w-full animate-fade-in">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 animate-slide-up">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                    Classroom Management
                                </span>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {groups.length} active ensembles
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                                Student Ensembles
                                <Users size={28} className="text-primary" />
                            </h1>
                            <p className="text-slate-500 font-medium mt-1">Organize student groups, manage rosters, and distribute assessments.</p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={repairPermissions}
                                className="group px-6 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:text-primary hover:border-primary/20 transition-all flex items-center gap-2"
                            >
                                <ShieldCheck size={16} className="group-hover:animate-pulse" /> Repair Profile
                            </button>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-8 py-3 premium-gradient text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-[0_15px_40px_rgba(70,23,143,0.4)] hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3"
                            >
                                <Plus size={20} /> Create Ensemble
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    {groups.length === 0 ? (
                        <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-24 text-center group hover:border-primary/20 transition-all duration-700 animate-slide-up">
                            <div className="text-7xl mb-8 grayscale group-hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-110 animate-float">👥</div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">No active ensembles found</h3>
                            <p className="text-slate-400 font-medium mb-10 max-w-sm mx-auto leading-relaxed">Organize your scholars into optimized groups for personalized assessment delivery.</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all shadow-xl active:scale-95"
                            >
                                Construct First Group
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {groups.map((group, idx) => (
                                <div key={group.id} className="group bg-white rounded-[2.5rem] shadow-premium p-8 border border-white hover:border-primary/20 transition-all duration-500 animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-3xl group-hover:bg-primary group-hover:text-white transition-all duration-700 transform group-hover:rotate-6">
                                            🏫
                                        </div>
                                        <button title="Group settings" className="p-2 text-slate-300 hover:text-primary transition-colors">
                                            <Settings2 size={18} />
                                        </button>
                                    </div>

                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1 group-hover:text-primary transition-colors">{group.name}</h3>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-black text-slate-500 ring-1 ring-slate-100">
                                                    {i}
                                                </div>
                                            ))}
                                            <div className="w-6 h-6 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-[8px] font-black ring-1 ring-slate-100">
                                                +{group.studentCount || 0}
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollment Status</span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl mb-8 border border-slate-100 group/code relative overflow-hidden">
                                        <div className="relative z-10">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter block mb-1">Access Protocol</span>
                                            <span className="text-lg font-black text-slate-900 tracking-widest leading-none font-mono">{group.classCode || "N/A"}</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(group.classCode || "");
                                                // Could add a toast here
                                            }}
                                            className="p-3 bg-white text-slate-400 hover:text-primary rounded-xl shadow-sm border border-slate-100 transition-all active:scale-90"
                                            title="Copy Class Code"
                                        >
                                            <Copy size={16} />
                                        </button>
                                        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-12 h-12 bg-primary/5 rounded-full blur-xl group-hover/code:bg-primary/10 transition-colors" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => {
                                                setSelectedGroup(group);
                                                setIsRosterOpen(true);
                                            }}
                                            className="group-hover:bg-slate-900 group-hover:text-white group-hover:border-transparent py-4 text-[10px] font-black text-primary bg-slate-50 border border-transparent rounded-2xl tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                                        >
                                            <GraduationCap size={14} /> View Roster
                                        </button>
                                        <button className="py-4 text-[10px] font-black text-slate-500 bg-white border border-slate-100 rounded-2xl tracking-widest uppercase hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                            <BookOpen size={14} /> Deploy
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in">
                        <div className="bg-white rounded-[3rem] w-full max-w-xl p-12 shadow-2xl animate-scale-up border border-white">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">New Ensemble</h2>
                                    <p className="text-slate-400 uppercase text-[10px] font-black tracking-[0.3em]">Configure academic grouping</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    title="Close modal"
                                    className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateGroup} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Universal Designation</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
                                            <UserPlus size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            autoFocus
                                            className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-[1.5rem] outline-none transition-all font-black text-slate-900 placeholder:text-slate-200"
                                            placeholder="e.g. Quantum Physics - Tier A"
                                            value={newGroupName}
                                            onChange={(e) => setNewGroupName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start gap-4">
                                    <ShieldCheck size={20} className="text-indigo-600 mt-1" />
                                    <p className="text-xs font-bold text-indigo-700 leading-relaxed italic">
                                        "Automated enrollment syncing will be active for this group. Rosters update in real-time."
                                    </p>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-5 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
                                    >
                                        Cancel Protocol
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="flex-[2] py-5 bg-slate-900 text-white font-black rounded-[1.4rem] shadow-2xl hover:bg-primary transform hover:-translate-y-1 transition-all disabled:opacity-50 text-xs uppercase tracking-widest flex items-center justify-center gap-3"
                                    >
                                        {isCreating ? "Initializing..." : <><Rocket size={18} /> Construct Group</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>

            {/* Roster Modal */}
            {isRosterOpen && selectedGroup && (
                <RosterModal
                    isOpen={isRosterOpen}
                    onClose={() => setIsRosterOpen(false)}
                    group={selectedGroup}
                />
            )}
        </div>
    );
}

function RosterModal({ isOpen, onClose, group }: { isOpen: boolean, onClose: () => void, group: any }) {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoster = async () => {
            setLoading(true);
            try {
                // Fetch students matching the group's classCode, avoiding composite index requirement
                const q = query(
                    collection(db, "users"),
                    where("schoolCode", "==", group.classCode)
                );
                const querySnapshot = await getDocs(q);
                const studentsList: any[] = [];
                querySnapshot.docs.forEach((doc) => {
                    const data = doc.data();
                    if (data.role === "student") {
                        studentsList.push({ id: doc.id, ...data });
                    }
                });
                setStudents(studentsList);
            } catch (error) {
                console.error("Error fetching roster:", error);
            } finally {
                setLoading(false);
            }
        };

        if (group?.classCode) {
            fetchRoster();
        } else {
            setLoading(false);
        }
    }, [group]);

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-scale-up border border-white overflow-hidden">
                {/* Modal Header */}
                <div className="p-12 pb-6 border-b border-slate-50">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                    Ensemble Roster
                                </span>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                                    CODE: {group.classCode}
                                </span>
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{group.name}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-4 bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type="text"
                                placeholder="Search scholar name or ID..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-xl outline-none text-xs font-bold text-slate-600 transition-all"
                            />
                        </div>
                        <div className="flex items-center px-6 py-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 gap-2">
                            <Users size={16} />
                            <span className="text-xs font-black uppercase tracking-widest">{students.length} Enrolled</span>
                        </div>
                    </div>
                </div>

                {/* Modal Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-12 pt-6 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Syncing Student Records...</span>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                            <div className="text-6xl mb-6">🔭</div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Workspace Empty</h3>
                            <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto mb-8">No students have initialized their enrollment with this class code yet.</p>
                            <button
                                onClick={() => navigator.clipboard.writeText(group.classCode)}
                                className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-primary/20 hover:text-primary transition-all flex items-center gap-2 mx-auto"
                            >
                                <Copy size={14} /> Copy Invitation Code
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-12 px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <div className="col-span-1">#</div>
                                <div className="col-span-5">Scholar Identity</div>
                                <div className="col-span-4">Contact Protocol</div>
                                <div className="col-span-2 text-right">Join Date</div>
                            </div>
                            {students.map((student, index) => (
                                <div key={student.id} className="grid grid-cols-12 items-center px-6 py-4 bg-white border border-slate-100 rounded-2xl hover:border-primary/20 hover:shadow-sm transition-all group">
                                    <div className="col-span-1 text-xs font-black text-slate-300">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </div>
                                    <div className="col-span-5 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center text-white font-black text-sm shadow-sm group-hover:scale-110 transition-transform">
                                            {student.name?.charAt(0).toUpperCase() || "S"}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 leading-none mb-1 capitalize group-hover:text-primary transition-colors">{student.name}</h4>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">UID: {student.id.slice(0, 8)}...</span>
                                        </div>
                                    </div>
                                    <div className="col-span-4 flex items-center gap-2 text-slate-500">
                                        <Mail size={12} className="text-slate-300" />
                                        <span className="text-xs font-bold truncate">{student.email}</span>
                                    </div>
                                    <div className="col-span-2 text-right flex items-center justify-end gap-2 text-slate-400">
                                        <Calendar size={12} className="text-slate-300" />
                                        <span className="text-[10px] font-black uppercase tracking-tighter">
                                            {student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-8 bg-slate-50 flex justify-between items-center">
                    <p className="text-[10px] font-bold text-slate-400 italic">
                        "Real-time roster synchronization active. New enrollments will appear automatically."
                    </p>
                    <button
                        onClick={onClose}
                        className="px-10 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary shadow-lg transition-all"
                    >
                        Close Portal
                    </button>
                </div>
            </div>
        </div>
    );
}
