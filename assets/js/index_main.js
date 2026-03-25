/* ===============================
   CONFIG
================================ */
const VIDEO_W   = 1280;
const VIDEO_H   = 720;
const CONTENT_W = 475;

/* ===============================
   ELEMENTS
================================ */
const videoMain = document.getElementById('videoMain');
const videoAlt = document.getElementById('videoAlt');
const hotspotLayer = document.getElementById('hotspot-layer');
const videoTransitionMask = document.getElementById('videoTransitionMask');
const chatOverlay = document.getElementById('rpgChatOverlay');
const rpgChatContent = document.getElementById('rpgChatContent');

let video = videoMain;

/* ===============================
   HOTSPOT ENGINE
================================ */
class HotspotEngine {
    constructor(videoEl, layerEl, videoW, videoH) {
        this.video  = videoEl;
        this.layer  = layerEl;
        this.videoW = videoW;
        this.videoH = videoH;
        this.items  = [];
    }

    collect() {
        this.items = Array.from(this.layer.querySelectorAll('.hotspot'));
    }

    update() {
        if (!this.video || !this.items.length) return;

        const rect = this.video.getBoundingClientRect();

        this.items.forEach(hs => {
            const x = parseFloat(hs.dataset.x);
            const y = parseFloat(hs.dataset.y);

            if (isNaN(x) || isNaN(y)) return;

            const px = rect.left + (x / this.videoW) * rect.width;
            const py = rect.top  + (y / this.videoH) * rect.height;

            hs.style.left = px + 'px';
            hs.style.top  = py + 'px';
        });
    }
}

const hotspotEngine = new HotspotEngine(video, hotspotLayer, VIDEO_W, VIDEO_H);

function hideHotspots() {
    if (!hotspotLayer) return;
    hotspotLayer.classList.add('is-hidden');
}

function showHotspots() {
    if (!hotspotLayer) return;
    hotspotLayer.classList.remove('is-hidden');
}

/* ===============================
   VIDEO LAYOUT
================================ */
function layoutVideo() {
    const vw = Math.min(window.innerWidth, CONTENT_W);
    const vh = window.innerHeight;

    const scaleContent = vw / CONTENT_W;
    const scaleVideo   = vw / VIDEO_W;
    const scale        = Math.max(scaleContent, scaleVideo);

    const renderW = VIDEO_W * scale;
    const renderH = VIDEO_H * scale;

    const contentCenterX = (VIDEO_W / 2) * scale;
    const screenCenter = window.innerWidth / 2;

    const left = (screenCenter - contentCenterX) + 'px';
    const top  = (vh - renderH) / 2 + 'px';

    [videoMain, videoAlt].forEach((v) => {
        if (!v) return;
        v.style.width  = renderW + 'px';
        v.style.height = renderH + 'px';
        v.style.left   = left;
        v.style.top    = top;
    });
}

function syncLayout() {
    layoutVideo();
    hotspotEngine.update();
}

/* ===============================
   VIDEO PERFORMANCE OPTIMIZATIONS
================================ */
function ensurePlaying(videoEl) {
    if (!videoEl) return;
    const p = videoEl.play();
    if (p && typeof p.then === "function") {
        p.catch(() => {});
    }
}

function ensurePaused(videoEl) {
    if (!videoEl) return;
    videoEl.pause();
}

let currentVideoKey = "main"; // "main" | "alt"
let isVideoTransitioning = false;
let pendingVideoKey = null;

async function crossfadeTo(targetKey) {
    if (targetKey === currentVideoKey && !isVideoTransitioning) return;

    if (isVideoTransitioning) {
        pendingVideoKey = targetKey;
        return;
    }

    isVideoTransitioning = true;

    try {
        const nextVideo = targetKey === "main" ? videoMain : videoAlt;
        const prevVideo = currentVideoKey === "main" ? videoMain : videoAlt;

        // Start playing next video before transition
        ensurePlaying(nextVideo);

        // Sync playback time for seamless transition
        try {
            const prevTime = prevVideo.currentTime || 0;
            const nextDuration = nextVideo.duration || 0;
            if (nextDuration > 0) {
                nextVideo.currentTime = prevTime % nextDuration;
            }
        } catch (e) {}

        if (targetKey === "alt") hideHotspots();

        // Crossfade
        prevVideo.classList.remove("active");
        nextVideo.classList.add("active");

        video = nextVideo;
        hotspotEngine.video = nextVideo;

        if (targetKey === "main") {
            hotspotEngine.update();
            showHotspots();
        }

        if (videoTransitionMask) {
            videoTransitionMask.classList.add("fade-out");
            await new Promise((resolve) => setTimeout(resolve, 520));
            videoTransitionMask.classList.remove("fade-out");
        } else {
            await new Promise((resolve) => setTimeout(resolve, 420));
        }

        // OPTIMIZATION: Pause the video that is no longer visible to save resources
        ensurePaused(prevVideo);
        
        currentVideoKey = targetKey;
    } finally {
        isVideoTransitioning = false;
        if (pendingVideoKey && pendingVideoKey !== currentVideoKey) {
            const nextPending = pendingVideoKey;
            pendingVideoKey = null;
            crossfadeTo(nextPending);
        }
    }
}

function setDefaultBackgroundVideo() { crossfadeTo("main"); }
function setControlPanelBackgroundVideo() { crossfadeTo("alt"); }

function warmupVideo(videoEl, isPrimary = false) {
    if (!videoEl) return;
    videoEl.load();
    if (isPrimary) {
        ensurePlaying(videoEl);
    } else {
        ensurePaused(videoEl);
    }
}

/* ===============================
   RPG CHAT ENGINE
================================ */
let chatTypeInterval = null;
let currentChatFullText = '';
window.isChatTyping = false;
let suppressChatOutsideClose = false;

function typewriterChat(text, container, speed = 25) {
    if (chatTypeInterval) clearInterval(chatTypeInterval);

    container.innerHTML = '';
    container.dataset.skip = 'false';
    currentChatFullText = String(text || '');
    window.isChatTyping = true;

    let i = 0;
    let isTag = false;
    let textHTML = "";

    chatTypeInterval = setInterval(() => {
        if (container.dataset.skip === 'true' || i >= currentChatFullText.length) {
            container.innerHTML = currentChatFullText;
            clearInterval(chatTypeInterval);
            chatTypeInterval = null;
            window.isChatTyping = false;
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

    container.onclick = () => { if (window.isChatTyping) container.dataset.skip = 'true'; };
}

function showRPGChat(chatText, avatarSrc = 'assets/img/mayor_5.png') {
    if (chatTypeInterval) clearInterval(chatTypeInterval);
    
    const avatarImg = chatOverlay.querySelector('.rpg-avatar img');
    if (avatarImg) avatarImg.src = avatarSrc;

    suppressChatOutsideClose = true;
    chatOverlay.style.display = 'block';
    rpgChatContent.textContent = '';
    rpgChatContent.dataset.skip = 'false';

    typewriterChat(chatText, rpgChatContent, 25);
    setTimeout(() => { suppressChatOutsideClose = false; }, 50);
}

function hideRPGChat() {
    if (chatTypeInterval) clearInterval(chatTypeInterval);
    window.isChatTyping = false;
    chatOverlay.style.display = 'none';
}

/* ===============================
   MODAL & OPTIONS
================================ */
const modal = document.getElementById("infoModal");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");
const cyberOverlay = document.getElementById("cyberOverlay");

const modalData = {
    infoA: { title: "Thời gian event camp", template: "tpl-infoA" },
    infoB: { title: "⚔️ Giới thiệu về Cert", template: "tpl-infoB" },
    infoC: { title: "🔐 Code Heart Lock Zone", template: "tpl-infoC" },
    infoD: { title: "🛠️ Chi tiết Cert", template: "tpl-infoD" }
};

function openModalByKey(key) {
    const data = modalData[key];
    if (!data) return;
    modalTitle.textContent = data.title || "";
    modalContent.innerHTML = "";
    const tpl = document.getElementById(data.template);
    if (tpl) modalContent.appendChild(tpl.content.cloneNode(true));
    modal.style.display = "flex";
}

const optionActions = {
    "Event Time": () => openModalByKey("infoA"),
    "Heart Lock Zone Code": () => openModalByKey("infoC"),
    "Cert Details": () => {
        openModalByKey("infoD");
        if (window.initCertSkill) window.initCertSkill(modalContent);
    },
    "Chat": () => showRPGChat("AI chat is currently under maintenance. (2026/03/20)"),
    "CTC-PLAN editor": () => window.location.href = "ctc-planer.html",
    "Tutorial": () => showRPGChat("Tutorial is coming soon 👀"),
    "Settings": () => showRPGChat("Settings is under development")
};

const tooltipOptionsData = {
    mayorOptions: ["Chat", "Tutorial", "Settings"],
    controlOptions: ["Event Time", "Heart Lock Zone Code", "Cert Details", "CTC-PLAN editor"]
};

/* ===============================
   INIT & EVENTS
================================ */
window.addEventListener('load', () => {
    warmupVideo(videoMain, true);
    warmupVideo(videoAlt, false); // Keep alt paused initially
    hotspotEngine.collect();
    syncLayout();
});

window.addEventListener('resize', syncLayout);

document.addEventListener('click', (e) => {
    if (suppressChatOutsideClose) return;
    if (chatOverlay.style.display === 'block' && !chatOverlay.contains(e.target)) {
        hideRPGChat();
    }
});

chatOverlay.addEventListener('click', (e) => e.stopPropagation());

document.querySelectorAll(".hotspot-tooltip .tooltip-box").forEach((box) => {
    box.addEventListener("click", (e) => {
        e.stopPropagation();
        setControlPanelBackgroundVideo();
        showRPGChat("You’ve accessed the control panel. Choose an option.");
        box.classList.add("tooltip-pulse-border");

        setTimeout(() => {
            box.classList.remove("tooltip-pulse-border");
            const key = box.dataset.options;
            const options = tooltipOptionsData[key] || [];
            cyberOverlay.innerHTML = "";

            options.forEach((text, index) => {
                const optionEl = document.createElement("div");
                optionEl.className = "cyber-option";
                optionEl.textContent = text;
                optionEl.style.animation = `slideIn 0.4s ease forwards ${index * 0.08}s`;
                
                optionEl.addEventListener("click", (ev) => {
                    ev.stopPropagation();
                    cyberOverlay.style.display = "none";
                    setDefaultBackgroundVideo();
                    if (optionActions[text]) optionActions[text]();
                });
                cyberOverlay.appendChild(optionEl);
            });
            cyberOverlay.style.display = "flex";
        }, 100);
    });
});

cyberOverlay.addEventListener("click", (e) => {
    if (e.target === cyberOverlay) {
        cyberOverlay.style.display = "none";
        setDefaultBackgroundVideo();
    }
});

if (closeModal) closeModal.onclick = () => (modal.style.display = "none");
if (modal) modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

// Block context menu
document.addEventListener("contextmenu", (e) => e.preventDefault());
document.addEventListener("touchstart", (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
document.addEventListener("gesturestart", (e) => e.preventDefault());
