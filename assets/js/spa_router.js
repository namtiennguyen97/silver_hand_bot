/* ================================================================
   SPA ROUTER — Silver Hand Bot Mini-SPA Engine
   Handles seamless navigation between index.html ↔ campaign.html
   while keeping global BGM alive.
================================================================ */

(function () {
    'use strict';

    /* -------------------------------------------------------
       CONFIG: Which routes are SPA-managed vs. external
    ------------------------------------------------------- */
    const SPA_ROUTES = new Set(['index.html', 'campaign.html', './', '']);

    /* -------------------------------------------------------
       Page content cache: { url → { body, scripts } }
    ------------------------------------------------------- */
    const PAGE_CACHE = new Map();

    /* -------------------------------------------------------
       GLITCH OVERLAY helpers
    ------------------------------------------------------- */
    function getGlitchOverlay() {
        return document.getElementById('spa-glitch-overlay');
    }

    function glitchOut() {
        return new Promise(resolve => {
            const el = getGlitchOverlay();
            if (!el) return resolve();
            el.classList.remove('glitch-in', 'glitch-idle');
            el.classList.add('glitch-out');
            // Animation lasts ~500ms
            setTimeout(resolve, 500);
        });
    }

    function glitchIn() {
        return new Promise(resolve => {
            const el = getGlitchOverlay();
            if (!el) return resolve();
            el.classList.remove('glitch-out');
            el.classList.add('glitch-in');
            setTimeout(() => {
                el.classList.remove('glitch-in');
                el.classList.add('glitch-idle');
                resolve();
            }, 600);
        });
    }

    /* -------------------------------------------------------
       Scripts already loaded by shell — skip on re-injection
       to avoid duplicate execution / re-declaration errors
    ------------------------------------------------------- */
    const SHELL_SCRIPTS = new Set([
        'assets/js/loading.js',
        'assets/js/vn_engine.js',
        'assets/js/heartlock_zone_info.js',
        'assets/js/rpg_chat.js',
        'assets/js/index_main.js',
        'assets/js/auth_vn.js',
        'assets/js/spa_router.js',
    ]);

    /* -------------------------------------------------------
       Fetch & parse a page: returns { bodyHTML, scripts[] }
    ------------------------------------------------------- */
    async function fetchPage(url) {
        // Normalize URL
        const normalized = url.split('?')[0].split('#')[0];

        if (PAGE_CACHE.has(normalized)) {
            return PAGE_CACHE.get(normalized);
        }

        const resp = await fetch(url, { cache: 'no-cache' });
        if (!resp.ok) throw new Error(`SPA fetch failed: ${resp.status} ${url}`);
        const text = await resp.text();

        // Parse as HTML document
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        // Extract all <script> tags from body (src-based + inline)
        // Skip scripts already present in the shell to avoid re-execution
        const scriptDefs = [];
        doc.body.querySelectorAll('script').forEach(s => {
            if (s.src) {
                // Normalize src to relative path for comparison
                const srcRelative = s.getAttribute('src');
                if (!SHELL_SCRIPTS.has(srcRelative)) {
                    scriptDefs.push({ type: 'src', src: srcRelative });
                }
            } else if (s.textContent.trim()) {
                scriptDefs.push({ type: 'inline', code: s.textContent });
            }
            s.remove(); // Remove from DOM tree before injecting
        });

        // Extract body inner HTML (without scripts — already removed)
        const bodyHTML = doc.body.innerHTML;

        const result = { bodyHTML, scriptDefs };
        PAGE_CACHE.set(normalized, result);
        return result;
    }

    /* -------------------------------------------------------
       Execute a list of script definitions sequentially
    ------------------------------------------------------- */
    function executeScripts(scriptDefs) {
        return scriptDefs.reduce((promise, def) => {
            return promise.then(() => runScript(def));
        }, Promise.resolve());
    }

    function runScript(def) {
        return new Promise((resolve) => {
            const s = document.createElement('script');
            if (def.type === 'src') {
                s.src = def.src;
                s.onload = resolve;
                s.onerror = resolve; // Don't block on error
                document.body.appendChild(s);
            } else {
                s.textContent = def.code;
                document.body.appendChild(s);
                resolve();
            }
        });
    }

    /* -------------------------------------------------------
       Core navigate function
    ------------------------------------------------------- */
    async function navigate(url, pushState = true) {
        // Normalize: strip leading './' or '/'
        const normalized = url.replace(/^\.\//, '');

        // Check if this is an SPA route
        const isSPA = SPA_ROUTES.has(normalized) || SPA_ROUTES.has(normalized.replace(/.*\//, ''));
        if (!isSPA) {
            // External navigation — let browser handle it
            window.location.href = url;
            return;
        }

        const viewport = document.getElementById('spa-viewport');
        if (!viewport) {
            // Fallback: normal navigation
            window.location.href = url;
            return;
        }

        // Dispatch before-navigate event
        window.dispatchEvent(new CustomEvent('spa:before-navigate', { detail: { url } }));

        try {
            // 1. Glitch out animation + fetch in parallel
            const [pageData] = await Promise.all([
                fetchPage(normalized),
                glitchOut()
            ]);

            // 2. Replace viewport content
            viewport.innerHTML = pageData.bodyHTML;

            // 3. Update URL
            if (pushState) {
                history.pushState({ url: normalized }, '', normalized);
            }

            // 4. Execute page scripts
            await executeScripts(pageData.scriptDefs);

            // 5. If navigating back to index, reinit the HUD
            //    (index_main.js is a shell script and won't re-run,
            //     so we trigger reinit manually via event)
            if (normalized === 'index.html' || normalized === '' || normalized === './') {
                window.dispatchEvent(new CustomEvent('spa:index-restored'));
            }

            // 6. Glitch in
            await glitchIn();

            // 6. Dispatch after-navigate
            window.dispatchEvent(new CustomEvent('spa:after-navigate', { detail: { url: normalized } }));

            // 7. Scroll to top
            window.scrollTo(0, 0);

        } catch (err) {
            console.error('[SPA] Navigation failed:', err);
            // Fallback: hard navigate
            window.location.href = url;
        }
    }

    /* -------------------------------------------------------
       Intercept clicks on [data-spa-link] or <a> tags
    ------------------------------------------------------- */
    document.addEventListener('click', (e) => {
        // Priority 1: [data-spa-link] attribute on any element
        const spaLinkEl = e.target.closest('[data-spa-link]');
        if (spaLinkEl) {
            const href = spaLinkEl.getAttribute('data-spa-link');
            if (href) {
                e.preventDefault();
                navigate(href);
                return;
            }
        }

        // Priority 2: Standard <a> tags pointing to SPA routes
        const anchor = e.target.closest('a[href]');
        if (anchor) {
            const href = anchor.getAttribute('href');
            if (!href) return;
            // Skip external links, mailto, tel, anchors
            if (href.startsWith('http') || href.startsWith('//') ||
                href.startsWith('mailto') || href.startsWith('tel') ||
                href.startsWith('#')) return;

            const pageName = href.replace(/^\.\//, '').split('/').pop() || 'index.html';
            if (SPA_ROUTES.has(pageName) || SPA_ROUTES.has(href)) {
                e.preventDefault();
                navigate(href);
            }
        }
    });

    /* -------------------------------------------------------
       Handle browser back/forward
    ------------------------------------------------------- */
    window.addEventListener('popstate', (e) => {
        const url = (e.state && e.state.url) || 'index.html';
        navigate(url, false);
    });

    /* -------------------------------------------------------
       Init: push current page into history state
    ------------------------------------------------------- */
    (function init() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        history.replaceState({ url: currentPage }, '', window.location.href);
    })();

    /* -------------------------------------------------------
       Public API
    ------------------------------------------------------- */
    window.SPA = {
        navigate,
        addRoute: (url) => SPA_ROUTES.add(url),
        clearCache: () => PAGE_CACHE.clear(),
    };

    console.log('[SPA Router] Initialized. Routes:', [...SPA_ROUTES]);
})();
