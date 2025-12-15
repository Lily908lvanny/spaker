// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBKNyN90FD6ALfrQDjS8of0Qw2KdvvRWxE",
  authDomain: "spaker-6d91f.firebaseapp.com",
  databaseURL: "https://spaker-6d91f-default-rtdb.firebaseio.com",
  projectId: "spaker-6d91f",
  storageBucket: "spaker-6d91f.firebasestorage.app",
  messagingSenderId: "337833124578",
  appId: "1:337833124578:web:e4a633218e8bfeb8cb34bb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Éléments du DOM
const form = document.getElementById("loginForm");
const loader = document.getElementById("loaderPage");
const avatarInput = document.getElementById("avatarInput");

// --- Fonction pour compresser l'image ---
function compressImage(file, maxWidth = 150, maxHeight = 150, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;

        // Redimension proportionnel
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir en Base64 compressé
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = event.target.result;
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

// --- Gestion du formulaire ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  loader.classList.add("active");

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const pseudo = document.getElementById("pseudo").value.trim();
  const file = avatarInput.files[0];

  // ✅ Vérification obligatoire de la photo
  if(!file){
    loader.classList.remove("active");
    alert("Veuillez sélectionner une photo pour votre profil !");
    return;
  }

  try {
    let userCredential;

    // Essayer de se connecter
    try {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch {
      // Sinon créer un compte
      userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Compresser et convertir la photo en Base64
      const photoBase64 = await compressImage(file, 150, 150, 0.7);

      // Mettre à jour le pseudo dans Firebase Auth (sans photoURL)
      await updateProfile(userCredential.user, { displayName: pseudo });

      // Sauvegarder pseudo + email + avatar compressé dans Realtime Database
      await set(ref(db, "users/" + userCredential.user.uid), {
        name: pseudo,
        email: email,
        photoBase64: photoBase64
      });
    }

    // Redirection vers le chat
    setTimeout(() => { window.location.href = "home.html"; }, 1000);

  } catch(err) {
    loader.classList.remove("active");
    alert("Erreur : " + err.message);
  }
});
