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
            svgLine.style.zIndex = "100000"; 
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

            let offset = 0;
            setInterval(() => {
                if (svgLine.style.display !== "none" && lineEl) {
                    offset -= 1;
                    lineEl.style.strokeDashoffset = offset;
                }
            }, 30);
        }
    }

    const isMobile = () => window.innerWidth <= 768;

    const steps = [
        {
            selector: null,
            text: "👋 Chào mừng bạn đến với <b>CTC SAO-ĐÊM Planner</b>.<br><br>Mình sẽ hướng dẫn nhanh cách chia team và sử dụng các chức năng nhé!"
        },
        {
            selector: ".toolbar-shell",
            text: "🧰 Đây là <b>khu vực công cụ chính</b>.<br><br>Dùng để <b>Smart Split</b>, <b>Random Split</b>, sắp xếp theo level, copy plan hoặc reset toàn bộ."
        },
        {
            selector: "#managePlayersBtn",
            text: "👥 Đây là nút <b>Manage Players</b>.<br><br>Dùng để <b>thêm / sửa / xoá</b> danh sách thành viên gốc."
        },
        {
            selector: ".panel:nth-of-type(2)",
            text: "📋 Đây là <b>Available Players</b>.<br><br>Tất cả người chơi chưa vào team sẽ ở đây. PC thì <b>kéo thả</b>, mobile thì dùng nút <b>+</b>."
        },
        {
            selector: ".board",
            text: "🎯 Đây là <b>4 Tactical Slots</b>.<br><br>Kéo player sang các team bên phải để chia đội theo chiến thuật."
        },
        {
            selector: "#viewVideoBtn",
            text: "🎥 Đây là <b>View Plan Video</b>.<br><br>Xem video chiến thuật giải thích kế hoạch cho cả team."
        },
        {
            selector: "#copyBtn",
            text: "📋 Xong rồi! Bấm <b>Copy Plan</b> để sao chép đội hình gửi cho mọi người nhé."
        },
        {
            selector: null,
            text: "✅ Bạn đã sẵn sàng chia team cho <b>CTC SAO-ĐÊM</b>.<br><br>Chúc cả đội chiến thắng nhé! 🔥"
        }
    ];

    let currentStep = 0;
    const overlay = document.getElementById("tutorial-overlay");
    const spotlight = document.getElementById("spotlight");
    let trackerId = null;

    function startCoordinateTracker(el) {
        if (trackerId) cancelAnimationFrame(trackerId);
        
        const update = () => {
            if (!activeElement || activeElement !== el) return;
            
            const rect = el.getBoundingClientRect();
            spotlight.style.top = rect.top - 8 + "px";
            spotlight.style.left = rect.left - 8 + "px";
            spotlight.style.width = rect.width + 16 + "px";
            spotlight.style.height = rect.height + 16 + "px";

            const chatOverlayElement = document.getElementById("rpgChatOverlay");
            if (chatOverlayElement && lineEl && svgLine && chatOverlayElement.style.display === 'block') {
                const chatRect = chatOverlayElement.getBoundingClientRect();
                
                // Ensure line is only shown if chat has valid coordinates
                if (chatRect.width > 0 && chatRect.height > 0) {
                    svgLine.style.display = "block";
                    
                    const spotTop = rect.top - 8;
                    const spotBottom = rect.bottom + 8;
                    const spotCenterX = rect.left + rect.width / 2;

                    // Start point: Center top of chat box
                    const startX = chatRect.left + chatRect.width / 2;
                    const startY = chatRect.top;

                    // End point: Bottom (or top) of spotlight
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
            
            trackerId = requestAnimationFrame(update);
        };
        
        trackerId = requestAnimationFrame(update);
    }

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

        let el = null;
        const potentialElements = document.querySelectorAll(step.selector);
        for (const candidate of potentialElements) {
            if (candidate.offsetParent !== null) {
                el = candidate;
                break;
            }
        }
        
        if (!el) {
            nextStep();
            return;
        }

        activeElement = el;
        el.classList.add("tutorial-active");

        // Scroll to element
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Start tracking coordinates immediately and continuously
        startCoordinateTracker(el);
        
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
        if (svgLine) svgLine.style.display = "none";
        document.body.classList.remove("tutorial-lock");
        hideRPGChat();
        localStorage.setItem("sao-dem-ctc-tutorial-done", "1");
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
        if (localStorage.getItem("sao-dem-ctc-tutorial-done")) return;
        setTimeout(() => {
            overlay.style.display = "block";
            document.body.classList.add("tutorial-lock");
            showStep(currentStep);
        }, 500);
    });

    const helpBtn = document.getElementById("tutorialHelpBtn");
    if (helpBtn) {
        helpBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            currentStep = 0;
            document.body.classList.add("tutorial-lock");
            overlay.style.display = "block";
            showStep(currentStep);
        });
    }

    window.addEventListener("resize", () => {
        if (overlay.style.display === "block") showStep(currentStep);
    });
});