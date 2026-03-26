/*************************************************
 * STATE
 *************************************************/
const conversationList = [];
let currentConversation = { id: genId(), title: 'Cuộc trò chuyện mới', messages: [] };

const historyListEl = document.getElementById('historyList');

const messagesBox = document.getElementById('messagesBox');
const statusEl = document.getElementById('status');
const promptInput = document.getElementById('promptInput');
const sendBtn = document.getElementById('sendBtn');
const quickSuggestions = document.getElementById('quickSuggestions');
const faqTrigger = document.getElementById('faqTrigger');
const newChatBtn = document.getElementById('newChatBtn');
const clearBtn = document.getElementById('clear');

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
        item.className = 'history-item';

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
    if (!messagesBox) return;
    messagesBox.innerHTML = '';

    currentConversation.messages.forEach(m => {
        const row = document.createElement('div');
        row.className = 'msg-row ' + (m.role === 'user' ? 'user' : 'assistant');

        if (m.role === 'assistant') {
            const rpgBox = document.createElement('div');
            rpgBox.className = 'bot-rpg-box';
            
            // Defensively check content
            const displayContent = m.content || '...';
            
            rpgBox.innerHTML = `
                <div class="bot-avatar-sq">
                    <img src="assets/img/mayor_avatar.jpg" alt="Bot">
                </div>
                <div class="bot-text-content">
                    ${displayContent.includes('chat-loading') ? displayContent : sanitizeHTML(displayContent)}
                </div>
            `;
            row.appendChild(rpgBox);
        } else {
            const bubble = document.createElement('div');
            bubble.className = 'msg-bubble';
            bubble.textContent = m.content;
            row.appendChild(bubble);
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
        if (statusEl) statusEl.textContent = 'Kết nối...';

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

        if (statusEl) statusEl.textContent = 'Online';

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


/*************************************************
 * NEW CHAT
 *************************************************/
function startNewChat() {
    currentConversation = { id: genId(), title: 'Luồng dữ liệu mới', messages: [] };
    initFirstMessage();
    renderHistory();
}

newChatBtn?.addEventListener('click', () => {
    startNewChat();
    // Auto-close sidebar on mobile/narrow
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('active');
});

/*************************************************
 * CLEAR DATA
 *************************************************/
clearBtn?.addEventListener("click", () => {
    const ok = confirm("CẢNH BÁO: Bạn có chắc chắn muốn XÓA TOÀN BỘ dữ liệu hội thoại? Thao tác này không thể hoàn tác.");
    if (ok) {
        conversationList.length = 0;
        localStorage.removeItem('chat_history'); // Clear persistence if exists
        startNewChat();
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
 * QUICK SUGGESTIONS (FAQ POPUP)
 *************************************************/
function renderQuickSuggestions() {
    const questions = [
        "Sự kiện camp hôm nay có gì?",
        "Làm sao để lên cấp nhanh?",
        "Nhiệm vụ Shelter Land",
        "Nghề nào kiếm tiền tốt?",
        "Cách nạp thẻ an toàn"
    ];

    quickSuggestions.innerHTML = `
        <div class="sidebar-header" style="margin-bottom:30px">
            <h1>SELECT_NEURAL_QUERY</h1>
        </div>
        <div class="suggestions-grid"></div>
        <button class="hud-action-btn wipe-btn" style="margin-top:30px; width:auto; padding:10px 30px" onclick="toggleFAQ()">CANCEL</button>
    `;
    
    const grid = quickSuggestions.querySelector('.suggestions-grid');

    questions.forEach(q => {
        const chip = document.createElement('div');
        chip.className = 'suggestion-chip';
        chip.textContent = q;
        chip.onclick = () => {
            promptInput.value = q;
            toggleFAQ();
            sendMessage();
        };
        grid.appendChild(chip);
    });
}

function toggleFAQ() {
    quickSuggestions.classList.toggle('active');
}

faqTrigger?.addEventListener('click', toggleFAQ);

// Close FAQ on backdrop click
quickSuggestions?.addEventListener('click', (e) => {
    if (e.target === quickSuggestions) toggleFAQ();
});

function initFirstMessage() {
    currentConversation.messages = [{
        role: 'assistant',
        content: `NEURAL LINK ESTABLISHED. <b style="color: #5ef2d6">SILVER-HAND NODE</b> READY FOR INQUIRIES.<br>WELCOME BACK, CITIZEN.`
    }];
    renderMessages();
}

function init() {
    initFirstMessage();
    renderQuickSuggestions();
    if (statusEl) statusEl.textContent = 'ONLINE';
    if(renderHistory) renderHistory();
}

init();
