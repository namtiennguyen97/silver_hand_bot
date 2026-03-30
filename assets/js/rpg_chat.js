/* RPG CHAT ENGINE - SHARED */
let chatTypeInterval = null;
let currentChatFullText = '';
window.isChatTyping = false;
let suppressChatOutsideClose = false;

function typewriterChat(text, container, speed = 25, onComplete = null) {
    if (chatTypeInterval) clearInterval(chatTypeInterval);

    const rpgNextIndicator = document.getElementById('rpgNextIndicator');
    
    container.innerHTML = '';
    container.dataset.skip = 'false';
    currentChatFullText = String(text || '');
    window.isChatTyping = true;
    
    if (rpgNextIndicator) rpgNextIndicator.classList.remove('visible');

    let i = 0;
    let isTag = false;
    let textHTML = "";

    const finishTyping = () => {
        container.innerHTML = currentChatFullText;
        clearInterval(chatTypeInterval);
        chatTypeInterval = null;
        window.isChatTyping = false;
        if (rpgNextIndicator) rpgNextIndicator.classList.add('visible');
        if (onComplete) onComplete();
    };

    chatTypeInterval = setInterval(() => {
        if (container.dataset.skip === 'true' || i >= currentChatFullText.length) {
            finishTyping();
            return;
        }
        
        let char = currentChatFullText.charAt(i);
        textHTML += char;
        
        if (char === '<') isTag = true;
        if (char === '>') isTag = false;
        
        i++;
        
        if (!isTag) {
            container.innerHTML = textHTML;
            container.scrollTop = container.scrollHeight;
        }
    }, speed);

    container.onclick = (e) => {
        if (window.isChatTyping) {
            e.stopPropagation();
            container.dataset.skip = 'true';
        } else {
            // If in tutorial mode, let it bubble so the tutorial-overlay catches it
            if (document.body.classList.contains('tutorial-lock')) {
                // Don't hideRPGChat, don't stop propagation
            } else {
                e.stopPropagation();
                hideRPGChat();
            }
        }
    };
}

function showRPGChat(chatText, avatarSrc = 'assets/img/mayor_5.png', speaker = 'Silver-Hand') {
    const chatOverlay = document.getElementById('rpgChatOverlay');
    const rpgChatContent = document.getElementById('rpgChatContent');
    const rpgSpeakerName = document.getElementById('rpgSpeakerName');

    if (!chatOverlay || !rpgChatContent) return;

    if (chatTypeInterval) clearInterval(chatTypeInterval);
    
    const avatarImg = chatOverlay.querySelector('.rpg-avatar img');
    if (avatarImg) avatarImg.src = avatarSrc;
    
    if (rpgSpeakerName) rpgSpeakerName.textContent = speaker;

    suppressChatOutsideClose = true;
    chatOverlay.style.display = 'block';
    chatOverlay.classList.add('active');
    rpgChatContent.innerHTML = '';
    rpgChatContent.dataset.skip = 'false';

    typewriterChat(chatText, rpgChatContent, 20);
    setTimeout(() => { suppressChatOutsideClose = false; }, 100);
}

function hideRPGChat() {
    const chatOverlay = document.getElementById('rpgChatOverlay');
    if (chatTypeInterval) clearInterval(chatTypeInterval);
    window.isChatTyping = false;
    if (chatOverlay) {
        chatOverlay.style.display = 'none';
        chatOverlay.classList.remove('active');
        if (window.toggleHUD) window.toggleHUD(true);
        if (window.playSfx && window.cancelAudio) window.playSfx(window.cancelAudio);
    }
}

// Global click handler for closing chat
document.addEventListener('click', (e) => {
    if (suppressChatOutsideClose) return;
    if (document.body.classList.contains('tutorial-lock')) return; // Guard for tutorials
    
    const chatOverlay = document.getElementById('rpgChatOverlay');
    if (chatOverlay && chatOverlay.style.display === 'block' && !chatOverlay.contains(e.target)) {
        hideRPGChat();
    }
});
