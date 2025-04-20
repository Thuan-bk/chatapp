// Import the functions you need from the SDKs you need
import {getDatabase,ref,push,set, onValue,update,remove, onChildAdded, onChildChanged, onChildRemoved, get, child} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword,signInWithEmailAndPassword, signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";
import * as Popper from 'https://cdn.jsdelivr.net/npm/@popperjs/core@^2/dist/esm/index.js'
// import { FileUploadWithPreview } from 'file-upload-with-preview';
// import 'file-upload-with-preview/dist/style.css';

const firebaseConfig = {
  apiKey: "your api",
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
const dbRef = ref(getDatabase());
const chatsRef = ref(db , 'chats');
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
  // điều chỉnh số lượng file ảnh có thể đăng lên
  const upload = new FileUploadWithPreview.FileUploadWithPreview('upload-images', {
    maxFilecount : 6,
    multiple: true
  });
  formChat.addEventListener("submit",async (event)=> {
    event.preventDefault();

    const content = formChat.content.value;
    const userId = auth.currentUser.uid;
    const images = upload.cachedFileArray || [];
    
    
    if( (content || images.length >0) && userId) {
      const imageLinks = [];
      if (images.length > 0) {
        const url = 'https://api.cloudinary.com/v1_1/dmggonant/image/upload';
        const formData = new FormData();
        for (let i = 0; i < images.length; i++) {
          let file = images[i];
          formData.append('file', file);
          formData.append('upload_preset', 'chat-app');
      // dùng hàm await để chờ cho hàm fetch lấy dc dữ liệu thì mới chạy tiếp ,  và muốn dùng dc hàm await thì hàm cha phải có từ khóa  async
          await fetch(url, {
            method: 'POST',
            body: formData,
          })
            .then((response) => {
              return response.json();
            })
            .then((data) => {
              imageLinks.push(data.url)
              
            });
        }
      }
      set(push(ref(db, "chats")), {
        content: content,
        userId: userId,
        images: imageLinks
      })
      formChat.content.value = "";
      upload.resetPreviewPanel();
    }
    
  })
}
//Het form chat

// hien thi tin nhăn ra giao diện

const chatBody = document.querySelector("[chat] .inner-body")
if (chatBody) {
  
  onChildAdded(chatsRef, (data) => {
    const key = data.key;
    const content = data.val().content;
    const userId = data.val().userId;
    const images = data.val().images;

    get(child(dbRef, `users/${userId}`)).then((snapshot) => {
      if (snapshot.exists()) {
        const fullName = snapshot.val().fullName;
        const newChat = document.createElement("div");
        newChat.setAttribute("chat-id",key);
    let htmlFullName = "";
    let htmlButtonDelete = "";
        
    if (userId == currentUser.uid) {
      newChat.classList.add("inner-outgoing");
      htmlButtonDelete = `
        <button class = "button-delete" button-delete = "${key}">
          <i class="fa-solid fa-trash"></i>
        </button>
      `
    } else {
      newChat.classList.add("inner-incoming");
      htmlFullName = `
        <div class="inner-name">
        ${fullName}
        </div>
      `;
    }

    let htmlContent = "";
    if (content) {
      htmlContent = `
        <div class="inner-content">
        ${content}
      </div>
      `
    }

    let htmlImage = "";
    if (images && images.length > 0) {
      htmlImage +=  `<div class="inner-images">`
      for (const image of images) {
        htmlImage +=  `<img src="${image}" />`
      }
      
      htmlImage +=  `</div>`
      
    }

    newChat.innerHTML = `
      ${htmlFullName}
      ${htmlContent}
      ${htmlImage}
      ${htmlButtonDelete}
    `;

    chatBody.appendChild(newChat);
    chatBody.scrollTop = chatBody.scrollHeight;

    // Xóa tin nhắn
    const buttonDelete = newChat.querySelector(".button-delete");
    if (buttonDelete) {
      buttonDelete.addEventListener("click" , () => {
        remove(ref(db, '/chats/'+key));
      })
    }
    // zoom ảnh 
    new Viewer(newChat);
    

      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });

    
    // addCommentElement(postElement, data.key, data.val().text, data.val().author);
  })
}
//het hien thi tin nhăn ra giao diện

// tính năng xóa tin nhắn
onChildRemoved(chatsRef, (data) => {
  const key = data.key;
  const chatItem = chatBody.querySelector(`[chat-id = "${key}"]`)
  if(chatItem) {
    chatItem.remove();
  }
});

// hết tính năng xóa tin nhắn


//chèn icon
const emojiPicker = document.querySelector('emoji-picker');

if(emojiPicker) {
  const button = document.querySelector('.button-icon')
  const buttonIcon = document.querySelector('.button-icon i')
  const tooltip = document.querySelector('.tooltip')
  Popper.createPopper(button, tooltip)

  document.querySelector('.button-icon').onclick = () => {
    tooltip.classList.toggle('shown')
  }
  const inputChat = document.querySelector(".chat .inner-form input[name = 'content']");
  emojiPicker.addEventListener('emoji-click', event =>{ 
    const icon = event.detail.unicode;
    inputChat.value += icon;
  });

  document.addEventListener("click", (event) => {
    // console.log(event.target);
    if (!emojiPicker.contains(event.target) && event.target != button && event.target != buttonIcon){
      tooltip.classList.remove('shown');
    } 
  })
}

// hết chèn icon




  
