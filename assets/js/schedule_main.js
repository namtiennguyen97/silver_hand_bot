/**
 * SCHEDULE MAIN JS
 * Handles notification registry, accordion effects, and interactive tutorial for the standalone schedule page.
 */

const VAPID_PUBLIC_KEY = "BGFuAyQj_1e0AwOAUciHPHCh0VADRHJH_h-hF7SjlVev0Vaqd0is5WlPM_mpX5U-R3rW-SIAeygMHKuxX8CVVVo";

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Register SW
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
        console.log('[SW] Registered');
    }).catch(err => console.error('[SW] Error', err));
}

function showToast(message, isError = false) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `cyber-toast ${isError ? 'error' : ''}`;
    toast.innerHTML = `
        <i class="fa-solid ${isError ? 'fa-triangle-exclamation' : 'fa-circle-check'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Auto remove after 3s
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.4s forwards';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

window.toggleNotification = async function (id, enabled) {
    const prefs = JSON.parse(localStorage.getItem('notification_prefs') || '{}');
    prefs[id] = enabled;
    localStorage.setItem('notification_prefs', JSON.stringify(prefs));

    if (!("Notification" in window)) {
        showToast("Browser does not support notifications", true);
        return;
    }

    if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            showToast("Neural link denied by system", true);
            return;
        }
    }

    // Get Subscription
    try {
        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();

        if (enabled && !subscription) {
            // Subscribe if not already
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
        }

        if (subscription) {
            // Sync with server
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscription: subscription,
                    preferences: prefs
                })
            });
            console.log('[Notification] Prefs synced');
            showToast(`${id.toUpperCase()} STATUS: ${enabled ? 'CONNECTED' : 'DISCONNECTED'}`);
        }
    } catch (err) {
        console.error('[Notification] Error syncing:', err);
        showToast("Neural sync failed", true);
    }
};

window.toggleScheduleExpand = function (el) {
    const group = el.closest('.schedule-group');
    if (group) {
        group.classList.toggle('expanded');
    }
};

window.toggleMainNotification = function (parentId, enabled, childIds) {
    // Prevent event from expanding the accordion when clicking the switch
    if (window.event) window.event.stopPropagation();

    // Toggle all children to match parent
    childIds.forEach(id => {
        const childCb = document.getElementById(`notify-${id}`);
        if (childCb) {
            childCb.checked = enabled;
            // Trigger actual subscription for each child
            window.toggleNotification(id, enabled);
        }
    });

    // Also sync the parent state itself
    window.toggleNotification(parentId, enabled);
};

// --- TUTORIAL LOGIC (INTERACTIVE) ---
const tutorialSteps = [
    {
        selector: null,
        text: "Welcome to the <b>Camp Event Registry</b>.<br><br>I will help you synchronize your neural alerts for upcoming camp operations."
    },
    {
        selector: ".schedule-container",
        text: "This interface allows you to register for <b>real-time notifications</b> for critical camp events."
    },
    {
        selector: ".game-switch",
        text: "Use the <b>Neural Switches</b> on the right to enable or disable specific tactical alerts."
    },
    {
        selector: ".schedule-group",
        text: "Events marked with <span class='highlight'>MULTI-ALARM</span> can be expanded.<br><br>Click on them to configure granular reminders for different mission phases."
    },
    {
        selector: ".footer-note",
        text: "<b>CRITICAL:</b> Ensure you grant browser notification permission when prompted, or the neural link will fail."
    },
    {
        selector: null,
        text: "Tactical briefing complete.<br><br>Your registry is now active. Have a good day, guys."
    }
];

let currentTutorialStep = 0;
let activeTutorialElement = null;

function updateSpotlight() {
    const spotlight = document.getElementById('spotlight');
    const overlay = document.getElementById('tutorial-overlay');
    if (!spotlight || !activeTutorialElement || overlay.style.display === 'none') return;

    const rect = activeTutorialElement.getBoundingClientRect();
    spotlight.style.top = (rect.top - 8) + "px";
    spotlight.style.left = (rect.left - 8) + "px";
    spotlight.style.width = (rect.width + 16) + "px";
    spotlight.style.height = (rect.height + 16) + "px";
}

window.addEventListener('resize', updateSpotlight);
window.addEventListener('scroll', updateSpotlight);

function showNextTutorialStep() {
    const spotlight = document.getElementById('spotlight');

    if (activeTutorialElement) {
        activeTutorialElement.classList.remove('tutorial-active');
        activeTutorialElement = null;
    }

    if (currentTutorialStep >= tutorialSteps.length) {
        finishScheduleTutorial();
        return;
    }

    const step = tutorialSteps[currentTutorialStep];

    if (step.selector) {
        const el = document.querySelector(step.selector);
        if (el) {
            activeTutorialElement = el;
            el.classList.add('tutorial-active');
            spotlight.style.display = 'block';
            updateSpotlight();
        } else {
            spotlight.style.display = 'none';
        }
    } else {
        spotlight.style.display = 'none';
    }

    showRPGChat(step.text);
    currentTutorialStep++;
}

function startScheduleTutorial() {
    currentTutorialStep = 0;
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) overlay.style.display = 'block';
    document.body.classList.add('tutorial-lock');
    showNextTutorialStep();
}

function finishScheduleTutorial() {
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) overlay.style.display = 'none';
    document.body.classList.remove('tutorial-lock');
    hideRPGChat();
    localStorage.setItem('sao-dem-schedule-tutorial-done', '1');
}

// --- CYBER BACKGROUND ---
function initCyberBackground() {
    const bg = document.getElementById('cyberBg');
    if (!bg) return;

    const squareCount = 20;
    for (let i = 0; i < squareCount; i++) {
        createSquare(bg);
    }
}

function createSquare(container) {
    const square = document.createElement('div');
    square.className = 'cyber-square';
    
    const size = Math.random() * 40 + 10;
    const left = Math.random() * 100;
    const duration = Math.random() * 10 + 10;
    const delay = Math.random() * 20;
    
    square.style.width = `${size}px`;
    square.style.height = `${size}px`;
    square.style.left = `${left}%`;
    square.style.animationDuration = `${duration}s`;
    square.style.animationDelay = `-${delay}s`;
    
    container.appendChild(square);
}


// Initialize states on load
window.addEventListener('load', () => {
    initCyberBackground();
    const prefs = JSON.parse(localStorage.getItem('notification_prefs') || '{}');

    Object.keys(prefs).forEach(id => {
        const cb = document.getElementById(`notify-${id}`);
        if (cb) cb.checked = prefs[id];
    });

    // Help button listener
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            startScheduleTutorial();
        });
    }

    // RPG Chat click listener for tutorial progression
    const chatOverlay = document.getElementById('rpgChatOverlay');
    if (chatOverlay) {
        chatOverlay.addEventListener('click', (e) => {
            if (document.body.classList.contains('tutorial-lock')) {
                e.stopPropagation();
                if (window.isChatTyping) {
                    const container = document.getElementById('rpgChatContent');
                    if (container) container.dataset.skip = 'true';
                } else {
                    showNextTutorialStep();
                }
            }
        });
    }

    // Tutorial Overlay click listener for tutorial progression
    const tutorialOverlay = document.getElementById('tutorial-overlay');
    if (tutorialOverlay) {
        tutorialOverlay.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.isChatTyping) {
                const container = document.getElementById('rpgChatContent');
                if (container) container.dataset.skip = 'true';
            } else {
                showNextTutorialStep();
            }
        });
    }

    // Add subtle click effects for audio if project sounds are available
    document.addEventListener('click', (e) => {
        const clickTarget = e.target.closest('.game-switch, .main-item, .back-link, .help-fab');
        if (clickTarget && window.Audio) {
            const clickAudio = new Audio('assets/sounds/nierMail.mp3');
            clickAudio.volume = 0.4;
            clickAudio.play().catch(() => { });
        }
    });
});
