document.addEventListener("DOMContentLoaded", () => {
    let activeElement = null;
    let svgLine = null;
    let lineEl = null;

    function initNeonLine() {
        if (!document.getElementById("tutorial-neon-line-svg")) {
            svgLine = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgLine.id = "tutorial-neon-line-svg";
            svgLine.style.position = "fixed";
            svgLine.style.top = "0";
            svgLine.style.left = "0";
            svgLine.style.width = "100%";
            svgLine.style.height = "100%";
            svgLine.style.pointerEvents = "none";
            svgLine.style.zIndex = "100000"; // below chat, above overlay
            svgLine.style.display = "none";
            
            svgLine.innerHTML = `
                <defs>
                    <filter id="neon-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <line id="tutorial-line" x1="0" y1="0" x2="0" y2="0" stroke="#00ffd5" stroke-width="2" filter="url(#neon-glow-filter)" stroke-dasharray="6,6" />
            `;
            document.body.appendChild(svgLine);
            lineEl = document.getElementById("tutorial-line");

            // Animation cho line flowing
            let offset = 0;
            setInterval(() => {
                if (svgLine.style.display !== "none" && lineEl) {
                    offset -= 1;
                    lineEl.style.strokeDashoffset = offset;
                }
            }, 30);
        }
    }

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
        initNeonLine();
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

        tooltip.style.display = "none"; // Hide old tooltip completely

        if (!step.selector) {
            // ===== WELCOME STEP =====
            spotlight.style.display = "none";
            if (svgLine) svgLine.style.display = "none";
            showRPGChat(step.text);
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

        showRPGChat(step.text);

        // Update Line
        requestAnimationFrame(() => {
            const chatOverlayElement = document.getElementById("rpgChatOverlay");
            if (chatOverlayElement && lineEl && svgLine) {
                svgLine.style.display = "block";
                const chatRect = chatOverlayElement.getBoundingClientRect();
                const rect = el.getBoundingClientRect(); // Target element rect

                // Vì spotlight được padding thêm 8px, ta phải tính luôn 8px này để tia dừng đúng ở viền spotlight
                const spotTop = rect.top - 8;
                const spotBottom = rect.bottom + 8;

                const startX = chatRect.left + chatRect.width / 2;
                const startY = chatRect.top; // Rút về đúng mép trên của chat box

                // Tìm điểm nối vào viền spotlight
                const endX = rect.left + rect.width / 2;
                let endY = spotBottom;
                
                if (startY < spotTop) {
                    endY = spotTop;
                } else if (startY > spotBottom) {
                    endY = spotBottom;
                } else {
                    endY = rect.top + rect.height / 2; // Nếu đè vạch
                }

                lineEl.setAttribute("x1", startX);
                lineEl.setAttribute("y1", startY);
                lineEl.setAttribute("x2", endX);
                lineEl.setAttribute("y2", endY);
            }
        });
    }

    function nextStep() {
        currentStep++;

        if (currentStep >= steps.length) {
            if (activeElement) {
                activeElement.classList.remove("tutorial-active");
            }

            overlay.style.display = "none";
            if (svgLine) svgLine.style.display = "none";
            document.body.classList.remove("tutorial-lock");
            hideRPGChat(); // Hide chat when tutorial ends

            localStorage.setItem("sao-dem-main-tutorial-done", "1");
            return;
        }

        showStep(currentStep);
    }

    // nextBtn.addEventListener("click", nextStep); // Not needed anymore

    // Click anywhere on overlay to skip text or go next
    overlay.addEventListener("click", (e) => {
        e.stopPropagation(); // QUAN TRỌNG: chặn sự kiện click lan ra ngoài gây đóng chat box!
        
        if (typeof window.isChatTyping !== 'undefined' && window.isChatTyping) {
            const container = document.getElementById("rpgChatContent");
            if (container) container.dataset.skip = 'true';
        } else {
            nextStep();
        }
    });

    // Also support clicking the chat box itself to advance
    const chatOverlayElement = document.getElementById("rpgChatOverlay");
    if (chatOverlayElement) {
        chatOverlayElement.addEventListener("click", (e) => {
            if (document.body.classList.contains("tutorial-lock")) {
                e.stopPropagation(); // Cũng chặn luôn khi bấm vào tooltip
                if (typeof window.isChatTyping !== 'undefined' && window.isChatTyping) {
                    const container = document.getElementById("rpgChatContent");
                    if (container) container.dataset.skip = 'true';
                } else {
                    nextStep();
                }
            }
        });
    }

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

