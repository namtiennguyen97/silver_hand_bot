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
    infoD: { title: "🛠️ Chi tiết Cert", template: "tpl-infoD" },
    aboutMe: { title: "Personal Profile", template: "tpl-aboutMe" },
    news: { title: "LATEST NEWS", template: "tpl-news" }
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
    "About me": () => {
        openModalByKey("aboutMe");
        if (window.initAboutMeGallery) window.initAboutMeGallery(modalContent);
    },
    "Chat": () => window.location.href = "chat.html",
    "CTC-PLAN editor": () => window.location.href = "ctc-planer.html",
    "NEWS": () => {
        openModalByKey("news");
        fetchNews();
    },
    "Tutorial": () => {
        if (window.startTutorial) {
            window.startTutorial();
        } else {
            showRPGChat("Tutorial sequence is being recalibrated. Coming soon 👀", 'assets/img/mayor_5.png');
        }
    },
    "Settings": () => showRPGChat("Configuration module is currently locked.", 'assets/img/mayor_5.png')
};

const tooltipOptionsData = {
    mayorOptions: ["Chat", "About me", "Tutorial", "Settings"],
    controlOptions: ["Event Time", "Heart Lock Zone Code", "Cert Details", "CTC-PLAN editor", "NEWS"],
    helpOptions: ["Tutorial"]
};

/* ===============================
   INIT & EVENTS
================================ */
window.addEventListener('load', () => {
    warmupVideo(videoMain, true);
    warmupVideo(videoAlt, false); // Keep alt paused initially
    hotspotEngine.collect();
    syncLayout();
    
    // HUD SYNC EFFECT - triggered when loading is finished
    window.addEventListener('app:loaded', () => {
        const hudSync = document.createElement('div');
        hudSync.id = 'hud-sync-overlay';
        hudSync.innerHTML = `
            <div class="hud-sync-text">HUD SYNCHRONIZING...</div>
            <div class="hud-scan-line"></div>
        `;
        document.body.appendChild(hudSync);
        
        setTimeout(() => {
            hudSync.classList.add('fade-out');
            setTimeout(() => {
                hudSync.remove();
                // Reveal hotspots with a slight delay for dramatic effect
                document.querySelectorAll('.hotspot').forEach((hs, i) => {
                    hs.style.opacity = '0';
                    hs.style.transform = 'scale(0.5)';
                    hs.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    setTimeout(() => {
                        hs.style.opacity = '1';
                        hs.style.transform = 'scale(1)';
                    }, 300 + (i * 100));
                });
            }, 500);
        }, 1200);
    });
});

window.addEventListener('resize', syncLayout);

document.addEventListener('click', (e) => {
    if (suppressChatOutsideClose) return;
    if (document.body.classList.contains('tutorial-lock')) return; 

    if (chatOverlay.style.display === 'block' && !chatOverlay.contains(e.target)) {
        hideRPGChat();
    }
});

chatOverlay.addEventListener('click', (e) => e.stopPropagation());

document.querySelectorAll(".hotspot-tooltip .tooltip-box").forEach((box) => {
    box.addEventListener("click", (e) => {
        e.stopPropagation();
        
        const key = box.dataset.options;
        if (!key) {
            // Check if it's the HELP button
            if (box.classList.contains("pulse-help")) {
                if (window.startTutorial) {
                    window.startTutorial();
                } else {
                    showRPGChat("Tutorial sequence is being recalibrated. Coming soon 👀", 'assets/img/mayor_5.png');
                }
            }
            return; 
        }

        setControlPanelBackgroundVideo();
        showRPGChat("Security clearance granted. Choose an option.", 'assets/img/mayor_5.png');
        box.classList.add("tooltip-pulse-border");

        setTimeout(() => {
            box.classList.remove("tooltip-pulse-border");
            const key = box.dataset.options;
            const options = tooltipOptionsData[key] || [];
            cyberOverlay.innerHTML = "";

            options.forEach((text, index) => {
                const optionEl = document.createElement("div");
                optionEl.className = "cyber-option";

                // Wrap label so flex layout works with extra children
                const labelSpan = document.createElement('span');
                labelSpan.className = 'option-label';
                labelSpan.textContent = text;
                optionEl.appendChild(labelSpan);

                // Add index number for HUD feel [01], [02] etc.
                const displayIndex = (index + 1).toString().padStart(2, '0');
                optionEl.setAttribute('data-index', `[${displayIndex}]`);

                // Inject scan-line element (hidden by default, shown on --selected)
                const scanLine = document.createElement('div');
                scanLine.className = 'option-scan-line';
                optionEl.appendChild(scanLine);

                // Inject loading dots (hidden by default, shown on --selected)
                const dots = document.createElement('div');
                dots.className = 'option-loading-dots';
                dots.innerHTML = '<span></span><span></span><span></span>';
                optionEl.appendChild(dots);

                // Inject a dedicated pulse ring element to avoid pseudo-element conflicts
                const pulseRing = document.createElement('div');
                pulseRing.className = 'option-pulse-ring';
                optionEl.appendChild(pulseRing);

                // Trigger sequential reveal animation
                optionEl.style.animation = `cyberReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards ${index * 0.08}s`;

                optionEl.addEventListener("click", (ev) => {
                    ev.stopPropagation();

                    // Optional haptic vibration for mobile (short pulse)
                    if (navigator.vibrate) navigator.vibrate(40);

                    // Hide RPG chat to free up screen space (especially for small mobile screens)
                    if (typeof hideRPGChat === 'function') hideRPGChat();

                    // Get all sibling options
                    const allOptions = Array.from(cyberOverlay.querySelectorAll('.cyber-option'));

                    // Mark selected & dismiss others
                    allOptions.forEach(opt => {
                        // Clear the inline reveal animation so class-based animations can take over
                        opt.style.animation = '';
                        // Ensure it stays visible (avoid reverting to default opacity 0)
                        opt.style.opacity = '1';
                        opt.style.transform = 'translateX(0)';
                        
                        // Force reflow
                        void opt.offsetWidth;

                        if (opt === optionEl) {
                            opt.classList.add('cyber-option--selected');
                        } else {
                            opt.classList.add('cyber-option--dismissed');
                        }
                    });

                    // After selection animation (~950ms), execute action
                    setTimeout(() => {
                        cyberOverlay.style.display = "none";
                        // Clean up classes for next open
                        allOptions.forEach(opt => {
                            opt.classList.remove('cyber-option--selected', 'cyber-option--dismissed');
                        });
                        setDefaultBackgroundVideo();
                        if (optionActions[text]) optionActions[text]();
                    }, 950);
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

/* ===============================
   PERFORMANCE CHECK
================================ */
window.addEventListener('app:loaded', () => {
    let frameCount = 0;
    let lastTime = performance.now();
    let isChecking = true;

    function countFrames() {
        if (!isChecking) return;
        frameCount++;
        requestAnimationFrame(countFrames);
    }

    // Start counting right after loading
    countFrames();

    // Measure FPS over 2.5 seconds
    setTimeout(() => {
        isChecking = false;
        let elapsed = performance.now() - lastTime;
        let fps = (frameCount * 1000) / elapsed;

        // If average FPS is lower than typical 60 (e.g., < 40)
        if (fps < 40) {
            // Wait until intro animations finish
            setTimeout(() => {
                if (typeof showRPGChat === 'function') {
                    const sequence = [
                        { text: "Cảnh báo hệ thống: Thiết bị của bạn cấu hình khá thấp để xử lý đồ họa cấp cao. Trải nghiệm có thể bị giật lag trên giao diện này.", avatar: 'assets/img/worker_silver.png', speaker: 'System' },
                        { text: "Hmmm.... is that so..", avatar: 'assets/img/mayor_5.png', speaker: 'Silver-Hand' }
                    ];
                    
                    let currentIndex = 0;
                    const container = document.getElementById('rpgChatContent');
                    
                    function playNext() {
                        if (currentIndex >= sequence.length) {
                            if (typeof hideRPGChat === 'function') hideRPGChat();
                            return;
                        }
                        
                        const step = sequence[currentIndex];
                        showRPGChat(step.text, step.avatar, step.speaker);
                        
                        if (container) {
                            setTimeout(() => {
                                const originalOnClick = container.onclick;
                                container.onclick = (e) => {
                                    e.stopPropagation();
                                    if (window.isChatTyping) {
                                        if (originalOnClick) originalOnClick(e);
                                    } else {
                                        currentIndex++;
                                        playNext();
                                    }
                                };
                            }, 50);
                        }
                    }
                    
                    playNext();
                }
            }, 3500);
        }
    }, 2500);
});
// BIO GALLERY LOGIC
window.initAboutMeGallery = function(container) {
    const trigger = container.querySelector("#bioAvatarTrigger");
    const gallery = document.getElementById("bioGallery");
    const galleryImg = document.getElementById("galleryImg");
    const closeBtn = document.getElementById("closeGallery");
    const prevBtn = document.getElementById("prevGallery");
    const nextBtn = document.getElementById("nextGallery");

    if (!trigger || !gallery) return;

    const images = [
        "assets/img/mayor_profile/img.png",
        "assets/img/mayor_profile/img_1.png",
        "assets/img/mayor_profile/img_2.png",
        "assets/img/mayor_profile/img_3.png",
        "assets/img/mayor_profile/img_4.png",
        "assets/img/mayor_profile/img_5.png",
        "assets/img/mayor_profile/img_7.png",
        "assets/img/mayor_profile/img_8.png",
        "assets/img/mayor_profile/img_9.png"
    ];
    let currentIndex = 0;

    function updateImage() {
        galleryImg.src = images[currentIndex];
        // Digital glitch effect on change
        galleryImg.style.filter = "hue-rotate(90deg) brightness(2)";
        setTimeout(() => galleryImg.style.filter = "brightness(1.1)", 100);
    }

    trigger.addEventListener("click", () => {
        currentIndex = 0;
        updateImage();
        gallery.style.display = "flex";
    });

    closeBtn.addEventListener("click", () => {
        gallery.style.display = "none";
    });

    prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateImage();
    });

    nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % images.length;
        updateImage();
    });

    // Close on click outside the screen
    gallery.addEventListener("click", (e) => {
        if (e.target === gallery) gallery.style.display = "none";
    });
};

async function fetchNews() {
    const container = document.getElementById("newsContainer");
    if (!container) return;

    // Check if running via file:// protocol
    const isLocalFile = window.location.protocol === 'file:';

    try {
        // If local, /api/news will fail. Suggest a local server.
        const apiUrl = isLocalFile ? "api/news.js" : "/api/news"; // Just to trigger the catch with a better message
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("HTTP Status " + response.status);
        
        const data = await response.json();
        console.log("MAYOR AI - News Data:", data);

        if (data.news && data.news.length > 0) {
            container.innerHTML = "";
            data.news.forEach((item, index) => {
                const itemEl = document.createElement("a");
                itemEl.className = "news-item reveal";
                itemEl.href = item.link;
                itemEl.target = "_blank";
                itemEl.style.animationDelay = `${index * 0.1}s`;
                
                // Using innerHTML with a clean template to ensure classes are correctly applied and rendered
                const titleText = item.title || "NO TITLE DATA";
                itemEl.innerHTML = `
                    <div class="news-item-overlay"></div>
                    <div class="news-scan-line"></div>
                    <div class="news-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; position: relative; z-index: 2;">
                        <span class="news-category">${item.category || 'NEWS'}</span>
                        <span class="news-date">${item.date || ''}</span>
                    </div>
                    <div class="news-title" style="color: #ffffff !important; display: block !important; visibility: visible !important; opacity: 1 !important; z-index: 10 !important; font-weight: bold !important; font-size: 16px !important; margin: 8px 0 !important; font-family: 'Conthrax', 'Orbitron', Arial, sans-serif !important;">${titleText}</div>
                    <div class="news-summary" style="display: block !important; color: rgba(216, 255, 255, 0.8) !important;">${item.summary || ''}</div>
                `;

                container.appendChild(itemEl);
            });
        } else {
            container.innerHTML = `
                <div class="news-loading-text" style="padding: 20px; text-align: center;">
                    NO DATA ACCESSED. SYSTEM CLEAR.
                </div>
            `;
        }
    } catch (err) {
        console.error("News fetch error:", err);
        
        let errorMessage = "CRITICAL ERROR: CONNECTION TIMEOUT";
        let subMessage = "The neural link to the news database was severed.";
        
        if (isLocalFile) {
            errorMessage = "PROTOCOL RESTRICTION: CORS BLOCK";
            subMessage = "System detected local file access (file://). To access live news, please use a local server (e.g., 'npx vercel dev' or VS Code Live Server).";
        }

        container.innerHTML = `
            <div class="news-loading-text" style="padding: 20px; text-align: center; color: var(--danger);">
                <div>${errorMessage}</div>
                <div style="font-size: 10px; margin-top: 10px; color: var(--muted); text-transform: none; font-family: sans-serif;">
                    ${subMessage}
                </div>
            </div>
        `;
    }
}
