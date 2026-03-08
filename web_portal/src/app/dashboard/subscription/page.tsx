"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import SubscriptionModal from "@/components/SubscriptionModal";

export default function SubscriptionPage() {
    const { user, loading } = useAuth();
    const [showModal, setShowModal] = useState(false);

    if (loading) return <div className="flex h-screen items-center justify-center font-bold text-[#46178f]">Loading...</div>;
    if (!user) return <div>Access Denied</div>;

    const isActive = user.subscriptionStatus === 'active';
    const isPending = user.subscriptionStatus === 'pending';

    return (
        <div className="flex min-h-screen bg-[#f2f2f2]">
            <Sidebar role={user.role as any} userName={user.displayName || "User"} />

            <main className="flex-1 ml-64 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-black text-[#333] mb-8">My Subscription</h1>

                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl
                                ${isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}
                            `}>
                                {isActive ? '💎' : '🔒'}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[#333]">
                                    {isActive ? 'Premium Member' : 'Free Account'}
                                </h2>
                                <p className="text-gray-500">
                                    {isActive
                                        ? 'You have access to all AI features.'
                                        : 'Upgrade to unlock AI powers.'}
                                </p>
                            </div>
                        </div>

                        {isActive ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                    <h3 className="font-bold text-[#46178f] mb-2">Current Plan</h3>
                                    <p className="text-gray-700">
                                        {user.planId === 'premium_yearly' ? 'Premium Yearly' : 'Premium Monthly'}
                                    </p>
                                </div>
                                {/* <div className="text-sm text-gray-500">
                                    Expires on: {user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString() : 'N/A'}
                                </div> */}
                                <button disabled className="mt-4 px-6 py-2 bg-gray-100 text-gray-400 rounded font-bold cursor-not-allowed">
                                    Manage Subscription
                                </button>
                            </div>
                        ) : (
                            <div>
                                {isPending ? (
                                    <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-100 mb-6">
                                        <strong>Request Pending:</strong> Your payment verification is under review by the admin.
                                        Please wait for approval.
                                    </div>
                                ) : (
                                    <div className="mb-6">
                                        <p className="text-gray-600 mb-4 leading-relaxed">
                                            Unlock the full potential of Test Hub with our Premium plan.
                                            Generate quizzes with AI, get advanced analytics, and priority support.
                                        </p>
                                        <ul className="space-y-2 mb-6 text-gray-600">
                                            <li>✨ Unlimited AI Quiz Generation</li>
                                            <li>📊 Advanced Performance Analytics</li>
                                            <li>🚀 Priority Support</li>
                                        </ul>
                                    </div>
                                )}

                                <button
                                    onClick={() => setShowModal(true)}
                                    disabled={isPending}
                                    className="px-8 py-3 bg-[#46178f] text-white rounded-lg font-bold hover:bg-[#3c147a] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPending ? 'Processing...' : 'Upgrade Now'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <SubscriptionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
}
