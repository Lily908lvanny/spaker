import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const db = getDatabase(app);
const auth = getAuth(app);

const input = document.getElementById("input");
const messages = document.getElementById("messages");
const sendBtn = document.getElementById("sendBtn");
const userNameHeader = document.getElementById("userNameHeader");
const userAvatarHeader = document.getElementById("userAvatarHeader");

const messagesRef = ref(db, "messages");

auth.onAuthStateChanged(async user => {
  if(user){
    const userSnap = await get(ref(db, "users/" + user.uid));
    const userData = userSnap.val();
    userNameHeader.textContent = userData.name;
    userAvatarHeader.innerHTML = `<img src="${userData.photoBase64}" class="avatar">`;
  }
});

function sendMessage(){
  const text = input.value.trim();
  if(!text) return;

  push(messagesRef, {
    userId: auth.currentUser.uid,
    text: text,
    timestamp: Date.now()
  });

  input.value = "";
}

onChildAdded(messagesRef, async snapshot => {
  const data = snapshot.val();
  const userSnap = await get(ref(db, "users/" + data.userId));
  const userData = userSnap.val();

  const msgDiv = document.createElement("div");
  msgDiv.className = data.userId === auth.currentUser.uid ? "sent" : "received";

  msgDiv.innerHTML = `
    <img src="${userData.photoBase64}" class="avatar">
    <span class="username">${userData.name}</span>
    <span class="text">${data.text}</span>
    <span class="time">${new Date(data.timestamp).toLocaleTimeString()}</span>
  `;

  messages.appendChild(msgDiv);
  messages.scrollTop = messages.scrollHeight;
});

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", e => { if(e.key==="Enter") sendMessage(); });
