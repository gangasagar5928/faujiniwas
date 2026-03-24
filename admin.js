import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCKMzqMBkRBOc9XJ1fDrH3LZ4HfltWVDmA",
  authDomain: "rentmap-live.firebaseapp.com",
  projectId: "rentmap-live",
  storageBucket: "rentmap-live.firebasestorage.app",
  messagingSenderId: "1018484183886",
  appId: "1:1018484183886:web:b8e8236196e434187d041f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Secure Auth Service

// UI Elements
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const pendingList = document.getElementById('pending-list');
const loginError = document.getElementById('login-error');

// --- 1. Monitor Login State ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Logged in! Hide login, show dashboard, fetch data
        loginScreen.style.display = 'none';
        dashboardScreen.style.display = 'block';
        loadPendingListings();
    } else {
        // Logged out! Show login, hide dashboard
        loginScreen.style.display = 'block';
        dashboardScreen.style.display = 'none';
    }
});

// --- 2. Login Logic ---
window.loginAdmin = async () => {
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-pass').value;

    const btn = document.querySelector('#login-screen button');
    btn.textContent = "Verifying...";

    try {
        await signInWithEmailAndPassword(auth, email, pass);
        loginError.style.display = 'none';
    } catch (error) {
        console.error("Login failed:", error);
        loginError.style.display = 'block';
    }
    btn.textContent = "Login to Dashboard";
};

// --- 3. Logout Logic ---
window.logoutAdmin = () => {
    signOut(auth);
};

// --- 4. Fetch Pending Listings (With Photos!) ---
function loadPendingListings() {
    const pendingQuery = query(collection(db, "rentals"), where("verified", "==", false));

    onSnapshot(pendingQuery, (snapshot) => {
        pendingList.innerHTML = '';

        if (snapshot.empty) {
            pendingList.innerHTML = '<p style="color: var(--muted);">No pending listings to review. You are all caught up!</p>';
            return;
        }

        snapshot.forEach((docSnap) => {
            const r = docSnap.data();
            const id = docSnap.id;

            // --- GENERATE MEDIA GALLERY ---
            let mediaHtml = '';
            if (r.mediaUrls && r.mediaUrls.length > 0) {
                // Creates a horizontally scrolling box for multiple images
                mediaHtml += `<div style="display: flex; gap: 8px; overflow-x: auto; margin: 10px 0; padding-bottom: 5px;">`;

                r.mediaUrls.forEach(url => {
                    // Check if it's a video or image
                    if (url.endsWith('.mp4') || url.endsWith('.mov')) {
                        mediaHtml += `<video src="${url}" style="height: 120px; border-radius: 6px; border: 1px solid var(--border);" controls></video>`;
                    } else {
                        mediaHtml += `<a href="${url}" target="_blank"><img src="${url}" style="height: 120px; border-radius: 6px; border: 1px solid var(--border); object-fit: cover;"></a>`;
                    }
                });

                mediaHtml += `</div>`;
            } else {
                mediaHtml = `<p style="color: var(--muted); font-size: 12px; margin: 10px 0; font-style: italic;">No media uploaded.</p>`;
            }
            // ------------------------------

            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${r.name} <span class="badge-pending">Pending</span></h3>
                <p style="color: var(--muted); font-size: 13px; margin: 5px 0;">📍 ${r.area}, ${r.city}</p>
                <p><b>Rent:</b> ₹${r.price}/mo</p>
                <p><b>Type:</b> ${r.type.toUpperCase()}</p>

                ${mediaHtml}

                <div class="card-actions">
                    <button class="btn-approve" onclick="approveListing('${id}')">✓ Approve</button>
                    <button class="btn-delete" onclick="deleteListing('${id}')">✗ Delete</button>
                </div>
            `;
            pendingList.appendChild(card);
        });
    });
}

// Function to Approve
window.approveListing = async (id) => {
    if(confirm("Approve this listing and show it on the public map?")) {
        await updateDoc(doc(db, "rentals", id), { verified: true });
    }
};

// Function to Delete
window.deleteListing = async (id) => {
    if(confirm("Are you sure you want to permanently delete this listing?")) {
        await deleteDoc(doc(db, "rentals", id));
    }
};
