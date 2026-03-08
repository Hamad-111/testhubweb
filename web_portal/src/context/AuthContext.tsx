"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

interface AppUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    role: "student" | "instructor" | "admin";
    subscriptionStatus?: "active" | "inactive" | "pending";
    planId?: string;
}

interface AuthContextType {
    user: AppUser | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    console.log("Checking Firestore for user:", firebaseUser.uid);
                    const userDocRef = doc(db, "users", firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        console.log("User document found:", userData);
                        const isAdmin = firebaseUser.email === "hadekhan681@gmail.com" || firebaseUser.email === "shakirullah1515@gmail.com";
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: userData.name || firebaseUser.displayName,
                            role: (isAdmin ? "admin" : (userData.role || "instructor")) as any,
                            subscriptionStatus: userData.subscriptionStatus || "inactive",
                            planId: userData.planId
                        });
                    } else {
                        console.log("No user document found. Attempting to create one...");
                        try {
                            const isAdmin = firebaseUser.email === "hadekhan681@gmail.com" || firebaseUser.email === "shakirullah1515@gmail.com";
                            const newUserData = {
                                name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
                                email: firebaseUser.email,
                                role: isAdmin ? "admin" : "instructor",
                                status: isAdmin ? "active" : "pending",
                                subscriptionStatus: "inactive",
                                createdAt: serverTimestamp(),
                                id: firebaseUser.uid
                            };
                            await setDoc(userDocRef, newUserData);
                            console.log("User document created successfully!");
                            alert(`${isAdmin ? "Admin" : "Instructor"} profile created successfully! You should now have permissions.`);
                            setUser({
                                uid: firebaseUser.uid,
                                email: firebaseUser.email,
                                displayName: newUserData.name,
                                role: isAdmin ? "admin" : "instructor",
                            });
                        } catch (e: any) {
                            console.error("Failed to create user document:", e);
                            alert(`Warning: Could not create your instructor profile in the database: ${e.message}. This will likely cause permission errors.`);
                            setUser({
                                uid: firebaseUser.uid,
                                email: firebaseUser.email,
                                displayName: firebaseUser.displayName,
                                role: "instructor",
                            });
                        }
                    }
                } catch (error: any) {
                    console.error("Error fetching user data:", error);
                    alert(`Error accessing user data: ${error.message}`);
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        role: "instructor",
                    });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
