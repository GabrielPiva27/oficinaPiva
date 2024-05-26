const firebaseConfig = {
  apiKey: "AIzaSyBrKxyfurUIpHsgVYtcch4Nkl-e_U4a4rg",
  authDomain: "oficinapiva-e141d.firebaseapp.com",
  databaseURL: "https://oficinapiva-e141d-default-rtdb.firebaseio.com",
  projectId: "oficinapiva-e141d",
  storageBucket: "oficinapiva-e141d.appspot.com",
  messagingSenderId: "531609502100",
  appId: "1:531609502100:web:0bead39f14c8657f48cf81",
  measurementId: "G-4X4R3FYES6"
};

// Inicializando o Firebase
firebase.initializeApp(firebaseConfig);
// Crie uma referência para o Realtime Database do Firebase
const database = firebase.database();
// Crie uma referência para o armazenamento do Firebase
const storageRef = firebase.storage().ref();
