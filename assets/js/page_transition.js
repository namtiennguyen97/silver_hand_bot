/**
 * PAGE TRANSITION ENGINE — Cyberpunk SPA Style
 * 
 * Strategy: sessionStorage flag + instant black cover on destination page
 * eliminates the white flash that happens during window.location.href navigation.
 *
 * Usage: PageTransition.go('drama.html')
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'pt_transitioning';

    /* -------------------------------------------------------
       STEP A — Destination page: read flag IMMEDIATELY
       (called as early as possible, even before DOM ready)
    ------------------------------------------------------- */
    function checkIncomingTransition() {
        const flag = sessionStorage.getItem(STORAGE_KEY);
        if (!flag) return false;

        // Remove flag
        sessionStorage.removeItem(STORAGE_KEY);

        // Inject a hard black cover synchronously so there is ZERO white flash
        const style = document.createElement('style');
        style.id = '_pt_cover_style';
        style.textContent = `
            #_pt_arrival_cover {
                position: fixed !important;
                inset: 0 !important;
                z-index: 9999999 !important;
                background: #080c10 !important;
                pointer-events: all !important;
                opacity: 1;
                transition: opacity 0.45s ease;
            }
            #_pt_arrival_cover.fade-out {
                opacity: 0;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);

        const cover = document.createElement('div');
        cover.id = '_pt_arrival_cover';
        // Inject at very start of body (or document.documentElement if body not ready)
        const parent = document.body || document.documentElement;
        parent.insertBefore(cover, parent.firstChild);

        return true;
    }

    /* -------------------------------------------------------
       Remove the arrival cover (call after page is ready)
    ------------------------------------------------------- */
    function releaseArrivalCover(delayMs) {
        const cover = document.getElementById('_pt_arrival_cover');
        if (!cover) return;
        setTimeout(() => {
            cover.classList.add('fade-out');
            setTimeout(() => {
                cover.remove();
                const style = document.getElementById('_pt_cover_style');
                if (style) style.remove();
            }, 500);
        }, delayMs || 0);
    }

    /* -------------------------------------------------------
       Build the exit-screen overlay (shown on DEPARTURE page)
    ------------------------------------------------------- */
    function buildOverlay() {
        if (document.getElementById('pageTransitionOverlay')) return;

        const el = document.createElement('div');
        el.id = 'pageTransitionOverlay';
        el.innerHTML = `
            <div class="pt-curtain"></div>
            <div class="pt-scanline"></div>
            <div class="pt-glitch" style="top:32%"></div>
            <div class="pt-glitch" style="top:67%"></div>
            <div class="pt-logo">
                <div class="pt-logo-text">SAO&nbsp;&nbsp;ĐÊM</div>
                <div class="pt-logo-sub">// SYSTEM TRANSIT NODE</div>
                <div class="pt-logo-bar" id="ptChunkBar">
                    ${Array.from({length: 8}, () => '<div class="pt-chunk"></div>').join('')}
                </div>
            </div>
        `;
        document.body.appendChild(el);
    }

    /* Animated chunk bar */
    let _chunkTimer = null;
    function startChunkAnim() {
        const chunks = document.querySelectorAll('#ptChunkBar .pt-chunk');
        if (!chunks.length) return;
        let i = 0;
        _chunkTimer = setInterval(() => {
            chunks.forEach((c, idx) => c.classList.toggle('lit', idx <= i));
            i = (i + 1) % chunks.length;
        }, 85);
    }
    function stopChunkAnim() {
        if (_chunkTimer) { clearInterval(_chunkTimer); _chunkTimer = null; }
        document.querySelectorAll('#ptChunkBar .pt-chunk').forEach(c => c.classList.add('lit'));
    }

    /* Animate scan line sweeping downward */
    function animateScanLine(overlay, durationMs) {
        const sl = overlay.querySelector('.pt-scanline');
        if (!sl) return;
        sl.style.top = '-3px';
        sl.style.opacity = '1';
        sl.style.transition = 'none';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                sl.style.transition = `top ${durationMs}ms linear`;
                sl.style.top = (window.innerHeight + 4) + 'px';
            });
        });
        setTimeout(() => { sl.style.opacity = '0'; }, durationMs);
    }

    /* Flash glitch strips */
    function flashGlitches(overlay) {
        const glitches = overlay.querySelectorAll('.pt-glitch');
        glitches.forEach((g, i) => {
            setTimeout(() => {
                g.style.transition = 'opacity 0.04s';
                g.style.opacity = '1';
                setTimeout(() => { g.style.opacity = '0'; }, 100 + Math.random() * 80);
            }, i * 70 + Math.random() * 60);
        });
    }

    /* -------------------------------------------------------
       Main departure navigate
    ------------------------------------------------------- */
    function go(url) {
        // Prevent double-trigger
        if (window._ptNavigating) return;
        window._ptNavigating = true;

        buildOverlay();
        const overlay = document.getElementById('pageTransitionOverlay');
        if (!overlay) {
            sessionStorage.setItem(STORAGE_KEY, '1');
            window.location.href = url;
            return;
        }

        // PHASE 1 — curtain sweeps IN (covers current page)
        overlay.style.pointerEvents = 'all';
        overlay.classList.remove('pt-hold', 'pt-sweep-out');
        overlay.classList.add('pt-sweep-in');
        animateScanLine(overlay, 430);

        // PHASE 2 — hold: show logo + loading bar + glitches
        setTimeout(() => {
            overlay.classList.add('pt-hold');
            startChunkAnim();
            flashGlitches(overlay);

            // PHASE 3 — set flag → navigate
            // The destination page reads this flag immediately and
            // shows its own black cover before any white flash can appear.
            setTimeout(() => {
                stopChunkAnim();
                sessionStorage.setItem(STORAGE_KEY, '1');
                window.location.href = url;
            }, 480);
        }, 430);
    }

    /* -------------------------------------------------------
       Public API
    ------------------------------------------------------- */
    window.PageTransition = {
        go,
        buildOverlay,
        releaseArrivalCover,
        /** Call this once the destination page's content is ready to show */
        onPageReady: function(delayMs) { releaseArrivalCover(delayMs); }
    };

    /* -------------------------------------------------------
       Auto-init: immediately check for incoming transition flag,
       then release the cover after page has loaded normally.
    ------------------------------------------------------- */
    const _isIncoming = checkIncomingTransition();

    if (_isIncoming) {
        // Wait for the page's own loading sequence to finish,
        // then release our black cover so the reveal is seamless.
        // We listen for the same 'app:loaded' event the rest of the app uses.
        const _releaseOnLoad = () => {
            // Give the page's own loading overlay a moment to take over
            releaseArrivalCover(120);
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.addEventListener('app:loaded', _releaseOnLoad, { once: true });
                // Fallback: if app:loaded never fires within 4s, release anyway
                setTimeout(_releaseOnLoad, 4000);
            });
        } else {
            window.addEventListener('app:loaded', _releaseOnLoad, { once: true });
            setTimeout(_releaseOnLoad, 4000);
        }
    }

    document.addEventListener('DOMContentLoaded', buildOverlay);
})();
