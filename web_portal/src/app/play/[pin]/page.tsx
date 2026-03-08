"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Timer, Trophy, Star, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Question {
    id: string;
    text: string;
    type: string;
    options: string[];
    correctAnswerIndex: number;
    timer?: number;
    imageUrl?: string;
}

interface Quiz {
    title: string;
    description: string;
    questions: Question[];
    instructorId: string;
    timePerQuestion: number;
    expiresAt?: any; // Firestore Timestamp
}

interface FirestoreQuestion {
    id: string;
    text: string;
    type: string;
    options?: string[];
    correctAnswerIndex: number;
    timer?: number;
    imageUrl?: string;
}

export default function PlayGame() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const pin = params?.pin as string;

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [gameState, setGameState] = useState<'loading' | 'lobby' | 'playing' | 'finished' | 'review'>('loading');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [answersGiven, setAnswersGiven] = useState<number[]>([]);
    const [globalTimeLeft, setGlobalTimeLeft] = useState<number | null>(null);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (!pin) return;

        const fetchQuiz = async () => {
            try {
                const docRef = doc(db, 'quizzes', pin);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Map Firestore data to TypeScript interface
                    const questions = (data.questions || []).map((q: any) => ({
                        id: q.id || Math.random().toString(36).substr(2, 9),
                        text: q.text || q.question || "Untitled Question",
                        type: q.type || "multiple-choice",
                        options: q.options || [],
                        correctAnswerIndex: q.hasOwnProperty('correctAnswerIndex') ? q.correctAnswerIndex : (q.hasOwnProperty('correctAnswer') ? q.correctAnswer : 0),
                        timer: q.timer || q.timeLimit || 30,
                        imageUrl: q.imageUrl
                    }));

                    setQuiz({
                        title: data.title,
                        description: data.description,
                        questions: questions,
                        instructorId: data.instructorId,
                        timePerQuestion: data.timePerQuestion || 30,
                        expiresAt: data.expiresAt
                    });
                    setGameState('lobby');
                } else {
                    alert("Quiz not found");
                    router.push('/join');
                }
            } catch (error) {
                console.error("Error fetching quiz:", error);
                alert("Error loading quiz");
                router.push('/dashboard/student');
            }
        };

        fetchQuiz();
    }, [pin, router]);

    // Timer logic
    useEffect(() => {
        if (gameState === 'playing' && !isAnswerChecked && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !isAnswerChecked) {
            handleAnswerSubmit(-1); // Time's up
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState, isAnswerChecked, timeLeft]);

    // Global Expiry Timer
    useEffect(() => {
        if (!quiz?.expiresAt || gameState === 'finished' || gameState === 'loading') return;

        const timer = setInterval(() => {
            const now = Date.now();
            const expiry = quiz.expiresAt.toDate ? quiz.expiresAt.toDate().getTime() : new Date(quiz.expiresAt).getTime();
            const diff = Math.floor((expiry - now) / 1000);

            if (diff <= 0) {
                setGlobalTimeLeft(0);
                clearInterval(timer);
                if (gameState === 'playing' || gameState === 'lobby') {
                    finishGame();
                }
            } else {
                setGlobalTimeLeft(diff);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [quiz?.expiresAt, gameState]);

    const startGame = () => {
        setGameState('playing');
        setCurrentQuestionIndex(0);
        setScore(0);
        setAnswersGiven([]);
        setStartTime(Date.now());
        setTimeLeft(quiz?.questions[0]?.timer || 30);
    };

    const handleAnswerSubmit = (index: number) => {
        if (isAnswerChecked) return;

        setSelectedAnswer(index);
        setIsAnswerChecked(true);

        const currentQuestion = quiz?.questions[currentQuestionIndex];
        const isCorrect = index === currentQuestion?.correctAnswerIndex;

        if (isCorrect) {
            setScore((prev) => prev + 1); // Simple scoring: 1 point per correct answer
        }

        setAnswersGiven((prev) => [...prev, index]);

        // Automatically move to next question after delay
        setTimeout(() => {
            if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
                nextQuestion();
            } else {
                finishGame();
            }
        }, 2000);
    };

    const nextQuestion = () => {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsAnswerChecked(false);
        setTimeLeft(quiz?.questions[currentQuestionIndex + 1]?.timer || 30);
    };

    const finishGame = async () => {
        setGameState('finished');
        if (score > 0) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#46178f', '#1368ce', '#ffa602', '#e21b3c']
            });
        }
        if (user && quiz && startTime) {
            try {
                const endTime = Date.now();
                const timeTakenSeconds = Math.floor((endTime - startTime) / 1000);

                const correctAnswers = answersGiven.reduce((acc, ans, idx) => {
                    return acc + (ans === quiz.questions[idx].correctAnswerIndex ? 1 : 0);
                }, 0);
                const wrongAnswers = quiz.questions.length - correctAnswers;
                const accuracy = quiz.questions.length > 0 ? (correctAnswers / quiz.questions.length) * 100 : 0;

                const resultData = {
                    quizId: pin,
                    studentId: user.uid,
                    studentName: user.displayName || 'Anonymous',
                    avatar: '',
                    score: score,
                    totalQuestions: quiz.questions.length,
                    correctAnswers: correctAnswers,
                    wrongAnswers: wrongAnswers,
                    answersGiven: answersGiven,
                    completedAt: serverTimestamp(),
                    percentageScore: accuracy,
                    accuracy: accuracy,
                    timeTaken: timeTakenSeconds,
                    instructorId: quiz.instructorId,
                    quizTitle: quiz.title,
                    weakTopics: [] // Placeholder
                };

                await addDoc(collection(db, 'quiz_results'), resultData);

                // Update participant count
                const quizRef = doc(db, 'quizzes', pin);
                await updateDoc(quizRef, {
                    participantCount: increment(1)
                });

                // Update student stats
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    totalScore: increment(score),
                    quizzesTaken: increment(1)
                });
            } catch (e) {
                console.error("Error saving result:", e);
            }
        }
    };

    if (gameState === 'loading') {
        return (
            <div className="min-h-screen bg-[#46178f] flex items-center justify-center text-white font-bold text-2xl">
                Loading Quiz...
            </div>
        );
    }

    if (gameState === 'lobby') {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-slate-800 p-8 rounded-3xl shadow-2xl text-center">
                    {globalTimeLeft !== null && (
                        <div className="mb-6 flex items-center justify-center gap-2 bg-purple-900/40 py-2 px-4 rounded-full border border-purple-500/30">
                            <Timer className="w-4 h-4 text-purple-400 animate-pulse" />
                            <span className="text-sm font-black text-purple-200 uppercase tracking-wider">
                                Quiz Ends In: {formatTime(globalTimeLeft)}
                            </span>
                        </div>
                    )}
                    <h1 className="text-4xl font-black mb-4">{quiz?.title}</h1>
                    <p className="text-slate-400 mb-8 text-lg">{quiz?.description}</p>
                    <div className="flex justify-center gap-4 mb-8">
                        <div className="bg-slate-700 px-6 py-3 rounded-xl">
                            <span className="block text-sm text-slate-400">Questions</span>
                            <span className="text-2xl font-bold">{quiz?.questions.length}</span>
                        </div>
                        <div className="bg-slate-700 px-6 py-3 rounded-xl">
                            <span className="block text-sm text-slate-400">Time</span>
                            <span className="text-2xl font-bold">~{(quiz?.questions.length || 0) * (quiz?.timePerQuestion || 0) / 60}m</span>
                        </div>
                    </div>
                    <button
                        onClick={startGame}
                        className="w-full py-4 bg-[#46178f] hover:bg-[#3c147a] rounded-xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/50"
                    >
                        Start Quiz
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/student')}
                        className="mt-4 text-slate-500 hover:text-white transition-colors"
                    >
                        Exit
                    </button>
                </div>
            </div>
        );
    }

    if (gameState === 'finished') {
        return (
            <div className="min-h-screen bg-[#46178f] text-white flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-white text-slate-900 p-8 rounded-3xl shadow-2xl text-center"
                >
                    <Trophy className="w-24 h-24 mx-auto text-yellow-400 mb-6" />
                    <h2 className="text-3xl font-black mb-2">Quiz Completed!</h2>
                    <p className="text-slate-500 mb-8">Great job on finishing the quiz.</p>

                    <div className="bg-slate-100 rounded-2xl p-6 mb-8">
                        <span className="block text-sm text-slate-500 uppercase font-bold tracking-wider mb-1">Total Score</span>
                        <span className="text-5xl font-black text-[#46178f]">{score}</span>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => setGameState('review')}
                            className="w-full py-4 bg-[#1368ce] text-white rounded-xl font-bold text-xl transition-all hover:scale-105 shadow-lg"
                        >
                            Review Answers
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/student')}
                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-xl transition-all hover:scale-105"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (gameState === 'review') {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col p-4 md:p-8">
                <div className="max-w-4xl mx-auto w-full">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-black text-slate-800">Review Quiz</h1>
                        <button
                            onClick={() => setGameState('finished')}
                            className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 transition-colors"
                        >
                            Close Review
                        </button>
                    </div>

                    <div className="space-y-6">
                        {quiz?.questions.map((question, qIndex) => {
                            const userAnswerIndex = answersGiven[qIndex];
                            return (
                                <div key={qIndex} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                    <div className="flex gap-4 mb-4">
                                        <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                                            {qIndex + 1}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800">{question.text}</h3>
                                    </div>

                                    {question.imageUrl && (
                                        <div className="mb-4 rounded-lg overflow-hidden max-h-48 w-full md:w-1/2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={question.imageUrl} alt="Question" className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {question.options.map((option, oIndex) => {
                                            const isCorrect = oIndex === question.correctAnswerIndex;
                                            const isSelected = oIndex === userAnswerIndex;

                                            let styleClass = "bg-slate-50 border-slate-100 text-slate-500";
                                            if (isCorrect) {
                                                styleClass = "bg-green-100 border-green-200 text-green-800 font-bold";
                                            } else if (isSelected && !isCorrect) {
                                                styleClass = "bg-red-100 border-red-200 text-red-800";
                                            }

                                            return (
                                                <div key={oIndex} className={`p-4 rounded-xl border flex justify-between items-center ${styleClass}`}>
                                                    <span>{option}</span>
                                                    {isCorrect && <Check size={20} className="text-green-600" />}
                                                    {isSelected && !isCorrect && <X size={20} className="text-red-600" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = quiz?.questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            {/* Global Expiry Timer Overlay */}
            {globalTimeLeft !== null && (
                <div className={`fixed bottom-24 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full border shadow-lg transition-all ${globalTimeLeft < 60 ? 'bg-red-500 border-red-600 animate-pulse' : 'bg-slate-800 border-slate-700'}`}>
                    <Timer size={18} className="text-white" />
                    <span className="text-lg font-black text-white">{formatTime(globalTimeLeft)}</span>
                </div>
            )}

            {/* Top Bar */}
            <div className="bg-white p-4 shadow-sm flex justify-between items-center px-8">
                <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-400">
                        {currentQuestionIndex + 1} / {quiz?.questions.length}
                    </span>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
                    <Timer size={20} className={timeLeft < 10 ? "text-red-500" : "text-slate-700"} />
                    <span className={`font-mono font-bold text-xl ${timeLeft < 10 ? "text-red-500" : "text-slate-700"}`}>
                        {timeLeft}
                    </span>
                </div>
                <div className="font-bold text-[#46178f]">
                    Score: {score}
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-5xl mx-auto w-full">
                {currentQuestion?.imageUrl && (
                    <div className="mb-8 rounded-xl overflow-hidden shadow-lg max-h-64">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={currentQuestion.imageUrl} alt="Question" className="w-full h-full object-cover" />
                    </div>
                )}

                <h2 className="text-3xl md:text-4xl font-black text-center text-slate-800 mb-12">
                    {currentQuestion?.text}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <AnimatePresence>
                        {currentQuestion?.options.map((option, index) => {
                            let updatedColorClass = "bg-white hover:bg-slate-50 border-slate-200 text-slate-700";
                            const isSelected = selectedAnswer === index;
                            const isCorrect = index === currentQuestion.correctAnswerIndex;

                            // Colors
                            const colors = [
                                "border-l-[#e21b3c]", // red
                                "border-l-[#1368ce]", // blue
                                "border-l-[#d89e00]", // yellow
                                "border-l-[#26890c]"  // green
                            ];
                            const baseBorder = `border-l-8 ${colors[index % 4]}`;

                            if (isAnswerChecked) {
                                if (isCorrect) {
                                    updatedColorClass = "bg-green-500 text-white border-green-600";
                                } else if (isSelected && !isCorrect) {
                                    updatedColorClass = "bg-red-500 text-white border-red-600";
                                } else {
                                    updatedColorClass = "bg-white opacity-50";
                                }
                            }

                            return (
                                <motion.button
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => handleAnswerSubmit(index)}
                                    disabled={isAnswerChecked}
                                    className={`
                                    relative p-8 rounded-xl text-left shadow-lg
                                    text-xl font-bold transition-all transform
                                    ${baseBorder}
                                    ${updatedColorClass}
                                    ${!isAnswerChecked && "hover:scale-[1.02] active:scale-[0.98] cursor-pointer"}
                                `}
                                >
                                    <div className="flex justify-between items-center">
                                        <span>{option}</span>
                                        {isAnswerChecked && isCorrect && <Check size={24} />}
                                        {isAnswerChecked && isSelected && !isCorrect && <X size={24} />}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
