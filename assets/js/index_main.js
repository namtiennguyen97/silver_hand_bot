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
const chatOverlay = document.getElementById('rpgChatOverlay');
const rpgChatContent = document.getElementById('rpgChatContent');

let video = videoMain;

window.bgMode = localStorage.getItem('pgrBgMode') || '3D';
window.setBgMode = function(mode) {
    window.bgMode = mode;
    localStorage.setItem('pgrBgMode', mode);
    const v = document.getElementById('videoMain');
    const img = document.getElementById('imageMain');
    
    if (mode === '2D') {
        if (v) {
            v.pause();
            v.style.display = 'none';
        }
        if (img) img.style.display = 'block';
    } else {
        if (v) {
            v.style.display = 'block';
            v.play().catch(()=>{});
        }
        if (img) img.style.display = 'none';
    }
};

/* ===============================
   VIDEO LAYOUT (OPTIMIZED)
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

        left = (screenCenter - contentCenterX);
        top  = (vh - renderH) / 2;
    } else {
        const scaleByH = vh / VIDEO_H;
        renderH = VIDEO_H * scaleByH;
        renderW = VIDEO_W * scaleByH;

        left = (vw - renderW) / 2;
        top  = 0;
    }

    if (videoMain) {
        // Use translate3d for better performance (GPU acceleration)
        videoMain.style.width  = renderW + 'px';
        videoMain.style.height = renderH + 'px';
        videoMain.style.transform = `translate3d(${left}px, ${top}px, 0)`;
        // Reset top/left in case they were set
        videoMain.style.top = '0';
        videoMain.style.left = '0';
    }

    const hudRoot = document.getElementById('hud-root');
    if (hudRoot) {
        if (isMobile) {
            hudRoot.style.width = '100%';
            hudRoot.style.left = '0';
            hudRoot.style.transform = 'none';
            hudRoot.style.margin = '0';
        } else {
            // On desktop, we want the HUD to follow the "content" area which is centered
            // We use the same scaling logic as mobile to determine the "active" HUD width
            const scaleByH = vh / VIDEO_H;
            const hudWidth = CONTENT_W * scaleByH;
            
            hudRoot.style.width = hudWidth + 'px';
            hudRoot.style.height = '100%';
            hudRoot.style.top = '0';
            hudRoot.style.bottom = '0';
            hudRoot.style.left = '50%';
            hudRoot.style.transform = 'translateX(-50%)';
        }
    }
}

// Debounce function to limit layout calls
function debounce(fn, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), ms);
    };
}

const syncLayout = debounce(layoutVideo, 100);

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
    
    // Performance optimization: pause video when opening modal
    if (videoMain && window.bgMode !== '2D') {
        videoMain.pause();
    }
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
    "Settings": () => showRPGChat("Configuration module is currently locked.", 'assets/img/mayor_5.png')
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
                // Wait for HUD transition (0.4s) to complete before showing content
                setTimeout(() => {
                    if (action) action(e);
                }, 400);
            }, 500);
        });
    };

    const btnBattle = document.getElementById('hudBtnBattle');
    const btnNews = document.getElementById('hudBtnMembers'); // Re-named "News" in HTML
    const btnTasks = document.getElementById('hudBtnTasks');
    const btnRD = document.getElementById('hudBtnRD');
    const btnSetting = document.getElementById('hudBtnSetting');
    const btnProfile = document.getElementById('hudProfile');

    if (btnProfile) {
        btnProfile.addEventListener('click', () => {
            toggleHUD(false);
            setTimeout(() => {
                openModalByKey("aboutMe");
                if (window.initAboutMeGallery) window.initAboutMeGallery(modalContent);
            }, 400); // Wait for HUD transition
        });
    }

    withEffect(btnBattle, () => window.PageTransition ? window.PageTransition.go('drama.html') : (window.location.href = 'drama.html'));
    withEffect(btnNews, () => {
        openModalByKey("news");
        fetchNews();
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
        
        const btnMode3D = document.getElementById('btnMode3D');
        const btnMode2D = document.getElementById('btnMode2D');
        
        if (btnMode3D && btnMode2D) {
            const updateBgModeUI = () => {
                if (window.bgMode === '2D') {
                    btnMode2D.style.background = 'var(--hud-cyan, #00ffff)';
                    btnMode2D.style.color = '#000';
                    btnMode3D.style.background = 'transparent';
                    btnMode3D.style.color = 'var(--hud-cyan, #00ffff)';
                } else {
                    btnMode3D.style.background = 'var(--hud-cyan, #00ffff)';
                    btnMode3D.style.color = '#000';
                    btnMode2D.style.background = 'transparent';
                    btnMode2D.style.color = 'var(--hud-cyan, #00ffff)';
                }
            };
            updateBgModeUI();
            btnMode3D.onclick = () => { window.setBgMode('3D'); updateBgModeUI(); };
            btnMode2D.onclick = () => { window.setBgMode('2D'); updateBgModeUI(); };
        }

        const btnManageAccount = document.getElementById('btnManageAccount');
        if (btnManageAccount) {
            btnManageAccount.onclick = () => {
                closeModalFunc();
                if (window.openAuthRegistration) window.openAuthRegistration();
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

    const hTimeBottom = document.getElementById('hudTimeBottom');

    function updateHUDTime() {
        const now = new Date();
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
    window.setBgMode(window.bgMode);
    syncLayout();
    
    // HUD SYNC EFFECT
    window.addEventListener('app:loaded', () => {
        const hudSync = document.createElement('div');
        hudSync.id = 'hud-sync-overlay';
        hudSync.innerHTML = `
            <div class="hud-sync-text">HUD SYNCHRONIZING...</div>
            <div class="hud-scan-line"></div>
        `;
        document.body.appendChild(hudSync);
        
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

    if (chatOverlay && chatOverlay.style.display === 'block' && !chatOverlay.contains(e.target)) {
        hideRPGChat();
        if (window.playSfx && window.cancelAudio) window.playSfx(window.cancelAudio);
    }
});

if (chatOverlay) chatOverlay.addEventListener('click', (e) => e.stopPropagation());

/* Modal close logic */
if (closeModal) {
    closeModal.onclick = (e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        modal.style.display = "none";
        if (window.toggleHUD) window.toggleHUD(true);
        if (window.playSfx && window.cancelAudio) window.playSfx(window.cancelAudio);
        
        // Performance optimization: resume video when closing modal
        if (videoMain && window.bgMode !== '2D') {
            videoMain.play().catch(()=>{});
        }
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
            window.playSfx(window.cancelAudio);
            
            // Performance optimization: resume video when closing modal
            if (videoMain && window.bgMode !== '2D') {
                videoMain.play().catch(()=>{});
            }
        }
    };
    modal.addEventListener("click", closeModalSafely);
    modal.addEventListener("touchend", closeModalSafely, { passive: false });
}

document.addEventListener("contextmenu", (e) => e.preventDefault());
document.addEventListener("touchstart", (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
document.addEventListener("gesturestart", (e) => e.preventDefault());

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
        if (e.target === gallery) {
            gallery.style.display = "none";
            window.playSfx(window.cancelAudio);
        }
    });
};

/* NEWS SYSTEM */
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
            headerEl.innerHTML = `<div class="news-live-tag"><div class="news-live-dot"></div>LIVE BROADCAST</div>`;
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
            tickerWrap.innerHTML = `<div class="news-ticker-label">TICKER</div><div class="news-ticker-content">${tickerItems} ${tickerItems}</div>`;
            container.appendChild(tickerWrap);

        } else { container.innerHTML = `<div class="news-loading-text">NO BROADCAST DATA FOUND.</div>`; }
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
    const langWrapper = document.getElementById("newsLangWrapper");
    const langSelect = document.getElementById("newsLangSelect");

    if (!container || !detailView || !detailBody) return;

    if (langWrapper) langWrapper.style.display = "block";
    if (langSelect) {
        langSelect.value = "en";
        langSelect.onchange = (e) => translateNewsDetail(e.target.value, url);
    }

    container.classList.add("hidden");
    detailView.style.display = "flex";
    detailBody.innerHTML = `<div class="news-loading"><div class="news-spinner"></div><div class="news-loading-text">DECRYPTING CONTENT...</div></div>`;

    backBtn.onclick = () => {
        detailView.style.display = "none";
        container.classList.remove("hidden");
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
            <div class="news-status-text">CONNECTED TO MAYOR NODE</div>
            <div class="news-loading-bar"><div class="chunk"></div><div class="chunk"></div><div class="chunk"></div><div class="chunk"></div><div class="chunk"></div><div class="chunk"></div><div class="chunk"></div><div class="chunk"></div></div>
            <div class="news-status-text" id="newsLoadingStep" style="font-size: 8px; opacity: 0.8;">RECOGNIZING LANGUAGE: ${lang.toUpperCase()}...</div>
        </div>
    `;
    const chunks = detailBody.querySelectorAll(".chunk");
    let activeIndex = 0;
    const steps = ["ESTABLISHING NEURAL LINK...", "INJECTING MAYOR CONTEXT...", "DECRYPTING STREAM...", "RECONSTRUCTING DOM...", "SYNCING GAME TERMINOLOGY...", "FINALIZING CONTENT..."];
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

function stopNewsLoading() { if (newsLoadingInterval) { clearInterval(newsLoadingInterval); newsLoadingInterval = null; } }

function renderArticleContent(data, isTranslated = false) {
    const detailBody = document.getElementById("newsDetailBody");
    if (!detailBody) return;
    detailBody.innerHTML = `
        <div class="news-detail-content reveal">
            <div class="news-header"><div style="display: flex; justify-content: space-between; align-items: center;"><span class="news-date">${isTranslated ? '🛰️ NEURAL TRANS' : '📡 ORIGINAL LINK'}</span><span class="news-date">${data.date || ''}</span></div></div>
            <h1>${data.title}</h1><div class="article-text-content">${data.content}</div>
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
    } catch (err) { stopNewsLoading(); detailBody.innerHTML = `<div class="news-loading-text">NEURAL LINK FAILED.</div>`; }
}

const clickAudio = new Audio('assets/sounds/nierMail.mp3');
window.cancelAudio = new Audio('assets/sounds/nierMenu.wav');

window.playSfx = function(audio) {
    if (!audio) return;
    const soundClone = audio.cloneNode();
    soundClone.volume = window.sfxVolume !== undefined ? window.sfxVolume : 0.6;
    if (soundClone.volume > 0) soundClone.play().catch(()=>{});
}

document.addEventListener('click', (e) => {
    const cancelTarget = e.target.closest('.close-btn, #closeGallery, .news-back-btn, .gallery-close');
    const clickTarget = e.target.closest('button, a, .hud-action-btn, .hud-util-btn, .hud-promo-banner, .cyber-option, .hotspot, #faqBtn, .faq-btn, .ai-info-btn, .rpg-next-indicator');

    if (cancelTarget) {
        window.playSfx(window.cancelAudio);
    } else if (clickTarget) {
        window.playSfx(clickAudio);
    }
});
