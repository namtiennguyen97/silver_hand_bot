/**
 * loading.js — Game-Style Loading Screen
 * - Random background (PC / Mobile detect)
 * - Smooth progress bar with % 
 * - Random rotating tips
 * - "PRESS ANY KEY TO CONTINUE" after page load
 */

(function () {
    // ── Config ──────────────────────────────────────────────
    const PC_BG_COUNT     = 10;
    const MOBILE_BG_COUNT = 10;
    const BG_BASE_PC      = 'assets/img/loading_bg/pc/';
    const BG_BASE_MOBILE  = 'assets/img/loading_bg/mobile/';

    // Minimum time before animation starts (ms) - just a tiny buffer for flicker
    const MIN_LOAD_MS = 0;

    const LOADING_TIPS = [
        "Nhớ tham gia Patrol hàng ngày lúc 19:00 để nhận điểm cống hiến cho camp.",
        "Resource Scramble (T.2): Hãy luôn check map để ý hòm vàng, và KHÔNG được buộc hòm vàng.",
        "Camp Invasion T.3 21:30 — Hãy lưu ý nhặt air drop ở phase 2 để kill boss nhanh nhất có thể.",
        "Bạn có thể dùng xe cộ để húc lùi boss trong camp invasion câu thêm giờ.",
        "Resource Scramble- Khi bạn bị hất khỏi xe, hãy spam nút leo lại xe.",
        "Bạn có thể sử dụng chức năng dịch thuật bằng AI ở mục New thông tin",
        "Shelter Land không chỉ là vinh quang — đó là minh chứng của sự đoàn kết toàn camp.",
        "Nếu bạn muốn biết lịch event camp ingame hôm nay: Chọn schedule-> Weekly -> Camp affair.",
        "CTC returner cần được xét duyệt kỹ — không phải ai rời camp cũng có thể quay về.",
        "Không được chia sẻ code của tài khoản ingame cho người lạ- Họ có thể chiếm đoạt tài khoản.",
        "Mini-game: Mỗi quyết định APPROVE / REJECT trong Inspector đều ảnh hưởng đến Camp Stability.",
        "Mini-game: Sử dụng Scan Truth cẩn thận — bạn chỉ có 1 lượt mỗi phiên Inspector.",
        "Boss Camp (T.5 22:00): Ở phase 1- Hãy def tại cổng manor mà zombie target- không phải nơi spawn.",
        "Lợi ích camp luôn được đặt lên hàng đầu — đó là giá trị cốt lõi của SAO-ĐÊM.",
        "Rival camps không phải lúc nào cũng là kẻ thù- Mọi thứ vẫn có thể thay đổi.",
        "Điều mayor ghét nhất đó là bị hiểu lầm là một kẻ tự cao tự đại.",
        "Camp Sao Đêm có lúc thăng lúc trầm. Nhưng cũng có những thành công nhất định.",
        "Những người đóng góp lớn nhất và là trụ cột của camp: Chychy và DL.",
    ];

    // ── State ────────────────────────────────────────────────
    let loadingPercent  = 0;
    let loadingTarget   = 0;
    let tipIndex        = Math.floor(Math.random() * LOADING_TIPS.length);
    let tipInterval     = null;
    let rafId           = null;
    let readyToGo       = false; 
    let promptShown     = false;

    // ── DOM refs ─────────────────────────────────────────────
    const overlay    = document.getElementById('loadingOverlay');
    if (!overlay) return;

    const barFill    = overlay.querySelector('#loadingBarFill');
    const pctEl      = overlay.querySelector('#loadingPercentage');
    const statusEl   = overlay.querySelector('#loadingStatus');
    const tipTextEl  = overlay.querySelector('#loadingTipText');
    const bgLayer    = overlay.querySelector('.loading-bg-layer');
    const pressAnyEl = overlay.querySelector('#loadingPressAny');

    // ── Detect Mobile ────────────────────────────────────────
    const isMobile = window.matchMedia('(max-width: 768px)').matches
                  || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // ── Choose random background ─────────────────────────────
    function pickBackground() {
        if (!bgLayer) return;
        const count = isMobile ? MOBILE_BG_COUNT : PC_BG_COUNT;
        const base  = isMobile ? BG_BASE_MOBILE  : BG_BASE_PC;
        const idx   = Math.floor(Math.random() * count) + 1;
        const url   = `${base}bg_${idx}.png`;
        const img   = new Image();
        img.onload  = () => {
            bgLayer.style.backgroundImage = `url('${url}')`;
            requestAnimationFrame(() => bgLayer.classList.add('bg-loaded'));
        };
        img.src = url;
    }

    // ── Status text ──────────────────────────────────────────
    function getStatusText(p) {
        if (p < 15)  return 'INITIALIZING CORE...';
        if (p < 30)  return 'LOADING ASSETS...';
        if (p < 55)  return 'LOADING MODELS...';
        if (p < 78)  return 'SYNCHRONIZING DATA...';
        if (p < 100) return 'FINALIZING...';
        return 'SYSTEM READY';
    }

    function renderProgress(p) {
        if (barFill)  barFill.style.width  = p + '%';
        if (pctEl)    pctEl.textContent    = p + '%';
        if (statusEl) statusEl.textContent = getStatusText(p);
    }

    // ── Animate progress ─────────────────────────────────────
    function tickLoading() {
        if (loadingPercent < loadingTarget) {
            const gap  = loadingTarget - loadingPercent;
            // Faster steps: 0.1 minimum, but 8% of the gap per frame (very responsive)
            const step = Math.max(0.1, gap * 0.08); 
            loadingPercent = Math.min(loadingTarget, loadingPercent + step);
            renderProgress(Math.floor(loadingPercent));
        }

        // Trigger prompt strictly when reached 100%
        if (loadingPercent >= 100 && !promptShown) {
            showPressAny();
        }

        rafId = requestAnimationFrame(tickLoading);
    }

    // ── Tips rotation ────────────────────────────────────────
    function showNextTip() {
        if (!tipTextEl) return;
        tipTextEl.classList.add('fading');
        setTimeout(() => {
            tipIndex = (tipIndex + 1) % LOADING_TIPS.length;
            tipTextEl.textContent = LOADING_TIPS[tipIndex];
            tipTextEl.classList.remove('fading');
        }, 400);
    }

    function startTips() {
        if (!tipTextEl) return;
        tipTextEl.textContent = LOADING_TIPS[tipIndex];
        tipInterval = setInterval(showNextTip, 6000);
    }

    // ── Show "Press any key" ──────────────────────────────────
    function showPressAny() {
        if (!pressAnyEl || promptShown) return;
        promptShown = true;

        // Add state for CSS transitions (hides bar row)
        overlay.classList.add('loading-complete');

        // Move "Press any key" text into the HUD panel for visual replacement
        const hudPanel = overlay.querySelector('.loading-hud-panel');
        const tipRow   = overlay.querySelector('.loading-tip-row');
        if (hudPanel && tipRow) {
            hudPanel.insertBefore(pressAnyEl, tipRow);
        } else if (hudPanel) {
            hudPanel.appendChild(pressAnyEl);
        }

        if (statusEl) statusEl.textContent = 'SYSTEM READY';
        
        // Change the main "LOADING..." label to "READY..."
        const labelEl = overlay.querySelector('.loading-label-text');
        if (labelEl) labelEl.textContent = 'READY...';
        
        // Ensure progress is at max state
        renderProgress(100);

        // Small delay for visual impact
        setTimeout(() => {
            pressAnyEl.classList.add('visible');

            // Attach listeners
            const dismiss = (e) => {
                if (!readyToGo) return;
                readyToGo = false;

                // Remove listeners
                document.removeEventListener('keydown',     dismiss);
                document.removeEventListener('pointerdown',  dismiss);

                pressAnyEl.classList.remove('visible');
                pressAnyEl.classList.add('clicked');

                clearInterval(tipInterval);
                cancelAnimationFrame(rafId);

                // Fade out
                setTimeout(() => {
                    document.body.classList.add('finished');
                    window.dispatchEvent(new Event('app:loaded'));
                }, 350);
            };

            readyToGo = true;
            document.addEventListener('keydown',     dismiss);
            document.addEventListener('pointerdown',  dismiss);
        }, 200);
    }

    // ── Boot ─────────────────────────────────────────────────
    pickBackground();
    startTips();
    renderProgress(0);
    tickLoading();

    // Progress milestones (Authentic)
    document.addEventListener('DOMContentLoaded', () => {
        if (loadingTarget < 40) loadingTarget = 40;
    });

    document.addEventListener('readystatechange', () => {
        if (document.readyState === 'interactive' && loadingTarget < 75) {
            loadingTarget = 75;
        }
    });

    window.addEventListener('load', () => {
        loadingTarget = 100;
    });

    // Fallback security - if something hangs, reach 100 anyway after 6s
    setTimeout(() => {
        loadingTarget = 100;
    }, 6000);

})();