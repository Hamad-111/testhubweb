import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
    const { user } = useAuth();
    const [step, setStep] = useState<'plans' | 'payment'>('plans');
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
    const [transactionId, setTransactionId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen || !user) return null;

    const plans: any = {
        instructor: {
            monthly: {
                id: 'premium_monthly',
                name: 'Premium Monthly',
                price: 5000, // PKR
                period: 'month'
            },
            yearly: {
                id: 'premium_yearly',
                name: 'Premium Yearly',
                price: 50000, // PKR (10 months price)
                period: 'year'
            }
        },
        student: {
            monthly: {
                id: 'student_monthly',
                name: 'Student Monthly',
                price: 500, // PKR
                period: 'month'
            },
            yearly: {
                id: 'student_yearly',
                name: 'Student Yearly',
                price: 5000, // PKR
                period: 'year'
            }
        }
    };

    const role = user.role === 'student' ? 'student' : 'instructor';
    const currentPlans = plans[role] || plans.instructor;

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await addDoc(collection(db, 'subscription_requests'), {
                userId: user.uid,
                userName: user.displayName || 'Unknown',
                userEmail: user.email,
                userRole: user.role, // Added role to request
                planId: currentPlans[selectedPlan].id,
                amount: currentPlans[selectedPlan].price,
                transactionId,
                status: 'pending',
                createdAt: serverTimestamp()
            });

            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                        ✓
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
                    <p className="text-gray-600 mb-6">
                        Your payment verification request has been sent to the admin.
                        Once approved, you will get access to all AI features.
                    </p>
                    <button
                        onClick={onClose}
                        className="bg-[#46178f] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#3c147a]"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Upgrade to Premium 🚀</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        ✕
                    </button>
                </div>

                <div className="p-6">
                    {step === 'plans' ? (
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Monthly Plan */}
                                <div
                                    onClick={() => setSelectedPlan('monthly')}
                                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${selectedPlan === 'monthly'
                                        ? 'border-[#46178f] bg-purple-50'
                                        : 'border-gray-200 hover:border-purple-200'
                                        }`}
                                >
                                    <h3 className="font-bold text-lg">{currentPlans.monthly.name}</h3>
                                    <div className="text-3xl font-black text-[#46178f] my-2">
                                        Rs. {currentPlans.monthly.price.toLocaleString()}<span className="text-sm text-gray-500 font-normal">/{currentPlans.monthly.period}</span>
                                    </div>
                                    <ul className="text-sm text-gray-600 space-y-2 mt-4">
                                        <li>✓ Unlimited AI Quiz Generation</li>
                                        <li>✓ Advanced Analytics</li>
                                        <li>✓ Priority Support</li>
                                    </ul>
                                </div>

                                {/* Yearly Plan */}
                                <div
                                    onClick={() => setSelectedPlan('yearly')}
                                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${selectedPlan === 'yearly'
                                        ? 'border-[#46178f] bg-purple-50'
                                        : 'border-gray-200 hover:border-purple-200'
                                        }`}
                                >
                                    <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded inline-block mb-2">
                                        SAVE 17%
                                    </div>
                                    <h3 className="font-bold text-lg">{currentPlans.yearly.name}</h3>
                                    <div className="text-3xl font-black text-[#46178f] my-2">
                                        Rs. {currentPlans.yearly.price.toLocaleString()}<span className="text-sm text-gray-500 font-normal">/{currentPlans.yearly.period}</span>
                                    </div>
                                    <ul className="text-sm text-gray-600 space-y-2 mt-4">
                                        <li>✓ All Monthly Features</li>
                                        <li>✓ 2 Months Free</li>
                                    </ul>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep('payment')}
                                className="w-full bg-[#46178f] text-white py-3 rounded-lg font-bold hover:bg-[#3c147a] transition-colors"
                            >
                                Continue to Payment
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-bold mb-2">Payment Details (Easypaisa)</h3>
                                <p className="text-sm text-gray-600 mb-1">Account Number: <span className="font-mono font-bold text-black">03123456789</span></p>
                                <p className="text-sm text-gray-600">Account Name: <span className="font-bold text-black">Test Hub Admin</span></p>
                                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Total Amount:</span>
                                    <span className="text-xl font-bold text-[#46178f]">
                                        Rs. {currentPlans[selectedPlan].price.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleSubscribe} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Transaction ID (TID)
                                    </label>
                                    <input
                                        type="text"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded focus:border-[#46178f] outline-none"
                                        placeholder="e.g. 1234567890"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Please enter the 11-12 digit Transaction ID sent by Easypaisa.
                                    </p>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep('plans')}
                                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-4 py-3 bg-[#46178f] text-white rounded-lg font-bold hover:bg-[#3c147a] disabled:opacity-50"
                                    >
                                        {loading ? 'Submitting...' : 'Submit Request'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
