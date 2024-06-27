// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { get, ref, set, query, orderByChild, limitToLast, getDatabase } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: "AIzaSyCG_UzY99B1FRlEYvoDbX44_o0C_bwTjpU",
    authDomain: "aboutmeobeo.firebaseapp.com",
    projectId: "aboutmeobeo",
    storageBucket: "aboutmeobeo.appspot.com",
    messagingSenderId: "229820157119",
    appId: "1:229820157119:web:3106d04b170e8d49c30a0a",
    measurementId: "G-FZ0346VHHD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = 'en'
const provider = new GoogleAuthProvider();
const loginWithGoogle = document.getElementById("login");
const userInfo = document.getElementById("user-info");


loginWithGoogle.addEventListener("click", function () {
    signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const user = result.user;
            const menu = document.getElementById("menu");
            const isMenuOpen = menu.classList.contains("open-menu");

            updateUserProfile(user);
        }).catch((error) => {
            const errorCode = error.code;
            console.log(errorCode);
            const errorMessage = error.message;
            console.log(errorMessage);
        });
})

let isUserLoggedIn = false;

function checkAuthAndRedirect() {
    const auth = getAuth();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            loginWithGoogle.style.display = "none";
            isUserLoggedIn = true;
            userInfo.style.display = "block";
            updateUserProfile(user);
        } else {
            loginWithGoogle.style.display = "block";
            userInfo.style.display = "none";
            isUserLoggedIn = false;
        }
    });
}


document.addEventListener("DOMContentLoaded", checkAuthAndRedirect);

const authenticatedUIDs = [
    "eHLF0W8ynQbK9h66TeOpP0YoZaZ2"
];

function updateUserProfile(user) {
    const userName = user.displayName;
    const userEmail = user.email;
    const userProfilePicture = user.photoURL;
    const uid = user.uid;

    let verifyImageSrc = "";

    if (authenticatedUIDs.includes(uid)) {
        verifyImageSrc = "Icon/verify.svg";
    }

    let userNameHTML = `<span>Hello, ${userName}</span>`;
    if (verifyImageSrc) {
        userNameHTML += `<img class="verified" src="${verifyImageSrc}" alt="Verified" />`;
    }

    document.getElementById("userName").innerHTML = userNameHTML;
    document.getElementById("userEmail").textContent = userEmail;
    document.getElementById("userProfilePicture").src = userProfilePicture;
}

function logout() {
    signOut(auth)
        .then(() => {
            clearUserProfile();
            userInfo.style.display = "none";
            if (window.innerWidth <= 1024) {
                toggleMenu();
            }
        })
        .catch((error) => {
            console.error("Error signing out:", error);
        });
}

document.getElementById("signout").addEventListener("click", logout);

function clearUserProfile() {
    document.getElementById("userName").textContent = "";
    document.getElementById("userEmail").textContent = "";
    document.getElementById("userProfilePicture").src = "Icon/grey-img.jpg";
}

function submitComment() {
    const user = auth.currentUser;
    if (user) {
        var commentInput = document.getElementById('comment-input').value;

        if (!commentInput) {
            alert("Comment must not be empty.");
            return;
        }

        if (commentInput.length > 600) {
            alert("Comment must not exceed 600 characters.");
            return;
        }

        var comment = {
            content: commentInput,
            timestamp: new Date().getTime(),
            username: user.displayName,
            avatarUrl: user.photoURL
        };

        var userCommentRef = ref(getDatabase(app), 'comments/' + user.uid);
        set(userCommentRef, comment).then(() => {
            console.log("Comment saved successfully.");
            document.getElementById('comment-input').value = '';
            loadComments();
        }).catch((error) => {
            console.error("Error saving comment: ", error);
        });
    } else {
        alert("Please log in to comment.");
    }
}


document.getElementById("send-comment").addEventListener("click", submitComment);

function loadComments() {
    const db = getDatabase(app);
    const commentsRef = ref(db, 'comments');
    const commentsQuery = query(commentsRef, orderByChild('timestamp'), limitToLast(20));

    get(commentsQuery).then((snapshot) => {
        if (snapshot.exists()) {
            const commentsData = snapshot.val();
            const commentsList = Object.values(commentsData).sort((a, b) => b.timestamp - a.timestamp);
            const listCommentDiv = document.getElementById('list-comment');
            listCommentDiv.innerHTML = '';

            commentsList.forEach(comment => {
                const commentDiv = document.createElement('div');
                commentDiv.className = 'comment';

                const avatarImg = document.createElement('img');
                avatarImg.className = 'comment-avatar';
                avatarImg.alt = 'comment avatar';
                avatarImg.src = comment.avatarUrl || 'default-avatar-url.jpg';

                const nameSpan = document.createElement('span');
                nameSpan.className = 'comment-name';
                nameSpan.textContent = comment.username;

                const timeSpan = document.createElement('span');
                timeSpan.className = 'comment-time';
                const date = new Date(comment.timestamp);
                timeSpan.textContent = date.toLocaleString();
                const contentSpan = document.createElement('span');
                contentSpan.className = 'comment-content ellipsis';
                contentSpan.textContent = comment.content;

                commentDiv.appendChild(avatarImg);
                commentDiv.appendChild(nameSpan);
                commentDiv.appendChild(timeSpan);
                commentDiv.appendChild(contentSpan);

                listCommentDiv.appendChild(commentDiv);
            });
        } else {
            console.log("No comments available");
        }
    }).catch((error) => {
        console.error("Error loading comments: ", error);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    loadComments();
});