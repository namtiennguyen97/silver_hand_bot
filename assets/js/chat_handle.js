/*************************************************
 * STATE
 *************************************************/
const conversationList = [];
let currentConversation = { id: genId(), title: 'Cuộc trò chuyện mới', messages: [] };

const isMobile = window.matchMedia("(max-width: 980px)").matches;
const historyListEl = isMobile
    ? document.getElementById('historyListMobile')
    : document.getElementById('historyList');

const messagesBox = document.getElementById('messagesBox');
const statusEl = document.getElementById('status');
const promptInput = document.getElementById('promptInput');
const sendBtn = document.getElementById('sendBtn');

/*************************************************
 * UTIL
 *************************************************/
function genId() {
    return Math.random().toString(36).slice(2, 9);
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));
}

function sanitizeHTML(str) {
    return String(str)
        .replace(/<script.*?>.*?<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/g, '')
        .replace(/on\w+='[^']*'/g, '');
}

/*************************************************
 * CHAT LOADING (NEON CHUNK)
 *************************************************/
function createChatLoading() {
    const id = "loading-" + Math.random().toString(36).slice(2, 7);
    const TOTAL_CHUNKS = 8;

    let html = `
      <div class="chat-loading" data-loading-id="${id}">
        <div class="chat-loading-bar">
    `;

    for (let i = 0; i < TOTAL_CHUNKS; i++) {
        html += `<div class="chunk"></div>`;
    }

    html += `
        </div>
      </div>
    `;

    return { html, id };
}

function startChatLoading(id) {
    const wrapper = document.querySelector(`[data-loading-id="${id}"]`);
    if (!wrapper) return;

    const chunks = wrapper.querySelectorAll(".chunk");
    let index = 0;

    const timer = setInterval(() => {
        chunks.forEach((c, i) => {
            c.classList.toggle("active", i <= index);
        });
        index = (index + 1) % chunks.length;
    }, 120);

    return () => clearInterval(timer);
}

/*************************************************
 * HISTORY
 *************************************************/
function addHistory(conv) {
    conversationList.unshift(conv);
    renderHistory();
}

function renderHistory() {
    historyListEl.innerHTML = '';
    conversationList.forEach(conv => {
        const item = document.createElement('div');
        item.className = 'chat-item';

        if (conv.id === currentConversation.id) {
            item.classList.add('active');
        }

        item.innerHTML = `
          <div class="dot"></div>
          <div class="meta">
            <div style="font-weight:600">${escapeHtml(conv.title)}</div>
            <div style="font-size:12px;color:var(--muted)">
              ${conv.messages.length} tin nhắn
            </div>
          </div>
        `;

        item.onclick = () => loadConversation(conv.id);
        historyListEl.appendChild(item);
    });
}

function loadConversation(id) {
    const found = conversationList.find(c => c.id === id);
    if (found) {
        currentConversation = JSON.parse(JSON.stringify(found));
        renderHistory();
        renderMessages();
    }
}

/*************************************************
 * RENDER MESSAGES
 *************************************************/
function renderMessages() {
    messagesBox.innerHTML = '';

    currentConversation.messages.forEach(m => {
        const row = document.createElement('div');
        row.className = 'msg-row ' + (m.role === 'user' ? 'user' : 'assistant');

        if (m.role === 'assistant') {
            const botBlock = document.createElement('div');
            botBlock.className = 'bot-block';

            const header = document.createElement('div');
            header.className = 'bot-header';
            header.innerHTML = `
              <div class="avatar-bot">
                <img src="assets/img/mayor_avatar.jpg" alt="Bot">
              </div>
              <div class="bot-name">Silver-Hand</div>
            `;

            const msgEl = document.createElement('div');
            msgEl.className = 'msg assistant';
            msgEl.innerHTML = sanitizeHTML(m.content);

            botBlock.appendChild(header);
            botBlock.appendChild(msgEl);
            row.appendChild(botBlock);
        } else {
            const msgEl = document.createElement('div');
            msgEl.className = 'msg user';
            msgEl.textContent = m.content;
            row.appendChild(msgEl);
        }

        messagesBox.appendChild(row);
    });

    messagesBox.scrollTop = messagesBox.scrollHeight;
}

/*************************************************
 * SEND MESSAGE
 *************************************************/
async function sendMessage() {
    const text = promptInput.value.trim();
    if (!text) return;

    const userMsg = { role: 'user', content: text };
    currentConversation.messages.push(userMsg);
    promptInput.value = '';
    renderMessages();

    /* ====== LOADING BUBBLE ====== */
    const loading = createChatLoading();
    const pending = {
        role: 'assistant',
        content: loading.html,
        _loadingId: loading.id
    };

    currentConversation.messages.push(pending);
    renderMessages();

    const stopLoading = startChatLoading(loading.id);

    try {
        statusEl.textContent = 'Kết nối...';

        const resp = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: currentConversation.messages.filter(
                    m => !(m.role === 'assistant' && m._loadingId)
                )
            })
        });

        const data = await resp.json();

        if (!resp.ok) {
            pending.content = '⚠️ Lỗi server: ' + (data?.error || resp.statusText);
        } else {
            pending.content =
                data.choices?.[0]?.message?.content ||
                data.reply ||
                'Không có phản hồi.';
        }
    } catch (err) {
        pending.content = '⚠️ Lỗi khi gọi API: ' + err.message;
    } finally {
        if (typeof stopLoading === "function") stopLoading();

        statusEl.textContent = 'Online';

        const exists = conversationList.find(c => c.id === currentConversation.id);
        if (!exists) {
            currentConversation.title =
                currentConversation.messages[0]?.content?.slice(0, 40) ||
                currentConversation.title;
            addHistory(JSON.parse(JSON.stringify(currentConversation)));
        } else {
            conversationList[0] = JSON.parse(JSON.stringify(currentConversation));
        }

        renderMessages();
    }
}

/*************************************************
 * EVENTS
 *************************************************/
sendBtn.addEventListener('click', sendMessage);
promptInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

document.getElementById('newConv').addEventListener('click', () => {
    currentConversation = { id: genId(), title: 'Cuộc trò chuyện mới', messages: [] };
    renderMessages();
});

/*************************************************
 * CLEAR HISTORY MODAL
 *************************************************/
const confirmModal = document.getElementById("confirmModal");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");
const clearBtn = document.getElementById("clear");

clearBtn.addEventListener("click", () => {
    confirmModal.style.display = "flex";
});

confirmYes.addEventListener("click", () => {
    conversationList.length = 0;
    renderHistory();
    currentConversation = { id: genId(), title: 'Cuộc trò chuyện mới', messages: [] };
    renderMessages();
    confirmModal.style.display = "none";
});

confirmNo.addEventListener("click", () => {
    confirmModal.style.display = "none";
});

confirmModal.addEventListener("click", (e) => {
    if (e.target === confirmModal) {
        confirmModal.style.display = "none";
    }
});

/*************************************************
 * EXPORT
 *************************************************/
document.getElementById('export')?.addEventListener('click', () => {
    const text = JSON.stringify(currentConversation, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (currentConversation.title || 'conv') + '.json';
    a.click();
    URL.revokeObjectURL(url);
});

/*************************************************
 * INIT
 *************************************************/
function init() {
    currentConversation.messages.push({
        role: 'assistant',
        content: `Xin chào! Mình là Chatbot <b style="color: orange">Silver-Hand</b> của SAO-ĐÊM hỗ trợ newbies.<br>Hãy hỏi mình những câu hỏi xoay quanh <b style="color: orange">LifeAfter</b> nhé.
            <video 
                src="assets/videos/mayor_confuse.mp4"
                autoplay
                loop
                muted
                playsinline
                style="width:100px;height:100px;border-radius:8px;"
            ></video>
        `
    });
    renderMessages();
    statusEl.textContent = 'Online';
}

init();
