/* assets/js/blog.js */

async function initBlogPage() {
    const blogGrid = document.getElementById('blogGrid');
    const searchInput = document.getElementById('blogSearch');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const detailOverlay = document.getElementById('blogDetailOverlay');
    const detailContent = document.getElementById('blogDetailContent');
    const closeDetail = document.getElementById('closeDetail');

    const paginationContainer = document.getElementById('blogPagination');

    let allPosts = [];
    let filteredPosts = [];
    let currentFilter = 'All';
    let currentSearch = '';
    
    // Pagination state
    const itemsPerPage = 6;
    let currentPage = 1;

    // Fetch Posts
    async function fetchPosts() {
        try {
            const response = await fetch('/api/blog?t=' + Date.now());
            if (!response.ok) throw new Error('Failed to fetch blog posts');
            allPosts = await response.json();
            applyFilters();
        } catch (err) {
            console.error('[BlogPage] Error:', err);
            blogGrid.innerHTML = `
                <div class="blog-empty">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <span>BROADCAST OFFLINE - SYSTEM ERROR</span>
                </div>
            `;
        }
    }

    // Filter Logic
    function applyFilters() {
        filteredPosts = allPosts.filter(post => {
            const matchesFilter = currentFilter === 'All' || post.category === currentFilter;
            const matchesSearch = post.title.toLowerCase().includes(currentSearch.toLowerCase()) || 
                                 post.description.toLowerCase().includes(currentSearch.toLowerCase());
            return matchesFilter && matchesSearch;
        });
        currentPage = 1; // Reset to first page when filtering
        renderPosts();
        renderPagination();
    }

    // Render Posts
    function renderPosts() {
        if (!blogGrid) return;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

        if (paginatedPosts.length === 0 && filteredPosts.length === 0) {
            blogGrid.innerHTML = `
                <div class="blog-empty">
                    <i class="fa-solid fa-ghost"></i>
                    <span>NO ARCHIVES FOUND FOR THIS QUERY</span>
                </div>
            `;
            paginationContainer.innerHTML = '';
            return;
        }

        blogGrid.innerHTML = paginatedPosts.map(post => {
            const views = post.views || 0;
            const plainText = (() => {
                const tmp = document.createElement('div');
                tmp.innerHTML = post.description || '';
                return (tmp.textContent || tmp.innerText || '').trim();
            })();
            const preview = plainText.length > 100 ? plainText.slice(0, 100).trimEnd() + '…' : plainText;
            return `
            <div class="blog-card" onclick="openPostDetail('${post.id}')">
                <div class="card-img-wrap">
                    <div class="card-tag">${post.category}</div>
                    <img src="${post.imageUrl || 'assets/img/drama/smirk.png'}" alt="${post.title}">
                </div>
                <div class="card-body">
                    <div class="card-title">${post.title}</div>
                    <div class="card-desc">${preview}</div>
                </div>
                <div class="card-footer">
                    <div class="card-date">// LOGGED: ${post.id.substring(0, 8)}</div>
                    <div class="card-meta-right">
                        <span class="card-views"><i class="fa-solid fa-eye"></i> ${views.toLocaleString()}</span>
                        <div class="card-btn">READ MORE <i class="fa-solid fa-arrow-right"></i></div>
                    </div>
                </div>
            </div>`;
        }).join('');

        // Scroll to top of grid when page changes
        if (currentPage > 1 || paginatedPosts.length > 0) {
            // blogGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Render Pagination
    function renderPagination() {
        if (!paginationContainer) return;

        const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `
                <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">
                    ${i}
                </button>
            `;
        }
        paginationContainer.innerHTML = html;
    }

    window.goToPage = (page) => {
        currentPage = page;
        renderPosts();
        renderPagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Track view — fire-and-forget, update local count optimistically
    async function trackView(id) {
        const post = allPosts.find(p => p.id === id);
        if (!post) return;
        // Optimistic update
        post.views = (post.views || 0) + 1;
        try {
            await fetch('/api/blog', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
        } catch (err) {
            // Silent fail — don't disrupt UX
            console.warn('[Blog] View track failed:', err);
        }
    }

    // Modal Controls
    window.openPostDetail = (id) => {
        const post = allPosts.find(p => p.id === id);
        if (!post) return;

        // Track view (non-blocking)
        trackView(id);

        detailContent.innerHTML = `
            <div class="detail-header">
                <div class="detail-tag">[ ${post.category.toUpperCase()} ]</div>
                <h1 class="detail-title">${post.title}</h1>
                <div class="detail-views"><i class="fa-solid fa-eye"></i> ${(post.views || 0).toLocaleString()} views</div>
            </div>
            ${post.imageUrl ? `<img src="${post.imageUrl}" class="detail-img" alt="${post.title}">` : ''}
            <div class="detail-content">${post.description}</div>
        `;

        detailOverlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Play SFX if available
        if (window.playSfx && window.clickAudio) window.playSfx(window.clickAudio);
    };

    if (closeDetail) {
        closeDetail.onclick = () => {
            detailOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
            if (window.playSfx && window.cancelAudio) window.playSfx(window.cancelAudio);
        };
    }

    // Search Logic
    if (searchInput) {
        searchInput.oninput = (e) => {
            currentSearch = e.target.value;
            applyFilters();
        };
    }

    // Filter Logic
    filterBtns.forEach(btn => {
        btn.onclick = () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.category;
            applyFilters();
        };
    });

    // Particle Background
    function initParticles() {
        const container = document.getElementById('blogParticles');
        if (!container) return;

        setInterval(() => {
            if (document.hidden) return;
            const p = document.createElement('div');
            p.className = `neon-particle ${Math.random() > 0.5 ? 'cyan' : 'pink'}`;
            const size = Math.random() * 4 + 2 + 'px';
            p.style.width = size;
            p.style.height = size;
            p.style.left = Math.random() * 100 + '%';
            p.style.bottom = '-10px';
            const duration = Math.random() * 10 + 5 + 's';
            p.style.animationDuration = duration;
            container.appendChild(p);
            setTimeout(() => p.remove(), parseFloat(duration) * 1000);
        }, 800);
    }

    // Initial Load
    initParticles();
    fetchPosts();
}

// Run on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlogPage);
} else {
    initBlogPage();
}
