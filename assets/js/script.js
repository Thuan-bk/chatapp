// Import the functions you need from the SDKs you need
import {getDatabase,ref,push,set, onValue,update,remove, onChildAdded, onChildChanged, onChildRemoved} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword,signInWithEmailAndPassword, signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyAkXa5mPS6_Vlec5i2Wkk-RAvtl4fSELck",
  authDomain: "chat-app-3e25d.firebaseapp.com",
  databaseURL: "https://chat-app-3e25d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chat-app-3e25d",
  storageBucket: "chat-app-3e25d.firebasestorage.app",
  messagingSenderId: "1001426019582",
  appId: "1:1001426019582:web:97bee20982f504bba3b1af",
  measurementId: "G-0GQN145SDL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);
let currentUser = null;

// kiểm tra trạng thái đăng nhập
const buttonLogin = document.querySelector("[button-login]");
const buttonRegister = document.querySelector("[button-register]");
const buttonLogout = document.querySelector("[button-logout]");
const chat = document.querySelector("[chat]");
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    buttonLogout.style.display = "inline-block";
    chat.style.display = "block";
  } else {
    buttonLogin.style.display = "inline-block";
    buttonRegister.style.display = "inline-block";
    
    if (chat) {
        chat.innerHTML = `<i>Vui lòng đăng nhập để sử dụng ứng dụng</i>`;
    }
      
  }
});
 
    
// hết kiểm tra trạng thái đăng nhập 



// Trang đăng kí
const formRegister = document.querySelector("#form-register");
if(formRegister) {
    formRegister.addEventListener("submit", (event)=> {
        event.preventDefault();
        const fullName = formRegister.fullName.value;
        const email = formRegister.email.value;
        const password = formRegister.password.value;

        if (fullName && email && password) {
            createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
              // Signed up 
              const user = userCredential.user;
              if (user) {
                set(ref(db, `users/${user.uid}` ), {
                    fullName: fullName
                }).then(() => {
                    window.location.href = "index.html";
                })
              }
            })
            .catch((error) => {
              console.log(error);
              // ..
            });
        }
    })
}

// Hết Trang đăng kí


// Trang đăng nhập

const formLogin = document.querySelector("#form-login");
if (formLogin) {
  formLogin.addEventListener("submit", (event)=> {
    event.preventDefault();
        const email = formLogin.email.value;
        const password = formLogin.password.value;

        

        if (email && password) {
          signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
              // Signed in 
              const user = userCredential.user;
              if (user) {
                window.location.href = "index.html";
              }
              // ...
            })
            .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
            });
            
        }
  })
}

//Hết Trang đăng nhập


//Tính năng đăng xuất

if (buttonLogout) {
  buttonLogout.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    }).catch((error) => {
      // An error happened.
      console.log(error);
    });
    
  });
}

//Hết Tính năng đăng xuất


//form chat
const formChat = document.querySelector("[chat] .inner-form");
if (formChat) {
  formChat.addEventListener("submit", (event)=> {
    event.preventDefault();

    const content = formChat.content.value;
    const userId = auth.currentUser.uid;
    if (content && userId) {
      set(push(ref(db, "chats")), {
        content: content,
        userId: userId
      })
    }
    formChat.content.value = "";
  })
}
//Het form chat

// hien thi tin nhăn ra giao diện

const chatBody = document.querySelector("[chat] .inner-body")
if (chatBody) {
  const chatsRef = ref(db , 'chats');
  onChildAdded(chatsRef, (data) => {
    const key = data.key;
    const content = data.val().content;
    const userId = data.val().userId;
    const newChat = document.createElement("div");

    let htmlFullName = "";

    if (userId == currentUser.uid) {
      newChat.classList.add("inner-outgoing");
    } else {
      newChat.classList.add("inner-incoming");
      htmlFullName = `
        <div class="inner-name">
        ${userId}
        </div>
      `;
    }


    newChat.innerHTML = `
      ${htmlFullName}
      <div class="inner-content">
        ${content}
      </div>
    `;

    chatBody.appendChild(newChat);
    // addCommentElement(postElement, data.key, data.val().text, data.val().author);
  })
}
//het hien thi tin nhăn ra giao diện