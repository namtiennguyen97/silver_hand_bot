/**
 * Blog Slider for Index HUD
 * Fetches blog posts from /api/blog and displays them as an auto-playing slider.
 */

async function initBlogSlider() {
    const banner = document.getElementById('hudPromoBanner');
    if (!banner) return;

    try {
        const response = await fetch('/api/blog?t=' + Date.now());
        if (!response.ok) throw new Error('Failed to fetch blog posts');
        
        const allPosts = await response.json();
        
        // Filter only featured posts for the index slider
        // Check for true boolean OR "true" string to be safe
        const posts = (allPosts || []).filter(p => p.isFeatured === true || p.isFeatured === "true");

        // If no featured posts, hide the banner or show a placeholder
        if (posts.length === 0) {
            console.log('No featured blog posts found for slider.');
            banner.style.display = 'none';
            return;
        }

        // Create slider container
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';
        
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'slider-dots';

        posts.forEach((post, index) => {
            const item = document.createElement('div');
            item.className = `slider-item ${index === 0 ? 'active' : ''}`;
            item.innerHTML = `
                <div class="slider-tag">${post.category}</div>
                <img src="${post.imageUrl || 'assets/img/drama/smirk.png'}" class="slider-img" alt="${post.title}">
                <div class="slider-content">
                    <div class="slider-sub-label">// RECENT BROADCAST</div>
                    <div class="slider-title">${post.title}</div>
                </div>
            `;
            sliderContainer.appendChild(item);

            const dot = document.createElement('div');
            dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
            dot.onclick = (e) => {
                e.stopPropagation();
                goToSlide(index);
            };
            dotsContainer.appendChild(dot);
        });

        // Replace banner content
        banner.innerHTML = '';
        banner.appendChild(sliderContainer);
        banner.appendChild(dotsContainer);

        let currentIndex = 0;
        let slideInterval;
        const items = sliderContainer.querySelectorAll('.slider-item');
        const dots = dotsContainer.querySelectorAll('.slider-dot');

        function goToSlide(index) {
            items[currentIndex].classList.remove('active');
            dots[currentIndex].classList.remove('active');
            currentIndex = index;
            items[currentIndex].classList.add('active');
            dots[currentIndex].classList.add('active');
            resetInterval();
        }

        function nextSlide() {
            goToSlide((currentIndex + 1) % items.length);
        }

        function prevSlide() {
            goToSlide((currentIndex - 1 + items.length) % items.length);
        }

        function resetInterval() {
            if (slideInterval) clearInterval(slideInterval);
            if (posts.length > 1) {
                slideInterval = setInterval(nextSlide, 6000);
            }
        }

        // Drag / Swipe Logic
        let startX = 0;
        let isDragging = false;

        banner.addEventListener('mousedown', (e) => {
            startX = e.pageX;
            isDragging = true;
        });

        banner.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX;
            isDragging = true;
        }, { passive: true });

        const handleEnd = (endX) => {
            if (!isDragging) return;
            const diff = startX - endX;
            if (Math.abs(diff) > 50) { // threshold
                if (diff > 0) nextSlide();
                else prevSlide();
            }
            isDragging = false;
        };

        window.addEventListener('mouseup', (e) => {
            if (isDragging) handleEnd(e.pageX);
        });

        banner.addEventListener('touchend', (e) => {
            if (isDragging) handleEnd(e.changedTouches[0].pageX);
        }, { passive: true });

        resetInterval();

        // Click to open detailed modal (only if not a swipe)
        banner.style.cursor = 'grab';
        banner.addEventListener('click', (e) => {
            // Prevent modal if we were dragging
            if (Math.abs(startX - (e.pageX || startX)) > 10) return;
            
            const activeItem = banner.querySelector('.slider-item.active');
            const index = Array.from(banner.querySelectorAll('.slider-item')).indexOf(activeItem);
            const post = posts[index === -1 ? 0 : index];
            
            showPostDetail(post);
        });

    } catch (error) {
        console.error('[BlogSlider] Error:', error);
    }
}

function showPostDetail(post) {
    const modal = document.getElementById('infoModal');
    const title = document.getElementById('modalTitle');
    const content = document.getElementById('modalContent');
    
    if (!modal || !title || !content) return;

    title.innerText = post.title;
    content.innerHTML = `
        <div style="margin-bottom: 15px; border-bottom: 1px solid rgba(0,255,255,0.2); padding-bottom: 10px;">
            <span style="color: #ff0055; font-weight: bold; font-size: 10px; font-family: 'Orbitron';">[ ${post.category.toUpperCase()} ]</span>
        </div>
        ${post.imageUrl ? `<img src="${post.imageUrl}" style="width: 100%; border-radius: 4px; margin-bottom: 15px; border: 1px solid rgba(0,255,255,0.3);">` : ''}
        <div style="font-family: 'Inter', sans-serif; line-height: 1.8; color: #cff0f0;">${post.description}</div>
    `;

    if (window.toggleHUD) window.toggleHUD(false);
    modal.style.display = 'flex';
}

// Run on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlogSlider);
} else {
    initBlogSlider();
}
