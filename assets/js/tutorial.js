document.addEventListener("DOMContentLoaded", () => {
    let activeElement = null;

    const steps = [
        {
            selector: null,
            text: "👋 Chào mừng bạn đến với <b>Silver-Hand Chatbot – SAO-ĐÊM</b>.<br><br>Mình sẽ hướng dẫn bạn nhanh cách sử dụng nhé!"
        },
        {
            selector: ".chat-area",
            text: "💬 Đây là <b>khung chat</b> để bạn giao tiếp trực tiếp với <b>Mayor AI</b>."
        },
        {
            selector: "#faqBtn",
            text: "❓ Bạn có thể <b>click hỏi nhanh</b> những câu hỏi cơ bản, không cần gõ tay."
        },
        {
            selector: "#clock",
            text: "⏰ Đây là <b>thời gian trong game LifeAfter</b> (Hope 101 time zone).<br><br>Đôi lúc bạn cần theo dõi để <b>tham gia các sự kiện ingame đúng giờ</b>."
        },
        {
            selector: "#newConv",
            text: "➕ Bấm vào đây để <b>tạo một hội thoại mới</b>."
        },
        {
            selector: "#homeBtn",
            text: "🏠 Bấm vào đây để <b>quay về màn hình chính</b>."
        }
    ];

    let currentStep = 0;

    const overlay = document.getElementById("tutorial-overlay");
    const spotlight = document.getElementById("spotlight");
    function showStep(index) {
        const step = steps[index];

        // Gỡ highlight cũ
        if (activeElement) {
            activeElement.classList.remove("tutorial-active");
            activeElement = null;
        }

        spotlight.style.display = "block";

        if (!step.selector) {
            // ===== WELCOME STEP =====
            spotlight.style.display = "none";
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
    }

    function nextStep() {
        currentStep++;

        if (currentStep >= steps.length) {
            if (activeElement) {
                activeElement.classList.remove("tutorial-active");
            }

            overlay.style.display = "none";
            document.body.classList.remove("tutorial-lock");

            localStorage.setItem("sao-dem-tutorial-done", "1");
            return;
        }

        showStep(currentStep);
    }

    overlay.addEventListener("click", (e) => {
        nextStep();
    });

    // 🚀 CHỈ START TUTORIAL SAU KHI LOADING XONG
    window.addEventListener("app:loaded", () => {
        if (localStorage.getItem("sao-dem-tutorial-done")) return;

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

