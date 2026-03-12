"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { collection, query, orderBy, getDocs, doc, updateDoc, serverTimestamp, where, addDoc } from "firebase/firestore";
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
            // 1. Resolve target user ID (handle guest submissions)
            let targetUserId = request.userId;

            if (targetUserId === 'guest') {
                console.log("Resolving guest user by email:", request.userEmail);
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("email", "==", request.userEmail));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    throw new Error(`Critical: No registered user found with email ${request.userEmail}. The user must sign up before you can approve their payment.`);
                }
                targetUserId = querySnapshot.docs[0].id;
                console.log("Resolved guest to real user ID:", targetUserId);
            }

            // 2. Update Request Status
            await updateDoc(doc(db, "subscription_requests", request.id), {
                status: 'approved',
                approvedAt: serverTimestamp(),
                approvedBy: user?.email,
                resolvedUserId: targetUserId // Track which real user this was linked to
            });

            // 3. Update User Subscription Status
            const now = new Date();
            let expiry = new Date();
            if (request.planId.includes('yearly')) {
                expiry.setFullYear(now.getFullYear() + 1);
            } else {
                expiry.setMonth(now.getMonth() + 1);
            }

            await updateDoc(doc(db, "users", targetUserId), {
                subscriptionStatus: 'active',
                planId: request.planId,
                subscriptionExpiry: expiry,
                updatedAt: serverTimestamp()
            });

            // 4. Trigger Email Notification (Trigger Email Extension pattern)
            try {
                const mailRef = collection(db, "mail");
                const planName = request.planId.includes('yearly') ? 'Premium Yearly' : 'Pro Monthly';
                await addDoc(mailRef, {
                    to: request.userEmail,
                    message: {
                        subject: `Welcome to TestHub Pro! 🚀`,
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                <h1 style="color: #46178f; text-align: center;">Subscription Activated!</h1>
                                <p>Hello <strong>${request.userName}</strong>,</p>
                                <p>Great news! Your payment has been verified and your <strong>TestHub ${planName}</strong> plan is now active.</p>
                                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 0;"><strong>Plan:</strong> ${planName}</p>
                                    <p style="margin: 5px 0 0 0;"><strong>Expiry Date:</strong> ${expiry.toLocaleDateString()}</p>
                                </div>
                                <p>You now have full access to our AI generation engine, advanced analytics, and all premium features.</p>
                                <div style="text-align: center; margin-top: 30px;">
                                    <a href="https://www.test-hub.site/dashboard/teacher" style="background: #46178f; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px;">Go to Dashboard</a>
                                </div>
                                <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">If you have any questions, feel free to reply to this email.</p>
                            </div>
                        `
                    },
                    createdAt: serverTimestamp()
                });
                console.log("Email notification queued successfully");
            } catch (mailErr) {
                console.error("Failed to queue email notification:", mailErr);
                // We don't fail the whole approval if email fails
            }

            alert(`Subscription approved successfully for ${request.userEmail}! Confirmation email sent.`);
            fetchRequests();
        } catch (error: any) {
            console.error("Error approving:", error);
            alert("Approval Failed: " + error.message);
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
        <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
            <Sidebar role="admin" userName={user.displayName || "Admin"} />

            <main className="flex-1 md:ml-72 p-6 md:p-12 w-full animate-fade-in">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-slide-up">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Subscription Vault</h1>
                        <p className="text-slate-500 font-medium mt-1">Review and verify premium membership requests across the ecosystem.</p>
                    </div>
                    <button
                        onClick={fetchRequests}
                        className="px-6 py-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 text-sm font-black text-primary shadow-sm hover:shadow-md transition-all flex items-center gap-2 active:scale-95"
                    >
                        Sync Data <span className="animate-spin-slow">🔄</span>
                    </button>
                </div>

                {/* Table Container - Glass Effect */}
                <div className="bg-white rounded-[2.5rem] shadow-premium border border-white overflow-hidden animate-slide-up [animation-delay:200ms]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member Entity</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Plan tier</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Financials</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction UUID</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verification</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loadingRequests ? (
                                    <tr>
                                        <td colSpan={7} className="p-24 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Querying database...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-24 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-40">
                                                <span className="text-6xl">📥</span>
                                                <p className="text-slate-500 font-black text-sm uppercase tracking-widest">No pending verifications found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((req, index) => (
                                        <tr key={req.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl premium-gradient text-white flex items-center justify-center font-black text-sm shadow-lg group-hover:scale-110 transition-transform">
                                                        {req.userName?.charAt(0).toUpperCase() || "U"}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">{req.userName}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 leading-none">{req.userEmail}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${req.planId?.includes('yearly')
                                                    ? "bg-purple-50 text-purple-600 border-purple-100"
                                                    : "bg-blue-50 text-blue-600 border-blue-100"
                                                    }`}>
                                                    {req.planId?.includes('yearly') ? 'Yearly Premium' : 'Monthly Pro'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-black text-slate-800 tracking-tighter">Rs. {req.amount?.toLocaleString()}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <code className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 uppercase tracking-tighter">
                                                    {req.transactionId || 'SYS-AUTO-000'}
                                                </code>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-500 tracking-tight">
                                                        {req.createdAt?.seconds ? new Date(req.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                                    </span>
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Entry Date</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full animate-pulse ${req.status === 'approved' ? 'bg-green-500' : req.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${req.status === 'approved' ? 'text-green-600' : req.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                                                        }`}>
                                                        {req.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {req.status === 'pending' ? (
                                                    <div className="flex justify-end gap-3 translate-x-2 opacity-80 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                                        <button
                                                            onClick={() => handleApprove(req)}
                                                            disabled={processingId === req.id}
                                                            className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 shadow-md hover:shadow-green-200 transition-all active:scale-95 disabled:opacity-50"
                                                        >
                                                            {processingId === req.id ? '...' : 'Verify'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(req.id)}
                                                            disabled={processingId === req.id}
                                                            className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Archived</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Insight */}
                <div className="mt-12 text-center animate-fade-in [animation-delay:800ms]">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] bg-white px-8 py-3 rounded-2xl border border-slate-50 shadow-sm">
                        Revenue Integrity Protocol v2.4.0 • {requests.length} Historical Records
                    </span>
                </div>
            </main>
        </div>
    );
}
