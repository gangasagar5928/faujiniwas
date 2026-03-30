import { db, auth, collection, doc, addDoc, updateDoc, onSnapshot, query, where, orderBy, getDocs } from './firebase.js';

window.switchTab = (tab) => {
    document.querySelectorAll('.desktop-nav button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('#mobileNav button').forEach(b => b.classList.remove('active'));

    const dBtns = document.querySelectorAll('.desktop-nav button');
    const mBtns = document.querySelectorAll('#mobileNav button');
    
    // Default hiding layers
    const chatLayer = document.getElementById('chat-app-layer');
    if (chatLayer) chatLayer.style.display = 'none';

    if (tab === 'housing') {
        if(dBtns[0]) dBtns[0].classList.add('active');
        if(mBtns[0]) mBtns[0].classList.add('active');
    } else if (tab === 'market') {
        if(dBtns[1]) dBtns[1].classList.add('active');
        if(mBtns[1]) mBtns[1].classList.add('active');
        window.showToast?.('🏷️ Marketplace is coming in the next update!', 'ok');
    } else if (tab === 'chat') {
        if (!auth.currentUser) {
            window.showToast?.('Please Login to Message', 'err');
            window.openPostModal && window.openPostModal(); // Trigger auth (post room modal hosts auth currently)
            return;
        }
        if(dBtns[2]) dBtns[2].classList.add('active');
        if(mBtns[2]) mBtns[2].classList.add('active');
        if (chatLayer) chatLayer.style.display = 'flex';
        window.loadChats();
    }
};

let inboxUnsubscribe = null;
let activeChatUnsubscribe = null;
let currentChatId = null;

// Replace WhatsApp contact with this on the Listing details
window.startChatWithOwner = async (r) => {
    if (!auth.currentUser) {
        window.showToast?.("Login to chat securely.", "err");
        if (window.openPostModal) window.openPostModal();
        return;
    }
    if (auth.currentUser.uid === r.uid) return window.showToast?.("You cannot message your own listing.", "err");

    if (window.closeDetailModal) window.closeDetailModal();
    window.switchTab('chat');
    
    try {
        const q = query(collection(db, 'chats'), where('participants', 'array-contains', auth.currentUser.uid));
        const snap = await getDocs(q);
        let existingChatId = null;
        snap.forEach(d => {
            const data = d.data();
            // find thread where both me and owner are participants
            if (data.participants.includes(r.uid)) existingChatId = d.id;
        });

        if (existingChatId) {
            window.openChatThread(existingChatId, r.name);
        } else {
            const newChat = await addDoc(collection(db, 'chats'), {
                participants: [auth.currentUser.uid, r.uid], // Me and Owner
                lastMessage: 'Tap to send a message...',
                lastUpdated: Date.now(),
                listingName: r.name,
                ownerId: r.uid
            });
            window.openChatThread(newChat.id, r.name);
        }
    } catch (e) {
        window.showToast?.("Error generating chat: " + e.message, "err");
    }
};

window.loadChats = () => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', auth.currentUser.uid));
    
    if (inboxUnsubscribe) inboxUnsubscribe();
    
    inboxUnsubscribe = onSnapshot(q, (snapshot) => {
        const inbox = document.getElementById('chat-inbox');
        if (snapshot.empty) {
            inbox.innerHTML = `<div style="text-align:center;color:var(--muted);margin-top:40px;">No messages yet. Hit '💬 Message Owner' on a listing to start a chat!</div>`;
            return;
        }
        
        let chatsHTML = '';
        const chats = [];
        snapshot.forEach(d => chats.push({ id: d.id, ...d.data() }));
        chats.sort((a,b) => b.lastUpdated - a.lastUpdated);

        chats.forEach(c => {
            const isMe = c.lastSenderId === auth.currentUser.uid;
            chatsHTML += `
            <div onclick="window.openChatThread('${c.id}', '${c.listingName || 'Chat'}')" style="padding:15px; border:1px solid var(--border); background:var(--card); border-radius:12px; margin-bottom:10px; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.background='var(--card2)'" onmouseout="this.style.background='var(--card)'">
                <div style="font-weight:700; margin-bottom:4px; font-size:16px;">${c.listingName || 'Owner User'}</div>
                <div style="font-size:13px; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    ${isMe ? 'You: ' : ''}${c.lastMessage}
                </div>
            </div>`;
        });
        inbox.innerHTML = chatsHTML;
    });
};

window.openChatThread = (chatId, title) => {
    currentChatId = chatId;
    document.getElementById('chat-inbox').style.display = 'none';
    const thread = document.getElementById('chat-thread');
    thread.style.display = 'flex';
    document.getElementById('chat-thread-title').textContent = title;
    
    const messagesDiv = document.getElementById('chat-messages');
    messagesDiv.innerHTML = '<div class="live-dot" style="align-self:center; margin-top:20px;"></div>';
    
    if (activeChatUnsubscribe) activeChatUnsubscribe();
    
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
    activeChatUnsubscribe = onSnapshot(q, (snapshot) => {
        messagesDiv.innerHTML = '';
        if (snapshot.empty) {
            const emptyLabel = document.createElement('div');
            emptyLabel.style.color = "var(--muted)";
            emptyLabel.style.textAlign = "center";
            emptyLabel.style.fontSize = "13px";
            emptyLabel.textContent = "Beginning of secure chat history...";
            messagesDiv.appendChild(emptyLabel);
        }

        snapshot.forEach(d => {
            const data = d.data();
            const isMe = data.senderId === auth.currentUser.uid;
            
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.width = '100%';
            row.style.justifyContent = isMe ? 'flex-end' : 'flex-start';

            const bubble = document.createElement('div');
            bubble.style.padding = '10px 14px';
            bubble.style.borderRadius = '14px';
            bubble.style.maxWidth = '85%';
            bubble.style.wordBreak = 'break-word';
            bubble.style.fontSize = '14px';
            bubble.style.fontFamily = "'Outfit', sans-serif";

            if (isMe) {
                bubble.style.background = 'var(--accent)';
                bubble.style.color = '#000';
                bubble.style.borderBottomRightRadius = '4px';
            } else {
                bubble.style.background = 'var(--card2)';
                bubble.style.border = '1px solid var(--border)';
                bubble.style.color = '#fff';
                bubble.style.borderBottomLeftRadius = '4px';
            }
            bubble.textContent = data.text;
            
            row.appendChild(bubble);
            messagesDiv.appendChild(row);
        });
        // Auto scroll to bottom smoothly
        setTimeout(() => { messagesDiv.scrollTop = messagesDiv.scrollHeight; }, 50);
    });
};

window.closeChatThread = () => {
    currentChatId = null;
    if (activeChatUnsubscribe) {
        activeChatUnsubscribe();
        activeChatUnsubscribe = null;
    }
    document.getElementById('chat-thread').style.display = 'none';
    document.getElementById('chat-inbox').style.display = 'block';
};

window.sendChatMessage = async () => {
    if (!currentChatId || !auth.currentUser) return;
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    
    input.value = '';
    
    try {
        await addDoc(collection(db, 'chats', currentChatId, 'messages'), {
            senderId: auth.currentUser.uid,
            text: text,
            timestamp: Date.now()
        });
        
        await updateDoc(doc(db, 'chats', currentChatId), {
            lastMessage: text,
            lastSenderId: auth.currentUser.uid,
            lastUpdated: Date.now()
        });
    } catch (e) {
        window.showToast?.('Failed to send message: ' + e.message, 'err');
    }
};
