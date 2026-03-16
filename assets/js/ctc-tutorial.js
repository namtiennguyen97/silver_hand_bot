document.addEventListener("DOMContentLoaded", () => {
    let activeElement = null;
    let currentStep = 0;
    let tutorialRunning = false;
    let lockedScrollY = 0;

    const overlay = document.getElementById("tutorial-overlay");
    const spotlight = document.getElementById("spotlight");
    const tooltip = document.getElementById("tooltip");
    const tooltipText = document.getElementById("tooltip-text");
    const nextBtn = document.getElementById("tutorial-next");
    const skipBtn = document.getElementById("tutorial-skip");
    const helpBtn = document.getElementById("tutorialHelpBtn");

    if (!overlay || !spotlight || !tooltip || !tooltipText || !nextBtn) return;

    const isMobile = () => window.innerWidth <= 768;

    const steps = [
        {
            selector: null,
            text: "👋 Chào mừng bạn đến với <b>CTC SAO-ĐÊM Planner</b>.<br><br>Mình sẽ hướng dẫn nhanh cách chia team và sử dụng các chức năng chính nhé!"
        },
        {
            selector: ".toolbar-shell",
            text: "🧰 Đây là <b>khu vực công cụ chính</b>.<br><br>Bạn có thể dùng <b>Smart Split</b>, <b>Random Split</b>, sắp xếp theo level / tên, copy plan hoặc reset toàn bộ."
        },
        {
            selector: "#managePlayersBtn",
            text: "👥 Đây là nút <b>Manage Players</b>.<br><br>Dùng để <b>thêm / sửa / xoá danh sách thành viên</b> trong danh sách gốc."
        },
        {
            selector: ".left-stack .panel:nth-of-type(2)",
            text: "📋 Đây là <b>Available Players</b>.<br><br>Tất cả người chơi chưa vào team sẽ nằm ở đây.<br><br>PC có thể <b>kéo thả</b>, mobile thì dùng nút <b>+</b> trên từng team."
        },
        {
            selector: ".board",
            text: "🎯 Đây là <b>4 Tactical Slots</b>.<br><br>Bạn kéo player từ danh sách bên trái sang các team bên phải để chia đội theo chiến thuật."
        },
        {
            selector: isMobile() ? "#moreOptionsBtn" : ".team-card:first-child .add-btn",
            text: isMobile()
                ? "📱 Trên mobile, bấm <b>More Options</b> để mở thêm các chức năng như Smart Split, Sort hoặc Reset."
                : "➕ Trên <b>mobile</b>, nếu khó kéo thả thì bấm nút <b>+</b> ở từng team để mở popup chọn nhiều người cùng lúc."
        },
        {
            selector: "#viewVideoBtn",
            text: "🎥 Đây là <b>View Plan Video</b>.<br><br>Dùng để xem video chiến thuật / giải thích kế hoạch cho cả team.<br><br>(Bạn có thể gắn thêm bước nhập password bảo vệ video ở đây.)"
        },
        {
            selector: "#copyBtn",
            text: "📋 Sau khi chia xong, bấm <b>Copy Plan</b> để sao chép đội hình và gửi cho mọi người thật nhanh."
        },
        {
            selector: null,
            text: "✅ Xong rồi!<br><br>Bạn đã sẵn sàng chia team cho <b>CTC SAO-ĐÊM</b>.<br><br>Chúc cả đội chiến thắng nhé! 🔥"
        }
    ];

    // =========================
    // LOCK SCROLL HARD
    // =========================
    function preventScroll(e) {
        if (!tutorialRunning) return;
        e.preventDefault();
    }

    function preventKeyScroll(e) {
        if (!tutorialRunning) return;

        const blockedKeys = [
            "ArrowUp",
            "ArrowDown",
            "PageUp",
            "PageDown",
            "Home",
            "End",
            " ",
            "Spacebar"
        ];

        if (blockedKeys.includes(e.key)) {
            e.preventDefault();
        }
    }

    function lockScroll() {
        lockedScrollY = window.scrollY || window.pageYOffset;

        tutorialRunning = true;

        document.documentElement.classList.add("tutorial-lock");
        document.body.classList.add("tutorial-lock");

        document.body.style.position = "fixed";
        document.body.style.top = `-${lockedScrollY}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";

        window.addEventListener("wheel", preventScroll, { passive: false });
        window.addEventListener("touchmove", preventScroll, { passive: false });
        window.addEventListener("keydown", preventKeyScroll, { passive: false });
    }

    function unlockScroll() {
        tutorialRunning = false;

        document.documentElement.classList.remove("tutorial-lock");
        document.body.classList.remove("tutorial-lock");

        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";

        window.removeEventListener("wheel", preventScroll, { passive: false });
        window.removeEventListener("touchmove", preventScroll, { passive: false });
        window.removeEventListener("keydown", preventKeyScroll, { passive: false });

        window.scrollTo(0, lockedScrollY);
    }

    // =========================
    // ACTIVE ELEMENT
    // =========================
    function clearActive() {
        if (activeElement) {
            activeElement.classList.remove("tutorial-active");
            activeElement.style.filter = "";
            activeElement.style.transition = "";
            activeElement = null;
        }
    }

    // =========================
    // STEP RENDER
    // =========================
    function showStep(index) {
        const step = steps[index];
        if (!step) return;

        clearActive();

        tooltip.classList.remove("welcome");
        spotlight.style.display = "block";

        tooltipText.innerHTML = step.text;

        tooltip.style.top = "auto";
        tooltip.style.left = "auto";
        tooltip.style.bottom = "auto";
        tooltip.style.transform = "none";

        if (!step.selector) {
            spotlight.style.display = "none";
            tooltip.classList.add("welcome");

            tooltip.style.top = "50%";
            tooltip.style.left = "50%";
            tooltip.style.transform = "translate(-50%, -50%)";
            return;
        }

        const el = document.querySelector(step.selector);

        if (!el) {
            nextStep();
            return;
        }

        activeElement = el;
        el.classList.add("tutorial-active");
        el.style.transition = "filter 0.2s ease";
        el.style.filter = "brightness(1.14) saturate(1.08)";

        // Vì đang lock scroll rồi nên chỉ scroll trước khi lock hoặc step đầu khi cần
        // Nhưng nếu element nằm ngoài viewport thì ta tạm unlock mềm để jump scroll
        const rectBefore = el.getBoundingClientRect();
        const padding = 24;

        const isOutOfView =
            rectBefore.top < padding ||
            rectBefore.bottom > window.innerHeight - padding;

        if (isOutOfView) {
            // tạm bỏ fixed body để scroll tới đúng vị trí rồi lock lại
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.width = "";

            const targetY =
                window.scrollY + rectBefore.top - (window.innerHeight / 2 - rectBefore.height / 2);

            window.scrollTo({
                top: Math.max(0, targetY),
                behavior: "smooth"
            });

            setTimeout(() => {
                lockedScrollY = window.scrollY || window.pageYOffset;

                document.body.style.position = "fixed";
                document.body.style.top = `-${lockedScrollY}px`;
                document.body.style.left = "0";
                document.body.style.right = "0";
                document.body.style.width = "100%";

                positionSpotlightAndTooltip(el);
            }, 320);
        } else {
            positionSpotlightAndTooltip(el);
        }
    }

    function positionSpotlightAndTooltip(el) {
        const rect = el.getBoundingClientRect();

        spotlight.style.top = rect.top - 8 + "px";
        spotlight.style.left = rect.left - 8 + "px";
        spotlight.style.width = rect.width + 16 + "px";
        spotlight.style.height = rect.height + 16 + "px";

        requestAnimationFrame(() => {
            const tooltipRect = tooltip.getBoundingClientRect();
            const padding = 16;

            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            let top = rect.bottom + padding;
            let left = rect.left;

            if (top + tooltipRect.height > viewportHeight - padding) {
                top = rect.top - tooltipRect.height - padding;
            }

            if (top < padding) {
                top = viewportHeight / 2 - tooltipRect.height / 2;
                left = viewportWidth / 2 - tooltipRect.width / 2;
            }

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

    // =========================
    // FLOW
    // =========================
    function nextStep() {
        currentStep++;

        if (currentStep >= steps.length) {
            finishTutorial();
            return;
        }

        showStep(currentStep);
    }

    function finishTutorial() {
        clearActive();
        overlay.style.display = "none";
        spotlight.style.display = "none";
        unlockScroll();
        localStorage.setItem("sao-dem-ctc-tutorial-done", "1");
    }

    function startTutorial(force = false) {
        currentStep = 0;

        clearActive();

        if (force) {
            localStorage.removeItem("sao-dem-ctc-tutorial-done");
        }

        overlay.style.display = "block";
        lockScroll();
        showStep(currentStep);
    }

    // =========================
    // EVENTS
    // =========================
    nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        nextStep();
    });

    if (skipBtn) {
        skipBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            finishTutorial();
        });
    }

    overlay.addEventListener("click", (e) => {
        if (!tooltip.contains(e.target)) {
            nextStep();
        }
    });

    if (helpBtn) {
        helpBtn.addEventListener("click", () => {
            startTutorial(true);
        });
    }

    window.addEventListener("app:loaded", () => {
        if (localStorage.getItem("sao-dem-ctc-tutorial-done")) return;

        setTimeout(() => {
            startTutorial();
        }, 250);
    });

    window.addEventListener("resize", () => {
        if (overlay.style.display === "block") {
            showStep(currentStep);
        }
    });
});