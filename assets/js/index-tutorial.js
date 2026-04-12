document.addEventListener("DOMContentLoaded", () => {
    let activeElement = null;

    const steps = [
        {
            selector: null,
            text: "Welcome to the <b>SAO-ĐÊM Tactical Node</b>.<br><br>I am the Mayor AI. Let me guide you through the synchronization protocols of this terminal."
        },
        {
            selector: "#hudProfile",
            text: "This is your <b>Combat Identity</b>.<br><br>Here you can monitor your current level, experience progression, and tactical ID."
        },
        {
            selector: "#hudBtnBattle",
            text: "The <b>Campaign Archive</b>.<br><br>Access this decrypted data node to review past missions and classified tactical history."
        },
        {
            selector: "#hudBtnMembers",
            text: "<b>Latest News</b>.<br><br>Stay updated with the official camp broadcasts and global server announcements."
        },
        {
            selector: "#hudBtnRD",
            text: "<b>CTC Planner</b>.<br><br>Deploy here to coordinate team assignments and tactical distribution for camp battles."
        },
        {
            selector: "#hudBtnSetting",
            text: "<b>System Settings</b>.<br><br>Adjust your neural link parameters, including background mode (3D/2D) and audio levels."
        },
        {
            selector: "#hudBtnGuide",
            text: "<b>Tactical Guide</b>.<br><br>If you ever need a refresher on system mechanics or game data, access the encrypted guide here."
        },
        {
            selector: null,
            text: "Protocol synchronization complete.<br><br>You are now authorized to proceed. Good luck, Tactician. 🔥"
        }
    ];

    let currentStep = 0;
    const overlay = document.getElementById("tutorial-overlay");
    const spotlight = document.getElementById("spotlight");

    if (!overlay || !spotlight) return;

    function updateCoords() {
        if (!activeElement || overlay.style.display === "none") return;
        
        const rect = activeElement.getBoundingClientRect();
        spotlight.style.top = rect.top - 8 + "px";
        spotlight.style.left = rect.left - 8 + "px";
        spotlight.style.width = rect.width + 16 + "px";
        spotlight.style.height = rect.height + 16 + "px";
    }

    // Event listeners for scroll/resize
    window.addEventListener("scroll", updateCoords, { passive: true });
    window.addEventListener("resize", updateCoords, { passive: true });

    function showStep(index) {
        const step = steps[index];

        if (activeElement) {
            activeElement.classList.remove("tutorial-active");
            activeElement = null;
        }

        spotlight.style.display = "block";

        if (!step.selector) {
            spotlight.style.display = "none";
            showRPGChat(step.text);
            return;
        }

        const el = document.querySelector(step.selector);
        if (!el) {
            nextStep();
            return;
        }

        activeElement = el;
        el.classList.add("tutorial-active");
        
        // Spotlight placement
        updateCoords();
        
        // Show chat text
        showRPGChat(step.text);
    }

    function nextStep() {
        currentStep++;
        if (currentStep >= steps.length) {
            finishTutorial();
            return;
        }
        showStep(currentStep);
    }

    function finishTutorial() {
        if (activeElement) activeElement.classList.remove("tutorial-active");
        overlay.style.display = "none";
        document.body.classList.remove("tutorial-lock");
        hideRPGChat();
        localStorage.setItem("sao-dem-index-tutorial-done", "1");
    }

    overlay.addEventListener("click", (e) => {
        e.stopPropagation();
        if (window.isChatTyping) {
            const container = document.getElementById("rpgChatContent");
            if (container) container.dataset.skip = 'true';
        } else {
            nextStep();
        }
    });

    // Handle clicks on the Chat Overlay as well
    const chatOverlayElement = document.getElementById("rpgChatOverlay");
    if (chatOverlayElement) {
        chatOverlayElement.addEventListener("click", (e) => {
            if (document.body.classList.contains("tutorial-lock")) {
                if (window.isChatTyping) {
                    const container = document.getElementById("rpgChatContent");
                    if (container) container.dataset.skip = 'true';
                } else {
                    nextStep();
                }
            }
        });
    }

    function startTutorial() {
        currentStep = 0;
        overlay.style.display = "block";
        document.body.classList.add("tutorial-lock");
        showStep(currentStep);
    }

    function tryStartAutoTutorial() {
        if (localStorage.getItem("sao-dem-index-tutorial-done")) return;

        // Ensure loading is finished (body.finished is set by loading.js)
        if (!document.body.classList.contains("finished")) {
            return;
        }

        setTimeout(() => {
            startTutorial();
        }, 1500); // Slight delay after HUD sync effect
    }

    window.addEventListener("app:loaded", () => {
        tryStartAutoTutorial();
    });

    // #hudBtnGuide (graduation cap) — click to replay tutorial at any time
    const guideBtn = document.getElementById("hudBtnGuide");
    if (guideBtn) {
        guideBtn.addEventListener("click", () => {
            localStorage.removeItem("sao-dem-index-tutorial-done");
            startTutorial();
        });
    }
});
