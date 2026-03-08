import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: 'AIzaSyA_BA2kxqa0PmsYoeFWRbh7D-SFc_KFZrs',
    appId: '1:591676704670:web:7f52c8150d436c6a3e388f',
    messagingSenderId: '591676704670',
    projectId: 'testhub2-project',
    authDomain: 'testhub2-project.firebaseapp.com',
    storageBucket: 'testhub2-project.firebasestorage.app',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Initialize Firestore with explicit settings
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});

export { app, auth, db };
