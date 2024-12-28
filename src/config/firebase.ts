import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

console.log('Initializing Firebase...');

const firebaseConfig = {
  apiKey: "AIzaSyA_w9809nIKEZ4_EOlIIAmt32QA0Zb6UfU",
  authDomain: "circle-8881e.firebaseapp.com",
  projectId: "circle-8881e",
  storageBucket: "circle-8881e.firebasestorage.app",
  messagingSenderId: "579952481619",
  appId: "1:579952481619:web:16d9435785c8217ba43da6"
};

console.log('Firebase config loaded:', {
  projectId: firebaseConfig.projectId,
  hasApiKey: !!firebaseConfig.apiKey,
  hasAppId: !!firebaseConfig.appId
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

console.log('Firebase initialized, Firestore instance created');