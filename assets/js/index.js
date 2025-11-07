document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;

    // --- PC: di chuyển theo chuột ---
    document.addEventListener("mousemove", (e) => {
        if (window.innerWidth > 980) { // chỉ áp dụng cho PC
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            const moveX = (x - 0.5) * 20; // biên độ 20px
            const moveY = (y - 0.5) * 20;
            body.style.backgroundPosition = `calc(50% + ${moveX}px) calc(50% + ${moveY}px)`;
        }
    });

    // --- Mobile: di chuyển theo cảm biến ---
    if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", (e) => {
            if (window.innerWidth <= 980) { // chỉ áp dụng cho điện thoại
                const beta = e.beta || 0;   // nghiêng trước/sau (-180 đến 180)
                const gamma = e.gamma || 0; // nghiêng trái/phải (-90 đến 90)
                const moveX = gamma * 0.5;  // tinh chỉnh độ nhạy
                const moveY = beta * 0.5;
                body.style.backgroundPosition = `calc(50% + ${moveX}px) calc(50% + ${moveY}px)`;
            }
        });
    }
});
