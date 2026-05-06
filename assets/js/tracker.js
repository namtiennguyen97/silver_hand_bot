/**
 * SITE TRACKER - SILVERHAND
 * Automatically records page visits to Supabase
 */
(function() {
    async function trackVisit() {
        try {
            // Get current path, cleaning up common variations
            let path = window.location.pathname;
            if (path === '/' || path === '') path = '/index.html';
            
            // Fire and forget
            fetch('/api/stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: path })
            }).catch(() => {}); // Silent fail
            
        } catch (e) {
            // Silently ignore tracking errors to not disrupt user experience
        }
    }

    // Run on load
    if (document.readyState === 'complete') {
        trackVisit();
    } else {
        window.addEventListener('load', trackVisit);
    }
})();
