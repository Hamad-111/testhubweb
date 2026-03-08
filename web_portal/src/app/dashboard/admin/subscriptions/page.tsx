"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { collection, query, orderBy, getDocs, doc, updateDoc, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminSubscriptions() {
    const { user, loading } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && user?.role !== 'admin') {
            // Redirect or show error handled by layout/sidebar usually, but safe to just return
        }

        if (user?.role === 'admin') {
            fetchRequests();
        }
    }, [user, loading]);

    const fetchRequests = async () => {
        setLoadingRequests(true);
        try {
            const q = query(
                collection(db, "subscription_requests"),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoadingRequests(false);
        }
    };

    const handleApprove = async (request: any) => {
        if (!confirm(`Are you sure you want to verify payment for ${request.userName}?`)) return;

        setProcessingId(request.id);
        try {
            // 1. Update Request Status
            await updateDoc(doc(db, "subscription_requests", request.id), {
                status: 'approved',
                approvedAt: serverTimestamp(),
                approvedBy: user?.email
            });

            // 2. Update User Subscription Status
            // Calculate expiry
            const now = new Date();
            let expiry = new Date();
            if (request.planId.includes('yearly')) {
                expiry.setFullYear(now.getFullYear() + 1);
            } else {
                expiry.setMonth(now.getMonth() + 1);
            }

            await updateDoc(doc(db, "users", request.userId), {
                subscriptionStatus: 'active',
                planId: request.planId,
                subscriptionExpiry: expiry,
                updatedAt: serverTimestamp()
            });

            alert("Subscription approved successfully!");
            fetchRequests();
        } catch (error: any) {
            console.error("Error approving:", error);
            alert("Failed to approve: " + error.message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (requestId: string) => {
        if (!confirm("Reject this payment request?")) return;

        setProcessingId(requestId);
        try {
            await updateDoc(doc(db, "subscription_requests", requestId), {
                status: 'rejected',
                rejectedAt: serverTimestamp(),
                rejectedBy: user?.email
            });
            fetchRequests();
        } catch (error: any) {
            alert("Failed to reject: " + error.message);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Loading...</div>;
    if (user?.role !== 'admin') return <div className="p-8">Access Denied: Admins Only</div>;

    return (
        <div className="flex min-h-screen bg-[#f2f2f2]">
            <Sidebar role="admin" userName={user.displayName || "Admin"} />

            <main className="flex-1 ml-64 p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-black text-[#333]">Subscription Requests</h1>
                    <button
                        onClick={fetchRequests}
                        className="px-4 py-2 bg-white border rounded hover:bg-gray-50 text-sm font-bold"
                    >
                        Refresh 🔄
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 font-bold text-gray-600">User</th>
                                    <th className="p-4 font-bold text-gray-600">Plan</th>
                                    <th className="p-4 font-bold text-gray-600">Amount</th>
                                    <th className="p-4 font-bold text-gray-600">Transaction ID</th>
                                    <th className="p-4 font-bold text-gray-600">Date</th>
                                    <th className="p-4 font-bold text-gray-600">Status</th>
                                    <th className="p-4 font-bold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loadingRequests ? (
                                    <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading requests...</td></tr>
                                ) : requests.length === 0 ? (
                                    <tr><td colSpan={7} className="p-8 text-center text-gray-500">No subscription requests found.</td></tr>
                                ) : (
                                    requests.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50">
                                            <td className="p-4">
                                                <div className="font-bold text-[#333]">{req.userName}</div>
                                                <div className="text-xs text-gray-500">{req.userEmail}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-purple-100 text-[#46178f] text-xs font-bold px-2 py-1 rounded">
                                                    {req.planId === 'premium_yearly' ? 'Yearly' : 'Monthly'}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono font-bold">
                                                Rs. {req.amount?.toLocaleString()}
                                            </td>
                                            <td className="p-4 font-mono text-blue-600">
                                                {req.transactionId}
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">
                                                {req.createdAt?.seconds ? new Date(req.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="p-4">
                                                {req.status === 'pending' && (
                                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">Pending</span>
                                                )}
                                                {req.status === 'approved' && (
                                                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">Approved</span>
                                                )}
                                                {req.status === 'rejected' && (
                                                    <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">Rejected</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {req.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleApprove(req)}
                                                            disabled={processingId === req.id}
                                                            className="px-3 py-1 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(req.id)}
                                                            disabled={processingId === req.id}
                                                            className="px-3 py-1 bg-red-100 text-red-600 rounded text-xs font-bold hover:bg-red-200 disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
