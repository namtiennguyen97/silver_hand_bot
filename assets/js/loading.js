/**
 * loading.js — Game-Style Loading Screen
 * - Random background (PC / Mobile detect)
 * - Smooth progress bar with % 
 * - Random rotating tips
 * - "PRESS ANY KEY TO CONTINUE" after page load
 */

(function () {
    // ── Config ──────────────────────────────────────────────
    const PC_BG_COUNT     = 7;
    const MOBILE_BG_COUNT = 7;
    const BG_BASE_PC      = 'assets/img/loading_bg/pc/';
    const BG_BASE_MOBILE  = 'assets/img/loading_bg/mobile/';

    // Minimum time before animation starts (ms) - just a tiny buffer for flicker
    const MIN_LOAD_MS = 0;

    const LOADING_TIPS = [
        "Nhớ tham gia Patrol hàng ngày lúc 19:00 để nhận điểm cống hiến cho camp.",
        "Kiểm tra cert phụ của bạn — một số skill combo có thể tăng damage tổng lên đến 30%.",
        "Resource Scramble (T.2 19:00–20:30): luôn ưu tiên vị trí hòm gần spawn của camp.",
        "Camp Invasion T.3 21:30 — Tất cả member có mặt sẽ nhận được bonus điểm ưu tiên.",
        "Kẻ đứng sau thường là kẻ sống sót — đừng bao giờ rush vào Boss Camp một mình.",
        "Cert chính mở toàn bộ skill tree. Cert phụ chỉ cho phép chọn một số skill cố định.",
        "Nhớ chia sẻ tọa độ Safe Zone với đồng đội trong các sự kiện lớn.",
        "Golden Knight là danh hiệu tối thiểu để được cân nhắc làm Official của camp.",
        "Shelter Land không chỉ là vinh quang — đó là minh chứng của sự đoàn kết toàn camp.",
        "Hãy kiểm tra bảng thông báo trong game mỗi ngày để không bỏ lỡ event giới hạn.",
        "CTC returner cần được xét duyệt kỹ — không phải ai rời camp cũng có thể quay về.",
        "Đừng chia sẻ passcode camp với người chưa được xác nhận danh tính.",
        "Mỗi quyết định APPROVE / REJECT trong Inspector đều ảnh hưởng đến Camp Stability.",
        "Sử dụng Scan Truth cẩn thận — bạn chỉ có 1 lượt mỗi phiên Inspector.",
        "Boss Camp (T.5 22:00): mang đủ supply, hộp máu dự phòng và đội hình tối thiểu 6 người.",
        "Lợi ích camp luôn được đặt lên hàng đầu — đó là giá trị cốt lõi của SAO-ĐÊM.",
        "Rival camps không phải lúc nào cũng là kẻ thù — ngoại giao đúng lúc có thể cứu cả server.",
        "Hãy giúp thành viên mới định hướng cert trong tuần đầu — retention rate quyết định sức mạnh camp.",
        "Chú ý kỹ ngôn ngữ và hành vi trong intel chat — gián điệp thường lộ qua cách nói chuyện.",
        "Diamond Knight là cột mốc quan trọng — mở khóa nhiều đặc quyền trong hệ thống camp.",
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
        tipInterval = setInterval(showNextTip, 4000);
    }

    // ── Show "Press any key" ──────────────────────────────────
    function showPressAny() {
        if (!pressAnyEl || promptShown) return;
        promptShown = true;

        if (statusEl) statusEl.textContent = 'SYSTEM READY';
        
        // Final pulse to ensure bar is full
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