import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBR_3Jn7JSVHNXmHL6_W2qNHOLbSJobgRk",
  authDomain: "eventive-fc836.firebaseapp.com",
  projectId: "eventive-fc836",
  storageBucket: "eventive-fc836.appspot.com",
  messagingSenderId: "161187193533",
  appId: "1:161187193533:web:ec2b52a16a623ee91e0dd4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const firestore = getFirestore(app);

export { auth, firestore }; 