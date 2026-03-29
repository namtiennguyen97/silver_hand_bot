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
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const isMobile = vw <= CONTENT_W;

    let renderW, renderH, left, top;

    if (isMobile) {
        // Mobile: scale content to fill width, center horizontally
        const scaleContent = vw / CONTENT_W;
        const scaleVideo   = vw / VIDEO_W;
        const scale        = Math.max(scaleContent, scaleVideo);

        renderW = VIDEO_W * scale;
        renderH = VIDEO_H * scale;

        const contentCenterX = (VIDEO_W / 2) * scale;
        const screenCenter   = vw / 2;

        left = (screenCenter - contentCenterX) + 'px';
        top  = (vh - renderH) / 2 + 'px';
    } else {
        // Desktop: fit video to max-height, center horizontally, black on sides
        const scaleByH = vh / VIDEO_H;
        renderH = VIDEO_H * scaleByH;
        renderW = VIDEO_W * scaleByH;

        left = (vw - renderW) / 2 + 'px';
        top  = '0px';
    }

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
    "About me": () => {
        openModalByKey("aboutMe");
        if (window.initAboutMeGallery) window.initAboutMeGallery(modalContent);
    },
    "Chat": () => window.location.href = "chat.html",
    "CTC-PLAN editor": () => window.location.href = "ctc-planer.html",
    "Drama": () => window.location.href = "drama.html",
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
    controlOptions: ["Event Time", "Heart Lock Zone Code", "CTC-PLAN editor", "Drama"],
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
        const targetModal = box.dataset.modal;

        if (targetModal) {
            if (targetModal === 'news') {
                openModalByKey("news");
                fetchNews();
            } else {
                openModalByKey(targetModal);
            }
            return;
        }

        if (!key) {
            // Check if it's the HELP button (Legacy / Alternate)
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

    try {
        const apiUrl = "/api/news"; 
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("HTTP Status " + response.status);
        
        const data = await response.json();
        
        if (data.news && data.news.length > 0) {
            container.innerHTML = "";
            
            // 1) Add Broadcast Header
            const headerEl = document.createElement("div");
            headerEl.className = "news-broadcast-header";
            headerEl.innerHTML = `
                <div class="news-live-tag">
                    <div class="news-live-dot"></div>
                    LIVE BROADCAST
                </div>
<!--                <div class="news-station-name">SAO-ĐÊM NETWORK</div>-->
            `;
            container.appendChild(headerEl);

            // 2) Render News Cards
            data.news.forEach((item, index) => {
                const itemEl = document.createElement("div");
                itemEl.className = "news-broadcast-card";
                itemEl.style.animationDelay = `${index * 0.1}s`;
                
                const isFirst = index === 0;
                
                itemEl.innerHTML = `
                    ${isFirst ? '<div class="news-card-breaking">BREAKING</div>' : ''}
                    <div class="news-card-body">
                        <div class="news-card-meta">
                            <span class="news-card-category">${item.category || 'URGENT'}</span>
                            <span class="news-card-date">${item.date || ''}</span>
                        </div>
                        <div class="news-card-title">${item.title}</div>
                        <div class="news-card-summary">${item.summary || ''}</div>
                    </div>
                `;

                itemEl.onclick = () => loadNewsDetail(item.link);
                container.appendChild(itemEl);
            });

            // 3) Add Scrolling Ticker
            const tickerWrap = document.createElement("div");
            tickerWrap.className = "news-ticker-wrap";
            
            const tickerItems = data.news.slice(0, 5).map(n => `<span class="news-ticker-item">${n.title}</span>`).join("");
            
            tickerWrap.innerHTML = `
                <div class="news-ticker-label">TICKER</div>
                <div class="news-ticker-content">
                    ${tickerItems} ${tickerItems}
                </div>
            `;
            container.appendChild(tickerWrap);

        } else {
            container.innerHTML = `<div class="news-loading-text">NO BROADCAST DATA FOUND.</div>`;
        }
    } catch (err) {
        console.error("News fetch error:", err);
        container.innerHTML = `
            <div class="news-loading-text" style="color: var(--danger);">
                BROADCAST OFFLINE
                <div style="font-size: 10px; margin-top: 10px; opacity: 0.6; text-transform: none;">
                    ${err.message}
                </div>
            </div>
        `;
    }
}

// State for translations
let newsTranslations = {};
let currentOriginalNews = null;

let newsLoadingInterval = null;

/**
 * Loads and renders the detailed content of a news article
 */
async function loadNewsDetail(url) {
    const container = document.getElementById("newsContainer");
    const detailView = document.getElementById("newsDetail");
    const detailBody = document.getElementById("newsDetailBody");
    const backBtn = document.getElementById("newsBackBtn");
    const sourceLink = document.getElementById("newsSourceLink");
    const langWrapper = document.getElementById("newsLangWrapper");
    const langSelect = document.getElementById("newsLangSelect");

    if (!container || !detailView || !detailBody) return;

    // Show Language Selector only in Detail View
    if (langWrapper) {
        langWrapper.style.display = "block";
        langWrapper.style.opacity = "1";
    }

    // Reset language to English for new article
    if (langSelect) {
        langSelect.value = "en";
        langSelect.onchange = (e) => translateNewsDetail(e.target.value, url);
    }

    // Show detail view and hide list
    container.classList.add("hidden");
    if (sourceLink) sourceLink.style.display = "none";
    detailView.style.display = "flex";
    
    // Show loading state
    detailBody.innerHTML = `
        <div class="news-loading">
            <div class="news-spinner"></div>
            <div class="news-loading-text">DECRYPTING CONTENT...</div>
        </div>
    `;

    // Setup Back Button
    backBtn.onclick = () => {
        detailView.style.display = "none";
        container.classList.remove("hidden");
        if (sourceLink) sourceLink.style.display = "block";
        if (langWrapper) langWrapper.style.display = "none";
    };

    try {
        const apiUrl = `/api/news?url=${encodeURIComponent(url)}&t=${Date.now()}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Status " + response.status);
        
        const data = await response.json();
        currentOriginalNews = data; // Store original for English/Reference

        renderArticleContent(data);

    } catch (err) {
        console.error("Detail fetch error:", err);
        detailBody.innerHTML = `
            <div class="news-loading-text" style="padding: 20px; text-align: center; color: var(--danger);">
                FAILED TO SYNC ARTICLE.
                <div style="font-size: 10px; margin-top: 10px; text-transform: none; font-family: sans-serif; color: var(--muted);">
                    Connection to server lost. [Error: ${err.message}]
                </div>
                <button class="news-back-btn" onclick="document.getElementById('newsBackBtn').click()" style="margin-top: 20px; display: inline-flex;">Back to Dashboard</button>
            </div>
        `;
    }
}

/**
 * Creates the immersive chunk loading animation
 */
function startNewsLoading(lang) {
    const detailBody = document.getElementById("newsDetailBody");
    if (!detailBody) return;

    detailBody.innerHTML = `
        <div class="news-chunk-loading">
            <div class="news-status-text">CONNECTED_TO_MAYOR_NODE</div>
            <div class="news-loading-bar">
                <div class="chunk"></div>
                <div class="chunk"></div>
                <div class="chunk"></div>
                <div class="chunk"></div>
                <div class="chunk"></div>
                <div class="chunk"></div>
                <div class="chunk"></div>
                <div class="chunk"></div>
            </div>
            <div class="news-status-text" id="newsLoadingStep" style="font-size: 8px; opacity: 0.8;">RECOGNIZING LANGUAGE: ${lang.toUpperCase()}...</div>
        </div>
    `;

    const chunks = detailBody.querySelectorAll(".chunk");
    let activeIndex = 0;
    const steps = [
        `ESTABLISHING_NEURAL_LINK...`,
        `INJECTING_MAYOR_CONTEXT...`,
        `DECRYPTING_STREAM... [${lang.toUpperCase()}]`,
        `RECONSTRUCTING_DOM...`,
        `SYNCING_GAME_TERMINOLOGY...`,
        `FINALIZING_CONTENT...`
    ];
    let stepIndex = 0;

    newsLoadingInterval = setInterval(() => {
        chunks.forEach((c, i) => {
            c.classList.toggle("active", i === activeIndex);
        });
        activeIndex = (activeIndex + 1) % chunks.length;
        
        if (activeIndex === 0) {
            const stepEl = document.getElementById("newsLoadingStep");
            if (stepEl) {
                stepEl.textContent = steps[stepIndex % steps.length];
                stepIndex++;
            }
        }
    }, 150);
}

function stopNewsLoading() {
    if (newsLoadingInterval) {
        clearInterval(newsLoadingInterval);
        newsLoadingInterval = null;
    }
}

/**
 * Renders the article data into the detail body
 */
function renderArticleContent(data, isTranslated = false) {
    const detailBody = document.getElementById("newsDetailBody");
    if (!detailBody) return;

    detailBody.innerHTML = `
        <div class="news-detail-content reveal">
            <div class="news-header" style="margin-bottom: 20px; border-bottom: 2px solid rgba(94, 242, 214, 0.2); padding-bottom: 12px; ${isTranslated ? 'color: #ffab40;' : ''}">
               <div style="display: flex; justify-content: space-between; align-items: center;">
                 <span class="news-date" style="font-size: 14px; opacity: 0.7;">${isTranslated ? '🛰️ NEURAL_TRANS' : '📡 ORIGINAL_LINK'}</span>
                 <span class="news-date" style="font-size: 14px;">${data.date || ''}</span>
               </div>
            </div>
            <h1 style="color: #ffffff; font-family: 'Conthrax'; font-size: 22px; margin: 20px 0 30px 0; line-height: 1.3; text-shadow: 0 0 15px rgba(94, 242, 214, 0.3);">${data.title}</h1>
            <div class="article-text-content" style="font-size: 15px; line-height: 1.7;">
                ${data.content}
            </div>
            <div style="margin-top: 50px; padding: 20px; border: 1px dashed rgba(94, 242, 214, 0.2); text-align: center; opacity: 0.6; font-size: 10px; font-family: 'Ethnocentric';">
                ${isTranslated ? '=== END OF TRANSLATED STREAM ===' : '=== END OF ENCRYPTED DATASTREAM ==='}
            </div>
        </div>
    `;

    // Ensure all links in the content open in new tabs
    detailBody.querySelectorAll("a").forEach(a => a.target = "_blank");
}

/**
 * Handles the AI translation logic
 */
async function translateNewsDetail(lang, url) {
    const detailBody = document.getElementById("newsDetailBody");
    if (!detailBody || !currentOriginalNews) return;

    if (lang === "en") {
        renderArticleContent(currentOriginalNews);
        return;
    }

    const cacheKey = `${url}_${lang}`;
    if (newsTranslations[cacheKey]) {
        renderArticleContent(newsTranslations[cacheKey], true);
        return;
    }

    // Show Immersive Loading state
    startNewsLoading(lang);

    try {
        const systemPromptOverride = `You are a neural translation engine for LifeAfter (LA).
Task: Translate the article into language: ${lang}.
Format: You MUST separate the title and content using these exact markers:
===TITLE===
[Translated Title]
===CONTENT===
[Translated HTML Content]

Rules:
1. Preserve all HTML structure.
2. If truncated, ensure the most important information is translated first.
3. No JSON, no chatter, just the markers and content.`;

        const userContent = `TITLE: ${currentOriginalNews.title}\n\nCONTENT: ${currentOriginalNews.content}`;

        const resp = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: userContent }],
                systemOverride: systemPromptOverride
            })
        });

        if (!resp.ok) throw new Error("AI Node Failure: " + resp.status);
        const data = await resp.json();
        
        let aiContent = data.choices?.[0]?.message?.content || data.reply || "";
        
        // Robust Extraction using Markers
        let title = "";
        let content = "";
        
        if (aiContent.includes("===TITLE===") && aiContent.includes("===CONTENT===")) {
            const parts = aiContent.split("===CONTENT===");
            title = parts[0].replace("===TITLE===", "").trim();
            content = parts[1] || "";
        } else {
            // Fallback if markers are missing but content exists
            title = currentOriginalNews.title; // Keep original title
            content = aiContent; 
        }

        const translatedData = {
            title: title || currentOriginalNews.title,
            content: content || "Neural stream truncated prematurely.",
            date: currentOriginalNews.date
        };
        
        // Save to cache
        newsTranslations[cacheKey] = translatedData;
        
        stopNewsLoading();
        renderArticleContent(translatedData, true);

    } catch (err) {
        stopNewsLoading();
        console.error("Translation error:", err);
        detailBody.innerHTML = `
            <div class="news-loading-text" style="padding: 20px; text-align: center; color: var(--danger);">
                NEURAL LINK FAILED.
                <div style="font-size: 10px; margin-top: 10px; color: var(--muted); text-transform: none;">
                    ${err.message.includes('JSON_PARSE_ERROR') ? 'The AI node returned a malformed data stream. Try again.' : 'Unable to reach the Mayor AI node.'}
                </div>
                <button class="news-back-btn" onclick="document.getElementById('newsLangSelect').value='en'; renderArticleContent(currentOriginalNews);" style="margin-top: 20px;">Return to Original</button>
            </div>
        `;
    }
}
