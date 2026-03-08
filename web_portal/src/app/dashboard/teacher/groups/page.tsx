"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function GroupsPage() {
    const { user, loading } = useAuth();
    const [groups, setGroups] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const fetchGroups = async () => {
        if (!user) return;
        setFetching(true);
        try {
            const q = query(collection(db, "classes"), where("instructorId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            const fetchedGroups: any[] = [];
            querySnapshot.forEach((doc) => {
                fetchedGroups.push({ id: doc.id, ...doc.data() });
            });
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
        // Try 'groups' first, then 'classes' as fallback
        const collectionsToTry = ["groups", "classes"];
        let lastError = "";

        for (const colName of collectionsToTry) {
            try {
                console.log(`Attempting to create in collection: ${colName}`);
                // Verify user document before trying
                const userDoc = await getDoc(doc(db, "users", user.uid));
                const userData = userDoc.data();

                if (!userData || userData.role !== 'instructor') {
                    throw new Error(`Profile verify failed: Role is ${userData?.role || 'null'}. Please click Repair!`);
                }

                await addDoc(collection(db, colName), {
                    name: newGroupName,
                    instructorId: user.uid,
                    instructorName: userData.name || user.displayName || "Unknown",
                    createdAt: serverTimestamp(),
                    studentCount: 0,
                    status: 'active'
                });
                alert(`Success! Created in '${colName}' collection. 🎉`);
                setNewGroupName("");
                setIsModalOpen(false);
                fetchGroups();
                setIsCreating(false);
                return;
            } catch (error: any) {
                console.error(`Failed in ${colName}:`, error);
                lastError = error.message;
            }
        }

        alert(`Permission Denied: Could not create in any known collection. 
        
UID: ${user.uid}
Role: ${user.role}
Collection: ${collectionsToTry.join('/')}
Error: ${lastError}

Tip: Try clicking the "Repair Permissions" button first!`);
        setIsCreating(false);
    };

    if (loading || (fetching && groups.length === 0)) {
        return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Loading...</div>;
    }

    if (!user) return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Access Denied</div>;

    return (
        <div className="flex min-h-screen bg-[#f2f2f2]">
            <Sidebar role="instructor" userName={user.displayName || "Teacher"} />

            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-[#333]">My Groups</h1>
                            <p className="text-gray-500 text-sm mt-1">Organize your students into classes</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={async () => {
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
                                }}
                                className="px-4 py-3 bg-white border-2 border-[#1368ce] text-[#1368ce] rounded-lg font-bold hover:bg-blue-50 transition-all text-sm"
                            >
                                🔧 Repair Permissions
                            </button>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-6 py-3 bg-[#1368ce] text-white rounded-lg font-bold hover:bg-[#0e51a7] transition-all shadow-lg flex items-center gap-2"
                            >
                                <span>+</span> Create New Group
                            </button>
                        </div>
                    </div>

                    {groups.length === 0 ? (
                        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                            <div className="text-6xl mb-4">👥</div>
                            <h3 className="text-xl font-bold text-[#333] mb-2">No groups yet</h3>
                            <p className="text-gray-500 mb-6">Create groups to organize your students and assign quizzes easily.</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-6 py-2 bg-[#1368ce] text-white rounded font-bold hover:bg-[#0e51a7] transition-colors"
                            >
                                Start by Creating a Group
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {groups.map((group) => (
                                <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                                            🏫
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600">•••</button>
                                    </div>
                                    <h3 className="text-xl font-bold text-[#333] mb-1">{group.name}</h3>
                                    <p className="text-sm text-gray-500 mb-6">{group.studentCount || 0} Students enrolled</p>

                                    <div className="flex gap-2">
                                        <button className="flex-1 py-2 text-sm font-bold text-[#1368ce] bg-blue-50 rounded hover:bg-blue-100 transition-colors">
                                            View Group
                                        </button>
                                        <button className="flex-1 py-2 text-sm font-bold text-gray-600 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                                            Assign Quiz
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl scale-in-center">
                            <h2 className="text-2xl font-black text-[#333] mb-2">Create New Group</h2>
                            <p className="text-gray-500 mb-6 uppercase text-[10px] font-black tracking-widest">Provide a name for your class</p>

                            <form onSubmit={handleCreateGroup}>
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Group Name</label>
                                    <input
                                        type="text"
                                        autoFocus
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#1368ce] focus:bg-white rounded-xl outline-none transition-all font-medium"
                                        placeholder="e.g. Physics Grade 10 - A"
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="flex-1 py-3 bg-[#1368ce] text-white font-bold rounded-xl shadow-lg hover:bg-[#0e51a7] transform hover:-translate-y-0.5 transition-all disabled:opacity-50"
                                    >
                                        {isCreating ? "Creating..." : "Create Group"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
