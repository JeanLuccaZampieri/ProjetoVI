import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
//databaseURL: "https:/eventive-fc836-default-rtdb.firebaseio.com",
// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyBR_3Jn7JSVHNXmHL6_W2qNHOLbSJobgRk",
    authDomain: "eventive-fc836.firebaseapp.com",
    projectId: "eventive-fc836",
    storageBucket: "eventive-fc836.appspot.com",
    messagingSenderId: "161187193533",
    appId: "1:161187193533:web:ec2b52a16a623ee91e0dd4"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  } else {
    firebase.app(); // se já estiver inicializado, use a instância existente
  }
  
  const firestore = firebase.firestore();
  
  export { firebase, firestore };