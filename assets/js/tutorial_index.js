document.addEventListener("DOMContentLoaded", () => {
    let activeElement = null;

    const steps = [
        {
            selector: null,
            text: "👋 Chào mừng bạn đến với <b>Life After VN- SAO-ĐÊM</b>.<br><br>Mình sẽ hướng dẫn bạn nhanh cách sử dụng nhé!"
        },
        {
            selector: "#control-panel",
            text: "💬 Đây là <b>khung thông tin</b> để bạn bấm vào xem thông tin nhé."
        },
        {
            selector: "#mayor-chat",
            text: "❓ Bạn có thể <b>giao tiếp với trợ lý AI Mayor</b> những câu hỏi cơ bản, không cần gõ tay."
        },
        {
            selector: "#clock",
            text: "⏰ Đây là <b>thời gian trong game LifeAfter</b> (Hope 101 time zone).<br><br>Đôi lúc bạn cần theo dõi để <b>tham gia các sự kiện ingame đúng giờ</b>."
        }
    ];

    let currentStep = 0;

    const overlay = document.getElementById("tutorial-overlay");
    const spotlight = document.getElementById("spotlight");
    const tooltip = document.getElementById("tooltip");
    const tooltipText = document.getElementById("tooltip-text");
    const nextBtn = document.getElementById("tutorial-next");

    function showStep(index) {
        const step = steps[index];

        // Gỡ highlight cũ
        if (activeElement) {
            activeElement.classList.remove("tutorial-active");
            activeElement = null;
        }

        tooltip.classList.remove("welcome");
        spotlight.style.display = "block";

        // Set nội dung trước để đo size chính xác
        tooltipText.innerHTML = step.text;

        // RESET vị trí tooltip
        tooltip.style.top = "auto";
        tooltip.style.left = "auto";
        tooltip.style.bottom = "auto";
        tooltip.style.transform = "none";

        if (!step.selector) {
            // ===== WELCOME STEP =====
            spotlight.style.display = "none";
            tooltip.classList.add("welcome");

            tooltip.style.top = "50%";
            tooltip.style.left = "50%";
            tooltip.style.transform = "translate(-50%, -50%)";
            return;
        }

        const el = document.querySelector(step.selector);
        if (!el) return;

        activeElement = el;
        el.classList.add("tutorial-active");

        const rect = el.getBoundingClientRect();

        // Spotlight
        spotlight.style.top = rect.top - 8 + "px";
        spotlight.style.left = rect.left - 8 + "px";
        spotlight.style.width = rect.width + 16 + "px";
        spotlight.style.height = rect.height + 16 + "px";

        // ⚠️ Đợi browser render tooltip xong rồi mới đo
        requestAnimationFrame(() => {
            const tooltipRect = tooltip.getBoundingClientRect();
            const padding = 16;

            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            // Mặc định: đặt dưới element
            let top = rect.bottom + padding;
            let left = rect.left;

            // ❗ Nếu tràn xuống dưới → đưa lên trên
            if (top + tooltipRect.height > viewportHeight) {
                top = rect.top - tooltipRect.height - padding;
            }

            // ❗ Nếu vẫn tràn (element quá cao – mobile)
            if (top < padding) {
                top = viewportHeight / 2 - tooltipRect.height / 2;
                left = viewportWidth / 2 - tooltipRect.width / 2;
            }

            // Chống tràn ngang
            if (left + tooltipRect.width > viewportWidth - padding) {
                left = viewportWidth - tooltipRect.width - padding;
            }
            if (left < padding) {
                left = padding;
            }

            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;
        });
    }

    function nextStep() {
        currentStep++;

        if (currentStep >= steps.length) {
            if (activeElement) {
                activeElement.classList.remove("tutorial-active");
            }

            overlay.style.display = "none";
            document.body.classList.remove("tutorial-lock");

            localStorage.setItem("sao-dem-main-tutorial-done", "1");
            return;
        }


        showStep(currentStep);
    }

    nextBtn.addEventListener("click", nextStep);

    overlay.addEventListener("click", (e) => {
        if (!tooltip.contains(e.target)) {
            nextStep();
        }
    });

    // 🚀 CHỈ START TUTORIAL SAU KHI LOADING XONG
    window.addEventListener("app:loaded", () => {
        if (localStorage.getItem("sao-dem-main-tutorial-done")) return;

        setTimeout(() => {
            overlay.style.display = "block";
            showStep(currentStep);
        }, 200);
    });


    const helpBtn = document.getElementById("tutorialHelpBtn");

    if (helpBtn) {
        helpBtn.addEventListener("click", () => {
            startTutorial();
        });
    }

    function startTutorial() {
        currentStep = 0;

        document.body.classList.add("tutorial-lock");

        if (activeElement) {
            activeElement.classList.remove("tutorial-active");
            activeElement = null;
        }

        overlay.style.display = "block";
        showStep(currentStep);
    }

});

