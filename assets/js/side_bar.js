const toggleSidebarBtn = document.getElementById('toggleSidebar');
const mobileSidebar = document.getElementById('mobileSidebar');

// Mở / đóng sidebar
toggleSidebarBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // tránh click lan ra document
    mobileSidebar.classList.toggle('active');
});

// Khi click bất kỳ đâu ngoài sidebar → đóng sidebar
document.addEventListener('click', (e) => {
    if (mobileSidebar.classList.contains('active') && !mobileSidebar.contains(e.target) && e.target !== toggleSidebarBtn) {
        mobileSidebar.classList.remove('active');
    }
});