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

let currentVideoKey = "main";
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

        ensurePlaying(nextVideo);

        try {
            const prevTime = prevVideo.currentTime || 0;
            const nextDuration = nextVideo.duration || 0;
            if (nextDuration > 0) {
                nextVideo.currentTime = prevTime % nextDuration;
            }
        } catch (e) {}

        if (targetKey === "alt") hideHotspots();

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
    news: { title: "LATEST NEWS", template: "tpl-news" },
    setting: { title: "SYSTEM SETTINGS", template: "tpl-setting" }
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
   GAMING HUD LOGIC
================================ */
function initGamingHUD() {
    const hudRoot = document.getElementById('hud-root');
    
    const toggleHUD = (visible) => {
        if (!hudRoot) return;
        if (visible) {
            hudRoot.classList.remove('hud-hidden');
        } else {
            hudRoot.classList.add('hud-hidden');
        }
    };
    window.toggleHUD = toggleHUD;

    const withEffect = (btn, action) => {
        if (!btn) return;
        btn.addEventListener('click', (e) => {
            btn.classList.add('selected-neon');
            setTimeout(() => {
                btn.classList.remove('selected-neon');
                toggleHUD(false);
                if (action) action(e);
            }, 500);
        });
    };

    const btnBattle = document.getElementById('hudBtnBattle');
    const btnMembers = document.getElementById('hudBtnMembers');
    const btnTasks = document.getElementById('hudBtnTasks');
    const btnRD = document.getElementById('hudBtnRD');
    const btnSetting = document.getElementById('hudBtnSetting');
    const btnProfile = document.getElementById('hudProfile');

    if (btnProfile) {
        btnProfile.addEventListener('click', () => {
            toggleHUD(false);
            openModalByKey("aboutMe");
            if (window.initAboutMeGallery) window.initAboutMeGallery(modalContent);
        });
    }

    withEffect(btnBattle, () => window.location.href = 'drama.html');
    withEffect(btnMembers, () => {
        if (window.startTutorial) window.startTutorial();
    });
    withEffect(btnTasks, () => openModalByKey("infoA"));
    withEffect(btnRD, () => window.location.href = 'ctc-planer.html');
    withEffect(btnSetting, () => {
        openModalByKey("setting");
        const bgmSlider = document.getElementById('bgmSlider');
        const sfxSlider = document.getElementById('sfxSlider');
        const bgmValue = document.getElementById('bgmValue');
        const sfxValue = document.getElementById('sfxValue');
        
        if (bgmSlider) {
            bgmSlider.value = window.bgmVolume !== undefined ? window.bgmVolume * 100 : 40;
            if (bgmValue) bgmValue.textContent = bgmSlider.value + "%";
            bgmSlider.oninput = (e) => {
                const v = parseInt(e.target.value);
                if (bgmValue) bgmValue.textContent = v + "%";
                window.bgmVolume = v / 100;
                localStorage.setItem('pgrBgmVolume', window.bgmVolume);
                const a = document.getElementById('bgmAudio');
                if (a) {
                    a.volume = window.bgmVolume;
                    if (v > 0 && a.paused) a.play().catch(()=>{});
                    else if (v === 0) a.pause();
                }
            };
        }
        
        if (sfxSlider) {
            sfxSlider.value = window.sfxVolume !== undefined ? window.sfxVolume * 100 : 60;
            if (sfxValue) sfxValue.textContent = sfxSlider.value + "%";
            sfxSlider.oninput = (e) => {
                const v = parseInt(e.target.value);
                if (sfxValue) sfxValue.textContent = v + "%";
                window.sfxVolume = v / 100;
                localStorage.setItem('pgrSfxVolume', window.sfxVolume);
            };
        }
    });

    const btnNotice = document.getElementById('hudBtnNotice');
    const btnMail = document.getElementById('hudBtnMail');
    const btnActivities = document.getElementById('hudBtnActivities');
    const btnGuide = document.getElementById('hudBtnGuide');

    withEffect(btnNotice, () => { openModalByKey("news"); fetchNews(); });
    withEffect(btnMail, () => showRPGChat("No new tactical messages in your decrypted inbox.", 'assets/img/mayor_5.png', 'Silver-Hand'));
    withEffect(btnActivities, () => openModalByKey("infoA"));
    withEffect(btnGuide, () => openModalByKey("infoB"));

    window.bgmVolume = parseFloat(localStorage.getItem('pgrBgmVolume') || '0.4');
    window.sfxVolume = parseFloat(localStorage.getItem('pgrSfxVolume') || '0.6');
    const bgmAudio = document.getElementById('bgmAudio');

    if (bgmAudio) {
        bgmAudio.volume = window.bgmVolume;
        const autoPlayOnInteract = () => {
            if (bgmAudio.paused && window.bgmVolume > 0) {
                bgmAudio.play().catch(e => console.log('Waiting for interaction'));
            }
            document.removeEventListener('click', autoPlayOnInteract);
        };
        document.addEventListener('click', autoPlayOnInteract);
    }

    const batteryVal = document.getElementById('hudBatteryVal');
    const batteryBar = document.getElementById('hudBatteryBar');

    if (navigator.getBattery) {
        navigator.getBattery().then(battery => {
            const updateBattery = () => {
                const level = Math.round(battery.level * 100);
                if (batteryVal) batteryVal.textContent = level + '%';
                if (batteryBar) batteryBar.style.width = level + '%';
                if (level <= 20) {
                    batteryBar.style.background = 'var(--hud-pink)';
                } else {
                    batteryBar.style.background = 'var(--hud-cyan)';
                }
            };
            updateBattery();
            battery.onlevelchange = updateBattery;
        });
    } else {
        if (batteryVal) batteryVal.textContent = '100%';
    }

    const hTimeTop = document.getElementById('hudTimeTop');
    const hTimeBottom = document.getElementById('hudTimeBottom');

    function updateHUDTime() {
        const now = new Date();
        const lH = String(now.getHours()).padStart(2, '0');
        const lM = String(now.getMinutes()).padStart(2, '0');
        const lS = String(now.getSeconds()).padStart(2, '0');
        if (hTimeTop) hTimeTop.textContent = `${lH}:${lM}:${lS}`;

        const hopeT = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Singapore',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        if (hTimeBottom) hTimeBottom.textContent = hopeT.format(now);
    }
    setInterval(updateHUDTime, 1000);
    updateHUDTime();
}

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
        
        // Initialize the new HUD
        initGamingHUD();

        setTimeout(() => {
            hudSync.classList.add('fade-out');
            setTimeout(() => {
                hudSync.remove();
            }, 500);
        }, 1200);
    });
});

window.addEventListener('resize', syncLayout);

document.addEventListener('click', (e) => {
    if (typeof suppressChatOutsideClose !== 'undefined' && suppressChatOutsideClose) return;
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

                const labelSpan = document.createElement('span');
                labelSpan.className = 'option-label';
                labelSpan.textContent = text;
                optionEl.appendChild(labelSpan);

                const displayIndex = (index + 1).toString().padStart(2, '0');
                optionEl.setAttribute('data-index', `[${displayIndex}]`);

                const scanLine = document.createElement('div');
                scanLine.className = 'option-scan-line';
                optionEl.appendChild(scanLine);

                const dots = document.createElement('div');
                dots.className = 'option-loading-dots';
                dots.innerHTML = '<span></span><span></span><span></span>';
                optionEl.appendChild(dots);

                const pulseRing = document.createElement('div');
                pulseRing.className = 'option-pulse-ring';
                optionEl.appendChild(pulseRing);

                optionEl.style.animation = `cyberReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards ${index * 0.08}s`;

                optionEl.addEventListener("click", (ev) => {
                    ev.stopPropagation();
                    if (navigator.vibrate) navigator.vibrate(40);
                    if (typeof hideRPGChat === 'function') hideRPGChat();
                    const allOptions = Array.from(cyberOverlay.querySelectorAll('.cyber-option'));

                    allOptions.forEach(opt => {
                        opt.style.animation = '';
                        opt.style.opacity = '1';
                        opt.style.transform = 'translateX(0)';
                        void opt.offsetWidth;

                        if (opt === optionEl) {
                            opt.classList.add('cyber-option--selected');
                        } else {
                            opt.classList.add('cyber-option--dismissed');
                        }
                    });

                    setTimeout(() => {
                        cyberOverlay.style.display = "none";
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

if (closeModal) {
    closeModal.onclick = (e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        modal.style.display = "none";
        if (window.toggleHUD) window.toggleHUD(true);
    };
}

if (modal) {
    const closeModalSafely = (e) => {
        if (e.target === modal) {
            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }
            modal.style.display = "none";
            if (window.toggleHUD) window.toggleHUD(true);
        }
    };
    modal.addEventListener("click", closeModalSafely);
    modal.addEventListener("touchend", closeModalSafely, { passive: false });
}

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
    countFrames();

    setTimeout(() => {
        isChecking = false;
        let elapsed = performance.now() - lastTime;
        let fps = (frameCount * 1000) / elapsed;

        if (fps < 40) {
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
            const headerEl = document.createElement("div");
            headerEl.className = "news-broadcast-header";
            headerEl.innerHTML = `
                <div class="news-live-tag">
                    <div class="news-live-dot"></div>
                    LIVE BROADCAST
                </div>
            `;
            container.appendChild(headerEl);

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
        container.innerHTML = `<div class="news-loading-text" style="color: var(--danger);">BROADCAST OFFLINE</div>`;
    }
}

let newsTranslations = {};
let currentOriginalNews = null;
let newsLoadingInterval = null;

async function loadNewsDetail(url) {
    const container = document.getElementById("newsContainer");
    const detailView = document.getElementById("newsDetail");
    const detailBody = document.getElementById("newsDetailBody");
    const backBtn = document.getElementById("newsBackBtn");
    const sourceLink = document.getElementById("newsSourceLink");
    const langWrapper = document.getElementById("newsLangWrapper");
    const langSelect = document.getElementById("newsLangSelect");

    if (!container || !detailView || !detailBody) return;

    if (langWrapper) langWrapper.style.display = "block";
    if (langSelect) {
        langSelect.value = "en";
        langSelect.onchange = (e) => translateNewsDetail(e.target.value, url);
    }

    container.classList.add("hidden");
    if (sourceLink) sourceLink.style.display = "none";
    detailView.style.display = "flex";
    detailBody.innerHTML = `<div class="news-loading"><div class="news-spinner"></div><div class="news-loading-text">DECRYPTING CONTENT...</div></div>`;

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
        currentOriginalNews = data;
        renderArticleContent(data);
    } catch (err) {
        console.error("Detail fetch error:", err);
        detailBody.innerHTML = `<div class="news-loading-text" style="color: var(--danger);">FAILED TO SYNC ARTICLE.</div>`;
    }
}

function startNewsLoading(lang) {
    const detailBody = document.getElementById("newsDetailBody");
    if (!detailBody) return;
    detailBody.innerHTML = `
        <div class="news-chunk-loading">
            <div class="news-status-text">CONNECTED_TO_MAYOR_NODE</div>
            <div class="news-loading-bar"><div class="chunk"></div><div class="chunk"></div><div class="chunk"></div><div class="chunk"></div><div class="chunk"></div><div class="chunk"></div><div class="chunk"></div><div class="chunk"></div></div>
            <div class="news-status-text" id="newsLoadingStep" style="font-size: 8px; opacity: 0.8;">RECOGNIZING LANGUAGE: ${lang.toUpperCase()}...</div>
        </div>
    `;
    const chunks = detailBody.querySelectorAll(".chunk");
    let activeIndex = 0;
    const steps = ["ESTABLISHING_NEURAL_LINK...", "INJECTING_MAYOR_CONTEXT...", "DECRYPTING_STREAM...", "RECONSTRUCTING_DOM...", "SYNCING_GAME_TERMINOLOGY...", "FINALIZING_CONTENT..."];
    let stepIndex = 0;
    newsLoadingInterval = setInterval(() => {
        chunks.forEach((c, i) => c.classList.toggle("active", i === activeIndex));
        activeIndex = (activeIndex + 1) % chunks.length;
        if (activeIndex === 0) {
            const stepEl = document.getElementById("newsLoadingStep");
            if (stepEl) stepEl.textContent = steps[stepIndex % steps.length];
            stepIndex++;
        }
    }, 150);
}

function stopNewsLoading() {
    if (newsLoadingInterval) { clearInterval(newsLoadingInterval); newsLoadingInterval = null; }
}

function renderArticleContent(data, isTranslated = false) {
    const detailBody = document.getElementById("newsDetailBody");
    if (!detailBody) return;
    detailBody.innerHTML = `
        <div class="news-detail-content reveal">
            <div class="news-header">
               <div style="display: flex; justify-content: space-between; align-items: center;">
                 <span class="news-date">${isTranslated ? '🛰️ NEURAL_TRANS' : '📡 ORIGINAL_LINK'}</span>
                 <span class="news-date">${data.date || ''}</span>
               </div>
            </div>
            <h1>${data.title}</h1>
            <div class="article-text-content">${data.content}</div>
        </div>
    `;
    detailBody.querySelectorAll("a").forEach(a => a.target = "_blank");
}

async function translateNewsDetail(lang, url) {
    const detailBody = document.getElementById("newsDetailBody");
    if (!detailBody || !currentOriginalNews) return;
    if (lang === "en") { renderArticleContent(currentOriginalNews); return; }
    const cacheKey = `${url}_${lang}`;
    if (newsTranslations[cacheKey]) { renderArticleContent(newsTranslations[cacheKey], true); return; }
    startNewsLoading(lang);
    try {
        const systemPromptOverride = `You are a neural translation engine. Translate to ${lang}. Preserve HTML. Use markers ===TITLE=== and ===CONTENT===.`;
        const userContent = `TITLE: ${currentOriginalNews.title}\n\nCONTENT: ${currentOriginalNews.content}`;
        const resp = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: userContent }], systemOverride: systemPromptOverride }) });
        const data = await resp.json();
        let aiContent = data.choices?.[0]?.message?.content || data.reply || "";
        let title = "", content = "";
        if (aiContent.includes("===TITLE===") && aiContent.includes("===CONTENT===")) {
            const parts = aiContent.split("===CONTENT===");
            title = parts[0].replace("===TITLE===", "").trim();
            content = parts[1] || "";
        } else { title = currentOriginalNews.title; content = aiContent; }
        const translatedData = { title: title || currentOriginalNews.title, content: content || "Neural stream truncated.", date: currentOriginalNews.date };
        newsTranslations[cacheKey] = translatedData;
        stopNewsLoading();
        renderArticleContent(translatedData, true);
    } catch (err) {
        stopNewsLoading();
        detailBody.innerHTML = `<div class="news-loading-text">NEURAL LINK FAILED.</div>`;
    }
}

const clickAudio = new Audio('assets/sounds/nierMail.mp3');
clickAudio.volume = 0.6;
document.addEventListener('click', (e) => {
    const isClickable = e.target.closest('button, a, .hud-action-btn, .hud-util-btn, .hud-promo-banner, .cyber-option, .hotspot, .close-btn, #faqBtn, .faq-btn, .ai-info-btn, .rpg-next-indicator');
    if (isClickable) {
        const soundClone = clickAudio.cloneNode();
        soundClone.volume = window.sfxVolume !== undefined ? window.sfxVolume : 0.6;
        if (soundClone.volume > 0) soundClone.play().catch(()=>{});
    }
});
