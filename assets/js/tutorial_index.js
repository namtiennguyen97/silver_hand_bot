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
            text: "👋 <b>COMMUNICATIONS_SYNC_ESTABLISHED.</b><br><br>Commander, welcome to the Tactical HUD. I will guide you through the operational sectors."
        },
        {
            selector: "#hudProfile",
            text: "👤 <b>SURVIVOR_PROFILE_READOUT:</b><br><br>Access your level, EXP, and personal records here. Clicking this will expand your detailed dossier."
        },
        {
            selector: "#hudBtnBattle",
            text: "⚔️ <b>COMBAT_ARCHIVE_DATA:</b><br><br>Direct link to the <b>Drama Archive</b>. Access historical records and mission logs."
        },
        {
            selector: "#hudBtnMembers",
            text: "🔍 <b>TACTICAL_SUPPORT_MOD:</b><br><br>This is your guidance node. Trigger this sequence anytime you need a refresher on HUD operations."
        },
        {
            selector: "#hudBtnTasks",
            text: "📅 <b>OBJECTIVE_TRACKER:</b><br><br>Monitor daily directives and the <b>SAO-ĐÊM Event Schedule</b> to maximize efficiency."
        },
        {
            selector: "#hudBtnRD",
            text: "🗺️ <b>STRATEGIC_PLANNER:</b><br><br>Deploy the <b>CTC Tactical Plan</b> module for field operations and team logistics."
        },
        {
            selector: "#hudBtnSetting",
            text: "⚙️ <b>SYSTEM_PREFERENCES:</b><br><br>Adjust audio streams, neural link sensitivity, and HUD visual settings."
        },
        {
            selector: ".hud-bottom-left",
            text: "📦 <b>UTILITY_ARRAY:</b><br><br>Check your local mail, camp notifications, and system field guides here."
        },
        {
            selector: null,
            text: "<b>TUTORIAL_COMPLETE.</b><br><br>Field operations are now under your command. Good luck, Survivor."
        },
    ];


    let currentStep = 0;
    const overlay = document.getElementById("tutorial-overlay");
    const spotlight = document.getElementById("spotlight");

    let trackerId = null;
    let trackerStartTime = 0;

    function updateCoords() {
        if (!activeElement || spotlight.style.display === "none") return;
        
        const rect = activeElement.getBoundingClientRect();
        spotlight.style.top = rect.top - 8 + "px";
        spotlight.style.left = rect.left - 8 + "px";
        spotlight.style.width = rect.width + 16 + "px";
        spotlight.style.height = rect.height + 16 + "px";

        const chatOverlayElement = document.getElementById("rpgChatOverlay");
        if (chatOverlayElement && lineEl && svgLine && chatOverlayElement.classList.contains('active')) {
            const chatRect = chatOverlayElement.getBoundingClientRect();
            
            if (chatRect.width > 0 && chatRect.height > 0) {
                svgLine.style.display = "block";
                
                const spotTop = rect.top - 8;
                const spotBottom = rect.bottom + 8;
                const spotCenterX = rect.left + rect.width / 2;

                const startX = chatRect.left + chatRect.width / 2;
                const startY = chatRect.top;

                const endX = spotCenterX;
                let endY = spotBottom;
                
                if (startY < spotTop) {
                    endY = spotTop;
                } else if (startY > spotBottom) {
                    endY = spotBottom;
                } else {
                    endY = rect.top + rect.height / 2;
                }

                lineEl.setAttribute("x1", startX);
                lineEl.setAttribute("y1", startY);
                lineEl.setAttribute("x2", endX);
                lineEl.setAttribute("y2", endY);
            }
        } else if (svgLine) {
            svgLine.style.display = "none";
        }
    }

    function startCoordinateTracker() {
        if (trackerId) cancelAnimationFrame(trackerId);
        trackerStartTime = Date.now();
        
        const loop = () => {
            if (!activeElement) return;
            updateCoords();
            
            if (Date.now() - trackerStartTime < 1000) {
                trackerId = requestAnimationFrame(loop);
            } else {
                trackerId = null;
            }
        };
        trackerId = requestAnimationFrame(loop);
    }

    window.addEventListener("scroll", updateCoords, { passive: true });
    window.addEventListener("resize", updateCoords, { passive: true });

    function showStep(index) {
        initNeonLine();
        const step = steps[index];

        if (activeElement) {
            activeElement.classList.remove("tutorial-active");
            activeElement = null;
        }
        if (trackerId) {
            cancelAnimationFrame(trackerId);
            trackerId = null;
        }

        spotlight.style.display = "block";

        if (!step.selector) {
            spotlight.style.display = "none";
            if (svgLine) svgLine.style.display = "none";
            showRPGChat(step.text);
            return;
        }

        const el = document.querySelector(step.selector);
        if (!el) return;

        activeElement = el;
        el.classList.add("tutorial-active");
        
        // Use smooth scroll
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        startCoordinateTracker();
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
        if (svgLine) svgLine.style.display = "none";
        document.body.classList.remove("tutorial-lock");
        hideRPGChat();
        localStorage.setItem("sao-dem-main-tutorial-done", "1");
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

    const chatOverlayElement = document.getElementById("rpgChatOverlay");
    if (chatOverlayElement) {
        chatOverlayElement.addEventListener("click", (e) => {
            if (document.body.classList.contains("tutorial-lock")) {
                e.stopPropagation();
                if (window.isChatTyping) {
                    const container = document.getElementById("rpgChatContent");
                    if (container) container.dataset.skip = 'true';
                } else {
                    nextStep();
                }
            }
        });
    }

    window.addEventListener("app:loaded", () => {
        if (localStorage.getItem("sao-dem-main-tutorial-done")) return;
        setTimeout(() => {
            overlay.style.display = "block";
            showStep(currentStep);
        }, 200);
    });

    function startTutorial() {
        currentStep = 0;
        document.body.classList.add("tutorial-lock");
        overlay.style.display = "block";
        showStep(currentStep);
    }
    window.startTutorial = startTutorial;
});
