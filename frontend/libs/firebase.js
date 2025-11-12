// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut // 👈 thêm dòng này để có thể logout Firebase
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyA6fmke7peD9Tey4-5wWUG4YdVw2vifzuQ",
  authDomain: "du-an-cuoi-khoa-jsi.firebaseapp.com",
  projectId: "du-an-cuoi-khoa-jsi",
  storageBucket: "du-an-cuoi-khoa-jsi.appspot.com",
  messagingSenderId: "892099880104",
  appId: "1:892099880104:web:c1a62e96609cc5c32e0e9d",
  measurementId: "G-V9Q4BQPFS3"
};

// 🔥 Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app);

// 🚀 Xuất ra để file khác import
export { app, auth, provider, signInWithPopup, signOut, storage };
