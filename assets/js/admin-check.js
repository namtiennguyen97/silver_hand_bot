(function() {
    function checkAuth() {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            // Hide the page content immediately to prevent flickering
            document.documentElement.style.display = 'none';
            window.location.replace('error.html?type=401');
            return false;
        }
        return true;
    }

    // Initial check
    if (checkAuth()) {
        // Ensure the page is visible if authorized
        document.documentElement.style.display = '';
    }

    // Handle back button / browser cache
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            checkAuth();
        }
    });

    // Check auth when switching back to the tab
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            checkAuth();
        }
    });
})();
