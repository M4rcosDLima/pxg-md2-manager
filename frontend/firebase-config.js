// firebase-config.js (para uso com firebase-app-compat.js)

const firebaseConfig = {
  apiKey: "AIzaSyCjH5qgDmRsl9AeGsKgcIpm9n4wDoLquow",
  authDomain: "health-haven-12482.firebaseapp.com",
  projectId: "health-haven-12482",
  storageBucket: "health-haven-12482.appspot.com", // corrigido .app → .app**spot**.com
  messagingSenderId: "1041167101278",
  appId: "1:1041167101278:web:1899c98e533cdd6faf73cf",
  measurementId: "G-RKXBLYBBQT"
};

// Inicializar o Firebase
firebase.initializeApp(firebaseConfig);
