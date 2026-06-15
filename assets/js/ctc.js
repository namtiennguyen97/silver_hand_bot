// =========================
// CONFIG / DATA
// =========================
const STORAGE_KEY = "ctc_team_planner_v21_object_state";
const PLAYER_STORAGE_KEY = "ctc_team_planner_v21_master_players";
const SHARED_STATE_API = "/api/ctc-state";
const SHARED_SYNC_INTERVAL_MS = 60000; // 60s để tiết kiệm quota
const SHARED_SAVE_DEBOUNCE_MS = 1000; // gom thao tác trong 1s

const DEFAULT_PLAYERS = [
    { name: "Chychy", role: "Rifle", power: 148, group: "Commander", note: "" },
    { name: "Maybe", role: "Warrior", power: 148, group: "Commander", note: "" },

    { name: "DL", role: "Sniper", power: 147, group: "Elite", note: "" },
    { name: "Tormenta", role: "Rifle", power: 145, group: "Elite", note: "" },
    { name: "JVLY", role: "Rifle", power: 147, group: "Elite", note: "" },
    { name: "OPPAPS", role: "Sniper", power: 148, group: "Elite", note: "" },
    { name: "Reanimation", role: "Rifle", power: 147, group: "Elite", note: "" },
    { name: "Cloud", role: "Rifle", power: 147, group: "Elite", note: "" },
    { name: "ChrOnoA", role: "Warrior", power: 147, group: "Elite", note: "" },
    { name: "Lascreia", role: "Rifle", power: 147, group: "Elite", note: "" },
    { name: "StarFire", role: "Rifle", power: 147, group: "Elite", note: "" },
    { name: "Silver-Hand", role: "Rifle", power: 146, group: "Elite", note: "" },
    { name: "ZELLA", role: "Virus", power: 147, group: "Elite", note: "Can be changed later" },
    { name: "桃猫", role: "Rifle", power: 147, group: "Elite", note: "" },
    { name: "DARKNESS", role: "Rifle", power: 147, group: "Elite", note: "" },
    { name: "Vampk", role: "Rifle", power: 146, group: "Elite", note: "" },
    { name: "Valkyre", role: "Rifle", power: 146, group: "Elite", note: "" },
    { name: "Rin-Rin", role: "Rifle", power: 147, group: "Elite", note: "" },
    { name: "Hanzel", role: "Rifle", power: 146, group: "Elite", note: "" },
    { name: "FixyFoxy", role: "Rifle", power: 145, group: "Elite", note: "" },
    { name: "Blu", role: "Rifle", power: 147, group: "Elite", note: "" },
    { name: "Izraa", role: "Rifle", power: 147, group: "Elite", note: "Confirmed, not sure to join" },
    { name: "grace", role: "Rifle", power: 146, group: "Elite", note: "" },

    { name: "6ixtY-9ine", role: "Rifle", power: 146, group: "Non-Elite", note: "" },
    { name: "Queensy", role: "Rifle", power: 147, group: "Non-Elite", note: "" },
    { name: "Fern", role: "Rifle", power: 145, group: "Non-Elite", note: "Not sure to join" },
    { name: "Jin", role: "Rifle", power: 147, group: "Non-Elite", note: "" },
    { name: "BLEU", role: "Rifle", power: 146, group: "Non-Elite", note: "" },

    { name: "Xin", role: "Rifle", power: 148, group: "Pending", note: "Waiting" },
    { name: "XOX", role: "Rifle", power: 145, group: "Pending", note: "Waiting" }
];

const CATEGORIES = [
    "Attack team 1",
    "Beacon team 2",
    "Free run",
    "Destroying their base"
];

let masterPlayers = [];

// =========================
// STATE
// =========================
const state = {
    pool: [],
    categories: {
        "Attack team 1": [],
        "Beacon team 2": [],
        "Free run": [],
        "Destroying their base": []
    },
    draggingId: null,
    modalTargetCategory: null,
    editingPlayerId: null
};
let sharedSyncTimer = null;
let sharedSaveTimer = null;
let lastSharedUpdatedAt = 0;
let isApplyingRemoteState = false;
let lastSavedSignature = "";
let lastAppliedRemoteSignature = "";

let activeWorkspace = null;

// =========================
// ELEMENTS
// =========================
const searchInput = document.getElementById("searchInput");
const roleFilter = document.getElementById("roleFilter");
const poolChipsEl = document.getElementById("poolChips");
const poolCountEl = document.getElementById("poolCount");
const commanderCountEl = document.getElementById("commanderCount");
const commanderListEl = document.getElementById("commanderList");

const smartSplitBtn = document.getElementById("smartSplitBtn");
const randomSplitBtn = document.getElementById("randomSplitBtn");
const sortPowerBtn = document.getElementById("sortPowerBtn");
const sortNameBtn = document.getElementById("sortNameBtn");
const copyBtn = document.getElementById("copyBtn");
const resetBtn = document.getElementById("resetBtn");
const clearTeamsBtn = document.getElementById("clearTeamsBtn");

const pickerModal = document.getElementById("pickerModal");
const modalTitle = document.getElementById("modalTitle");
const modalSearch = document.getElementById("modalSearch");
const checkGrid = document.getElementById("checkGrid");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const confirmModalBtn = document.getElementById("confirmModalBtn");

const toastEl = document.getElementById("toast");
const dropZones = document.querySelectorAll(".drop-zone");
const viewVideoBtn = document.getElementById("viewVideoBtn");
const videoModal = document.getElementById("videoModal");
const closeVideoBtn = document.getElementById("closeVideoBtn");
const planVideo = document.getElementById("planVideo");
const scoreCalcBtn = document.getElementById("scoreCalcBtn");
const scoreCalcModal = document.getElementById("scoreCalcModal");
const closeScoreCalcBtn = document.getElementById("closeScoreCalcBtn");
const analyzeScoreBtn = document.getElementById("analyzeScoreBtn");
const ourScoreInput = document.getElementById("ourScoreInput");
const enemyScoreInput = document.getElementById("enemyScoreInput");
const scoreCalcResult = document.getElementById("scoreCalcResult");
const scoreCalcTitle = document.getElementById("scoreCalcTitle");
const scoreCalcSubtitle = document.getElementById("scoreCalcSubtitle");
const ourScoreLabel = document.getElementById("ourScoreLabel");
const enemyScoreLabel = document.getElementById("enemyScoreLabel");
const analyzeScoreText = document.getElementById("analyzeScoreText");
const closeScoreCalcText = document.getElementById("closeScoreCalcBtn");
const scoreCalcEmptyText = document.getElementById("scoreCalcEmptyText");
const scoreLangButtons = document.querySelectorAll("[data-score-lang]");

// Manage Players
const managePlayersBtn = document.getElementById("managePlayersBtn");
const playerManagerModal = document.getElementById("playerManagerModal");
const pmName = document.getElementById("pmName");
const pmRole = document.getElementById("pmRole");
const pmPower = document.getElementById("pmPower");
const pmGroup = document.getElementById("pmGroup");
const pmNote = document.getElementById("pmNote");
const pmSaveBtn = document.getElementById("pmSaveBtn");
const pmSearch = document.getElementById("pmSearch");
const pmList = document.getElementById("pmList");
const pmCloseBtn = document.getElementById("pmCloseBtn");
const pmResetDefaultBtn = document.getElementById("pmResetDefaultBtn");
const pmSelectAll = document.getElementById("pmSelectAll");
const pmDeleteSelectedBtn = document.getElementById("pmDeleteSelectedBtn");
const pmDeleteAllBtn = document.getElementById("pmDeleteAllBtn");

const moreOptionsWrap = document.getElementById("moreOptionsWrap");
const moreOptionsBtn = document.getElementById("moreOptionsBtn");
const moreOptionsMenu = document.getElementById("moreOptionsMenu");

const mobileResetBtn = document.getElementById("mobileResetBtn");

// Workspace Elements
const workspaceBrowser = document.getElementById("workspaceBrowser");
const mainApp = document.getElementById("mainApp");
const workspaceList = document.getElementById("workspaceList");
const newWorkspaceNameInput = document.getElementById("newWorkspaceName");
const createWorkspaceBtn = document.getElementById("createWorkspaceBtn");
const uploadPlanBtn = document.getElementById("uploadPlanBtn");
const uploadBtnText = document.getElementById("uploadBtnText");
const activeWorkspaceBadge = document.getElementById("activeWorkspaceBadge");
const browseWorkspacesBtn = document.getElementById("browseWorkspacesBtn");
const newWorkspaceNoteInput = document.getElementById("newWorkspaceNote");

// Confirm Modal Elements
const dynamicConfirmModal = document.getElementById("dynamicConfirmModal");
const confirmModalTitle = document.getElementById("confirmModalTitle");
const confirmModalText = document.getElementById("confirmModalText");
const confirmCancelBtn = document.getElementById("confirmCancelBtn");
const confirmProceedBtn = document.getElementById("confirmProceedBtn");

// Keypad Elements
const keypadModal = document.getElementById("keypadModal");
const keypadDisplay = document.getElementById("keypadDisplay");
const keypadPrompt = document.getElementById("keypadPrompt");
const keypadCancelBtn = document.getElementById("keypadCancelBtn");
const keypadClear = document.getElementById("keypadClear");
const keypadEnter = document.getElementById("keypadEnter");
const keyButtons = document.querySelectorAll(".key-btn[data-val]");

// Inputs
const newWorkspacePassInput = document.getElementById("newWorkspacePass");

// Sounds
const soundSelect = new Audio("assets/sounds/item_select.ogg");
function playSelectSound() {
    soundSelect.currentTime = 0;
    soundSelect.play().catch(() => {});
}
// =========================
// HELPERS
// =========================
function uid(player) {
    return player.name;
}

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function showToast(text) {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add("show");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toastEl.classList.remove("show"), 1500);
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function customConfirm(title, text, confirmLabel = "Proceed", isWarn = true) {
    return new Promise((resolve) => {
        confirmModalTitle.textContent = title;
        confirmModalText.innerHTML = text;
        confirmProceedBtn.textContent = confirmLabel;

        if (isWarn) {
            confirmProceedBtn.classList.add("warn");
            confirmProceedBtn.classList.remove("primary");
        } else {
            confirmProceedBtn.classList.remove("warn");
            confirmProceedBtn.classList.add("primary");
        }

        dynamicConfirmModal.classList.add("show");

        const cleanup = () => {
            dynamicConfirmModal.classList.remove("show");
            confirmCancelBtn.removeEventListener("click", onCancel);
            confirmProceedBtn.removeEventListener("click", onConfirm);
        };

        const onCancel = () => {
            cleanup();
            resolve(false);
        };

        const onConfirm = () => {
            cleanup();
            resolve(true);
        };

        confirmCancelBtn.addEventListener("click", onCancel);
        confirmProceedBtn.addEventListener("click", onConfirm);
    });
}

function getPlayerById(id) {
    return masterPlayers.find(p => uid(p) === id) || null;
}

function getCommanders() {
    return masterPlayers.filter(p => p.group === "Commander");
}

function getNonCommanders() {
    return masterPlayers.filter(p => p.group !== "Commander");
}

function roleClass(role) {
    return String(role || "").toLowerCase();
}

function sortPlayersByPower(arr) {
    arr.sort((a, b) => {
        if ((b.power || 0) !== (a.power || 0)) return (b.power || 0) - (a.power || 0);
        return a.name.localeCompare(b.name);
    });
}

function sortPlayersByName(arr) {
    arr.sort((a, b) => a.name.localeCompare(b.name));
}

function averagePower(players) {
    if (!players.length) return 0;
    const total = players.reduce((sum, p) => sum + (p.power || 0), 0);
    return (total / players.length).toFixed(1);
}

function teamTotalPower(teamArr) {
    return teamArr.reduce((sum, p) => sum + (p.power || 0), 0);
}

function countLabel(n) {
    return `${n} player${n !== 1 ? "s" : ""}`;
}

function normalizeState() {
    const seen = new Set();

    for (const cat of CATEGORIES) {
        const arr = Array.isArray(state.categories[cat]) ? state.categories[cat] : [];
        state.categories[cat] = arr.filter(p => {
            const id = uid(p);
            if (!getPlayerById(id)) return false; // remove deleted players
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
        });
    }

    state.pool = (Array.isArray(state.pool) ? state.pool : []).filter(p => {
        const id = uid(p);
        if (!getPlayerById(id)) return false; // remove deleted players
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
    });

    for (const p of getNonCommanders()) {
        const id = uid(p);
        if (!seen.has(id)) {
            state.pool.push(deepClone(p));
            seen.add(id);
        }
    }

    // NEVER allow commanders inside pool/teams
    state.pool = state.pool.filter(p => p.group !== "Commander");
    for (const cat of CATEGORIES) {
        state.categories[cat] = state.categories[cat].filter(p => p.group !== "Commander");
    }
}

function initializeDefaultState() {
    // Reset categories
    for (const cat of CATEGORIES) {
        state.categories[cat] = [];
    }
    // Put non-commanders in pool, commanders are separate
    state.pool = masterPlayers.filter(p => p.group !== "Commander").map(p => deepClone(p));
}
function buildSharedPayload() {
    normalizeState();
    const password = sessionStorage.getItem(`ctc_auth_${activeWorkspace}`);

    return {
        version: 1,
        masterPlayers: deepClone(masterPlayers),
        pool: deepClone(state.pool),
        categories: deepClone(state.categories),
        updatedAt: Date.now(),
        password: password || null
    };
}

function buildStateSignature(payloadLike = null) {
    const src = payloadLike || {
        masterPlayers,
        pool: state.pool,
        categories: state.categories
    };

    return JSON.stringify({
        masterPlayers: src.masterPlayers,
        pool: src.pool,
        categories: src.categories
    });
}

function isValidPlayerLike(obj) {
    return obj &&
        typeof obj.name === "string" &&
        typeof obj.role === "string" &&
        Number.isFinite(Number(obj.power)) &&
        typeof obj.group === "string";
}

function applySharedPayload(payload, options = {}) {
    const {
        saveToLocal = true,
        silent = false
    } = options;

    if (!payload || typeof payload !== "object") {
        throw new Error("Invalid shared payload");
    }

    const incomingPlayers = Array.isArray(payload.masterPlayers) ? payload.masterPlayers : null;
    const incomingPool = Array.isArray(payload.pool) ? payload.pool : null;
    const incomingCategories = payload.categories && typeof payload.categories === "object"
        ? payload.categories
        : null;

    if (!incomingPlayers || !incomingPool || !incomingCategories) {
        throw new Error("Shared payload missing required fields");
    }

    const cleanedPlayers = incomingPlayers
        .filter(isValidPlayerLike)
        .map(p => ({
            name: String(p.name).trim(),
            role: String(p.role).trim(),
            power: Number(p.power) || 0,
            group: String(p.group).trim(),
            note: String(p.note || "")
        }));

    if (!cleanedPlayers.length) {
        throw new Error("Shared payload has no valid players");
    }

    const seenNames = new Set();
    const dedupedPlayers = cleanedPlayers.filter(p => {
        const id = uid(p);
        if (!id || seenNames.has(id)) return false;
        seenNames.add(id);
        return true;
    });

    isApplyingRemoteState = true;

    masterPlayers = dedupedPlayers;

    state.pool = incomingPool
        .filter(p => p && typeof p.name === "string")
        .map(p => deepClone(p));

    for (const cat of CATEGORIES) {
        const arr = Array.isArray(incomingCategories[cat]) ? incomingCategories[cat] : [];
        state.categories[cat] = arr
            .filter(p => p && typeof p.name === "string")
            .map(p => deepClone(p));
    }

    normalizeState();

    if (saveToLocal) {
        saveMasterPlayers();
        saveSharedStateDebounced();
        saveState();
        saveSharedStateDebounced();
    }

    lastSharedUpdatedAt = Number(payload.updatedAt) || Date.now();
    lastSavedSignature = buildStateSignature();
    lastAppliedRemoteSignature = lastSavedSignature;

    render();

    isApplyingRemoteState = false;

    if (!silent) {
        showToast("Shared state updated");
    }
}

async function fetchSharedState() {
    if (!activeWorkspace) return null;
    try {
        const res = await fetch(`${SHARED_STATE_API}?workspace=${encodeURIComponent(activeWorkspace)}`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            cache: "no-store"
        });

        if (!res.ok) {
            throw new Error(`GET shared state failed: ${res.status}`);
        }

        const json = await res.json();
        return json?.data || null;
    } catch (e) {
        console.warn("fetchSharedState failed", e);
        return null;
    }
}

async function saveSharedStateOnline(force = false) {
    if (isApplyingRemoteState || !activeWorkspace) return;

    const payload = buildSharedPayload();
    const signature = buildStateSignature(payload);

    // Update UI Feedback
    if (uploadBtnText) uploadBtnText.textContent = "Uploading...";
    if (uploadPlanBtn) uploadPlanBtn.disabled = true;

    const password = sessionStorage.getItem(`ctc_auth_${activeWorkspace}`);
    const url = `${SHARED_STATE_API}?workspace=${encodeURIComponent(activeWorkspace)}${password ? `&password=${encodeURIComponent(password)}` : ""}`;

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error(`POST shared state failed: ${res.status}`);
        }

        const json = await res.json();
        const saved = json?.data || payload;

        lastSharedUpdatedAt = Number(saved.updatedAt) || payload.updatedAt;
        lastSavedSignature = signature;
        showToast("Plan uploaded to server!");
    } finally {
        if (uploadBtnText) uploadBtnText.textContent = "Upload Plan";
        if (uploadPlanBtn) uploadPlanBtn.disabled = false;
    }
}

async function loadSharedStateOnStartup(password = null) {
    if (!activeWorkspace) return;

    try {
        const url = `${SHARED_STATE_API}?workspace=${encodeURIComponent(activeWorkspace)}${password ? `&password=${encodeURIComponent(password)}` : ""}`;
        const res = await fetch(url, { cache: "no-store" });
        const json = await res.json();

        if (json.ok && json.data) {
            if (json.data.requiresPassword) {
                sessionStorage.setItem("ctc_auth_error", "Access Denied: Incorrect or missing password.");
                setTimeout(() => {
                    window.location.href = window.location.pathname;
                }, 100);
                return false;
            }

            // Valid data fetched - apply it
            const data = json.data;
            masterPlayers = data.masterPlayers || deepClone(DEFAULT_PLAYERS);
            state.pool = data.pool || [];
            state.categories = data.categories || {};
            
            saveMasterPlayers();
            saveState();
            render();
            showToast(`Remote data sync: ${activeWorkspace}`);
            return true;
        }
        return false;
    } catch (err) {
        console.error("Failed to load shared state:", err);
        return false;
    }
}

// Remove Debounce usage as we want manual now
function saveSharedStateDebounced() {
    // We do nothing here now, or we could just save to localStorage
}

async function showTacticalKeypad() {
    return new Promise((resolve) => {
        let currentInput = "";
        const digits = keypadDisplay.querySelectorAll(".digit");
        
        const updateDisplay = () => {
            digits.forEach((d, i) => {
                if (i < currentInput.length) {
                    d.classList.add("filled");
                    // Show digit briefly then mask
                    if (i === currentInput.length - 1) {
                        d.textContent = currentInput[i];
                        setTimeout(() => {
                            if (currentInput.length > i) d.textContent = "*";
                        }, 400);
                    } else {
                        d.textContent = "*";
                    }
                } else {
                    d.classList.remove("filled");
                    d.textContent = "";
                }
            });
        };

        const onKeyPress = (e) => {
            const val = e.target.getAttribute("data-val");
            if (currentInput.length < 6) {
                currentInput += val;
                playSelectSound();
                updateDisplay();
            }
        };

        const onClear = () => {
            currentInput = "";
            playSelectSound();
            updateDisplay();
        };

        const onEnter = () => {
            if (currentInput.length === 6) {
                cleanup();
                resolve(currentInput);
            } else {
                showToast("6 DIGITS REQUIRED");
            }
        };

        const onCancel = () => {
            cleanup();
            resolve(null);
        };

        const cleanup = () => {
            keypadModal.classList.remove("show");
            keyButtons.forEach(b => b.removeEventListener("click", onKeyPress));
            keypadClear.removeEventListener("click", onClear);
            keypadEnter.removeEventListener("click", onEnter);
            keypadCancelBtn.removeEventListener("click", onCancel);
        };

        keyButtons.forEach(b => b.addEventListener("click", onKeyPress));
        keypadClear.addEventListener("click", onClear);
        keypadEnter.addEventListener("click", onEnter);
        keypadCancelBtn.addEventListener("click", onCancel);

        keypadModal.classList.add("show");
        updateDisplay();
    });
}

async function fetchAllWorkspaces() {
    try {
        const res = await fetch(SHARED_STATE_API);
        if (!res.ok) throw new Error("Failed to fetch workspaces");
        const json = await res.json();
        return json.ok ? json.data : [];
    } catch (e) {
        console.error("fetchAllWorkspaces error:", e);
        return [];
    }
}

function startSharedSyncPolling() {
    // Disabled for now as per user request to use manual upload
    // But we could poll for remote changes if we want real-time view
    /*
    clearInterval(sharedSyncTimer);
    sharedSyncTimer = setInterval(() => {
        pollSharedState();
    }, SHARED_SYNC_INTERVAL_MS);
    */
}
function saveState() {
    normalizeState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        pool: state.pool,
        categories: state.categories
    }));
}

function saveMasterPlayers() {
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(masterPlayers));
}

function loadMasterPlayers() {
    try {
        const raw = localStorage.getItem(PLAYER_STORAGE_KEY);

        if (!raw) {
            masterPlayers = deepClone(DEFAULT_PLAYERS);
            saveMasterPlayers();
            saveSharedStateDebounced();
            return;
        }

        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
            masterPlayers = parsed;
        } else {
            masterPlayers = deepClone(DEFAULT_PLAYERS);
            saveMasterPlayers();
            saveSharedStateDebounced();
        }
    } catch (e) {
        console.warn("Failed to load master players", e);
        masterPlayers = deepClone(DEFAULT_PLAYERS);
        saveMasterPlayers();
        saveSharedStateDebounced();
    }
}

function initializeDefaultState() {
    const defaultAttack1Names = new Set([
        "Cloud",
        "ChrOnoA",
        "Reanimation",
        "StarFire",
        "DARKNESS",
        "Queensy",
        "Xin",
        "OPPAPS",
        "Hanzel",
        "Blu",
        "Tormenta",
        "DL"
    ]);

    // Tormenta removed here because already in Attack team 1
    // Bhuko removed because not in data
    const defaultBeacon2Names = new Set([
        "Rin-Rin",
        "JVLY",
        "Silver-Hand",
        "XOX",
        "6ixtY-9ine",
        "Vampk",
        "FixyFoxy",
        "ZELLA"
    ]);

    const defaultFreeRunNames = new Set([
        "Lascreia",
        "桃猫"
    ]);

    const defaultDestroyBaseNames = new Set([
        "Valkyre"
    ]);

    state.pool = [];
    for (const cat of CATEGORIES) state.categories[cat] = [];

    getNonCommanders().forEach(p => {
        const player = deepClone(p);

        if (defaultAttack1Names.has(p.name)) {
            state.categories["Attack team 1"].push(player);
        } else if (defaultBeacon2Names.has(p.name)) {
            state.categories["Beacon team 2"].push(player);
        } else if (defaultFreeRunNames.has(p.name)) {
            state.categories["Free run"].push(player);
        } else if (defaultDestroyBaseNames.has(p.name)) {
            state.categories["Destroying their base"].push(player);
        } else {
            state.pool.push(player);
        }
    });

    normalizeState();
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            initializeDefaultState();
            return;
        }

        const parsed = JSON.parse(raw);
        state.pool = Array.isArray(parsed.pool) ? parsed.pool : [];

        for (const cat of CATEGORIES) {
            state.categories[cat] = Array.isArray(parsed.categories?.[cat]) ? parsed.categories[cat] : [];
        }

        normalizeState();
    } catch (e) {
        console.warn("Failed to load state", e);
        initializeDefaultState();
    }
}

function removePlayerEverywhere(playerId) {
    state.pool = state.pool.filter(p => uid(p) !== playerId);
    for (const cat of CATEGORIES) {
        state.categories[cat] = state.categories[cat].filter(p => uid(p) !== playerId);
    }
}

function movePlayer(playerId, targetCategory, shouldRender = true) {
    const player = getPlayerById(playerId);
    if (!player || player.group === "Commander") return;

    removePlayerEverywhere(playerId);

    if (targetCategory === "pool") {
        state.pool.push(deepClone(player));
    } else if (state.categories[targetCategory]) {
        state.categories[targetCategory].push(deepClone(player));
    }

    normalizeState();
    saveState();
    saveSharedStateDebounced();
    if (shouldRender) render();
}

function clearTeamsOnly() {
    const allBack = [];
    for (const cat of CATEGORIES) {
        allBack.push(...state.categories[cat]);
        state.categories[cat] = [];
    }
    state.pool.push(...allBack);
    normalizeState();
    saveState();
    saveSharedStateDebounced();
    render();
    showToast("Teams cleared");
}

function resetAll() {
    initializeDefaultState();
    saveState();
    saveSharedStateDebounced();
    render();
    showToast("Reset complete");
}

function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function randomSplit() {
    const all = getNonCommanders().map(p => deepClone(p));
    const shuffled = shuffleArray(all);

    state.pool = [];
    for (const cat of CATEGORIES) state.categories[cat] = [];

    shuffled.forEach((player, idx) => {
        const cat = CATEGORIES[idx % CATEGORIES.length];
        state.categories[cat].push(player);
    });

    saveState();
    saveSharedStateDebounced();
    render();
    showToast("Random split complete");
}

function smartSplit() {
    const all = getNonCommanders().map(p => deepClone(p));

    all.sort((a, b) => {
        if ((b.power || 0) !== (a.power || 0)) return (b.power || 0) - (a.power || 0);
        return a.name.localeCompare(b.name);
    });

    const buckets = {
        "Attack team 1": [],
        "Beacon team 2": [],
        "Free run": [],
        "Destroying their base": []
    };

    all.forEach(player => {
        let target = CATEGORIES[0];
        let minPower = teamTotalPower(buckets[target]);

        for (const cat of CATEGORIES) {
            const p = teamTotalPower(buckets[cat]);
            if (p < minPower) {
                minPower = p;
                target = cat;
            } else if (p === minPower) {
                if (buckets[cat].length < buckets[target].length) {
                    target = cat;
                }
            }
        }

        buckets[target].push(player);
    });

    state.pool = [];
    for (const cat of CATEGORIES) {
        state.categories[cat] = buckets[cat];
    }

    saveState();
    saveSharedStateDebounced();
    render();
    showToast("Smart split complete");
}

function sortAllTeamsByPower() {
    for (const cat of CATEGORIES) sortPlayersByPower(state.categories[cat]);
    saveState();
    saveSharedStateDebounced();
    render();
    showToast("Sorted by power");
}

function sortAllTeamsByName() {
    for (const cat of CATEGORIES) sortPlayersByName(state.categories[cat]);
    saveState();
    saveSharedStateDebounced();
    render();
    showToast("Sorted by name");
}

// =========================
// RENDER
// =========================
function buildCommanderItem(player) {
    const el = document.createElement("div");
    el.className = "commander-item";
    el.innerHTML = `
        <div class="chip-main">
          <div class="commander-name">${escapeHtml(player.name)}</div>
        </div>
        <div class="chip-main">
          <span class="tag commander">Commander</span>
          <span class="tag ${roleClass(player.role)}">${escapeHtml(player.role)}</span>
          <span class="tag power">${escapeHtml(String(player.power))}</span>
        </div>
    `;
    return el;
}

function buildChip(player, location) {
    const chip = document.createElement("div");
    chip.className = "chip" + (player.group === "Commander" ? " commander" : "");
    chip.draggable = player.group !== "Commander";
    chip.dataset.playerId = uid(player);
    chip.dataset.location = location;

    chip.innerHTML = `
        <div class="chip-main">
          <span class="chip-name">${escapeHtml(player.name)}</span>
          <span class="tag ${roleClass(player.role)}">${escapeHtml(player.role)}</span>
          <span class="tag power">${escapeHtml(String(player.power))}</span>
          ${player.group === "Commander" ? `<span class="tag commander">Commander</span>` : ""}
        </div>
        <div class="chip-actions">
          ${location !== "pool" ? `<button class="chip-btn" title="Return to pool">×</button>` : ""}
        </div>
    `;

    if (player.group !== "Commander") {
        chip.addEventListener("dragstart", (e) => {
            state.draggingId = uid(player);
            chip.classList.add("dragging");
            e.dataTransfer.setData("text/plain", uid(player));
        });

        chip.addEventListener("dragend", () => {
            chip.classList.remove("dragging");
        });

        chip.addEventListener("dblclick", () => {
            if (location !== "pool") movePlayer(uid(player), "pool");
        });
    }

    const removeBtn = chip.querySelector(".chip-btn");
    if (removeBtn) {
        removeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            movePlayer(uid(player), "pool");
        });
    }

    return chip;
}

function renderCommanders() {
    if (!commanderListEl || !commanderCountEl) return;

    const commanders = getCommanders();
    commanderListEl.innerHTML = "";
    commanders.forEach(p => commanderListEl.appendChild(buildCommanderItem(p)));
    commanderCountEl.textContent = countLabel(commanders.length);
}

function renderPool() {
    if (!poolChipsEl || !poolCountEl) return;

    const keyword = (searchInput?.value || "").trim().toLowerCase();
    const role = roleFilter?.value || "";

    poolChipsEl.innerHTML = "";

    const filtered = state.pool.filter(p => {
        const matchText =
            p.name.toLowerCase().includes(keyword) ||
            p.role.toLowerCase().includes(keyword) ||
            p.group.toLowerCase().includes(keyword) ||
            (p.note || "").toLowerCase().includes(keyword);

        const matchRole = !role || p.role === role;
        return matchText && matchRole;
    });

    filtered.forEach(player => {
        poolChipsEl.appendChild(buildChip(player, "pool"));
    });

    poolCountEl.textContent = countLabel(state.pool.length);

    if (!filtered.length) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = keyword || role
            ? "No matching players found"
            : "No players left in Available Players";
        poolChipsEl.appendChild(empty);
    }
}

function renderCategories() {
    document.querySelectorAll('.drop-zone[data-category]').forEach(zone => {
        const category = zone.dataset.category;
        if (category === "pool") return;

        const chipsWrap = zone.querySelector(".chips");
        if (!chipsWrap) return;

        chipsWrap.innerHTML = "";

        const players = state.categories[category] || [];

        players.forEach(player => {
            chipsWrap.appendChild(buildChip(player, category));
        });

        const countEl = document.querySelector(`[data-count-for="${CSS.escape(category)}"]`);
        if (countEl) countEl.textContent = countLabel(players.length);

        const sumCount = document.querySelector(`[data-summary-count="${CSS.escape(category)}"]`);
        if (sumCount) sumCount.textContent = players.length;

        const sumPower = document.querySelector(`[data-summary-power="${CSS.escape(category)}"]`);
        if (sumPower) sumPower.textContent = averagePower(players);

        if (!players.length) {
            const empty = document.createElement("div");
            empty.className = "empty-state";
            empty.innerHTML = `
                Drop players here<br>
                <span style="font-size:11px; opacity:.8;">or use the + button for quick selection</span>
            `;
            chipsWrap.appendChild(empty);
        }
    });
}

function render() {
    normalizeState();
    renderCommanders();
    renderPool();
    renderCategories();
}

// =========================
// COPY RESULT
// =========================
function copyResult() {
    const lines = [];
    const commanders = getCommanders();

    lines.push(`Commander (${commanders.length}):`);
    commanders.forEach((p) => {
        let line = `${p.name} **(${p.role} - ${p.power})**`;
        if (p.note) line += ` (${p.note})`;
        lines.push(line);
    });

    lines.push("");

    CATEGORIES.forEach((cat) => {
        const arr = state.categories[cat] || [];

        lines.push(`${cat} (${arr.length}):`);

        if (!arr.length) {
            lines.push(`- (empty)`);
        } else {
            arr.forEach((p) => {
                let line = `${p.name} - **(${p.role} - ${p.power})**`;
                if (p.note) line += ` (${p.note})`;
                lines.push(line);
            });
        }

        lines.push("");
    });

    lines.push(`Unassigned / Bench (${state.pool.length}):`);
    if (!state.pool.length) {
        lines.push(`- (none)`);
    } else {
        state.pool.forEach((p) => {
            let line = `${p.name} **(${p.role} - ${p.power})**`;
            if (p.note) line += ` (${p.note})`;
            lines.push(line);
        });
    }

    const text = lines.join("\n");

    navigator.clipboard.writeText(text)
        .then(() => {
            showToast("Plan copied");
            showCopySuccess();
        })
        .catch(() => {
            alert("Copy failed.\n\n" + text);
        });
}
function showCopySuccess() {
    if (!copyBtn) return;

    clearTimeout(showCopySuccess._timer);

    const textSpan = copyBtn.querySelector("span:last-child");
    const iconEl = copyBtn.querySelector(".btn-icon i");

    if (!copyBtn.dataset.originalText) {
        copyBtn.dataset.originalText = textSpan ? textSpan.textContent : copyBtn.textContent;
    }

    if (textSpan) {
        textSpan.textContent = "Copied!";
    } else {
        copyBtn.textContent = "Copied!";
    }

    if (iconEl) {
        iconEl.className = "fa-solid fa-check";
    }

    copyBtn.classList.add("copied");

    showCopySuccess._timer = setTimeout(() => {
        if (textSpan) {
            textSpan.textContent = copyBtn.dataset.originalText || "Copy Plan";
        } else {
            copyBtn.textContent = copyBtn.dataset.originalText || "Copy Plan";
        }

        if (iconEl) {
            iconEl.className = "fa-solid fa-copy";
        }

        copyBtn.classList.remove("copied");
    }, 3000);
}
// =========================
// DRAG & DROP
// =========================
dropZones.forEach(zone => {
    zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        zone.classList.add("drag-over");
    });

    zone.addEventListener("dragleave", () => {
        zone.classList.remove("drag-over");
    });

    zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("drag-over");

        const playerId = e.dataTransfer.getData("text/plain") || state.draggingId;
        const targetCategory = zone.dataset.category;

        if (!playerId || !targetCategory) return;
        movePlayer(playerId, targetCategory);
    });
});

// =========================
// MODAL - PICKER
// =========================
function renderModalList(keyword = "") {
    if (!checkGrid) return;

    checkGrid.innerHTML = "";

    const role = roleFilter?.value || "";
    const kw = keyword.toLowerCase();

    const available = state.pool.filter(p => {
        const matchText =
            p.name.toLowerCase().includes(kw) ||
            p.role.toLowerCase().includes(kw) ||
            p.group.toLowerCase().includes(kw) ||
            (p.note || "").toLowerCase().includes(kw);

        const matchRole = !role || p.role === role;
        return matchText && matchRole;
    });

    if (!available.length) {
        const empty = document.createElement("div");
        empty.className = "modal-empty";
        empty.textContent = keyword || role
            ? "No matching players found"
            : "No players left in Available Players";
        checkGrid.appendChild(empty);
        return;
    }

    available.forEach(player => {
        const safeId = uid(player)
            .replace(/\s+/g, "_")
            .replace(/[^\w\-]/g, "");
        const id = `pick_${safeId}_${Math.random().toString(36).slice(2, 6)}`;

        const label = document.createElement("label");
        label.className = "check-item";
        label.innerHTML = `
            <input type="checkbox" value="${escapeHtml(uid(player))}" id="${id}" />
            <div class="check-main">
                <span class="check-name">${escapeHtml(player.name)}</span>
                <span class="tag ${roleClass(player.role)}">${escapeHtml(player.role)}</span>
                <span class="tag power">${escapeHtml(String(player.power))}</span>
            </div>
        `;
        checkGrid.appendChild(label);
    });
}

function openPicker(category) {
    if (!pickerModal || !modalTitle || !modalSearch) return;

    state.modalTargetCategory = category;
    modalTitle.textContent = `Add players → ${category}`;
    modalSearch.value = "";
    renderModalList("");
    pickerModal.classList.add("show");
    document.body.style.overflow = "hidden";
    setTimeout(() => modalSearch.focus(), 50);
}

function closePicker() {
    if (!pickerModal) return;
    pickerModal.classList.remove("show");
    document.body.style.overflow = "";
    state.modalTargetCategory = null;
}

// =========================
// MODAL - VIDEO
// =========================
function openVideoModal() {
    if (!videoModal) return;
    videoModal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.remove("show");
    document.body.style.overflow = "";

    if (planVideo) {
        planVideo.pause();
    }
}

// =========================
// MODAL - SCORE CALCULATOR
// =========================
let scoreCalcLanguage = "vi";
let lastScoreAnalysis = null;

const SCORE_CALC_I18N = {
    vi: {
        title: "PHÂN TÍCH ĐIỂM BASE",
        subtitle: "Tool tính nhanh phút 20 offensive / defending. Mốc thắng: 10,000. Phá base sẽ ăn cắp 20% điểm hiện tại của đối thủ.",
        ourScore: "Điểm bên mình",
        enemyScore: "Điểm đối thủ",
        analyze: "Phân tích",
        close: "Đóng",
        empty: "Nhập điểm hai đội, rồi phân tích xem nên phá trước hay thủ chờ phản phá sau.",
        missing: "Hãy nhập điểm của cả hai đội trước khi phân tích.",
        recBreakFirst: "Nên cân nhắc phá base trước",
        recWaitCounter: "Nên thủ và chờ phản phá sau",
        recNeutral: "Hai lựa chọn gần như ngang nhau",
        waitBetter: "Chờ phản phá sau tốt hơn khoảng <strong>{score}</strong> điểm cho bên mình.",
        breakBetter: "Phá trước tốt hơn khoảng <strong>{score}</strong> điểm cho bên mình.",
        sameValue: "Hai hướng cho bên mình cùng mức lợi điểm.",
        ourFirstTitle: "Mình phá trước, địch phá sau",
        enemyFirstTitle: "Địch phá trước, mình phá sau",
        firstSteal: "Phá lần 1 lấy cắp <b>{score}</b> điểm.",
        afterFirst: "Sau phá lần 1: mình <b>{our}</b> / địch <b>{enemy}</b>.",
        counterSteal: "Đội phản phá sau lấy cắp <b>{score}</b> điểm.",
        finalOur: "Final mình",
        finalEnemy: "Final địch",
        winnerOur: "Bên mình đang lợi thế",
        winnerEnemy: "Đối thủ đang lợi thế",
        winnerTieMax: "Cả hai chạm mốc 10k",
        winnerTie: "Đang cân bằng",
    },
    en: {
        title: "BASE SCORE ANALYZER",
        subtitle: "Minute 20 offensive / defending quick calculator. Win target: 10,000. Base break steals 20% of opponent current score.",
        ourScore: "Our score",
        enemyScore: "Enemy score",
        analyze: "Analyze",
        close: "Close",
        empty: "Enter both scores, then analyze whether we should break first or wait to counter-break.",
        missing: "Please enter both scores before analyzing.",
        recBreakFirst: "Consider breaking base first",
        recWaitCounter: "Defend and wait to counter-break",
        recNeutral: "Both choices are nearly equal",
        waitBetter: "Waiting to counter-break is better for us by about <strong>{score}</strong> points.",
        breakBetter: "Breaking first is better for us by about <strong>{score}</strong> points.",
        sameValue: "Both options give us the same point value.",
        ourFirstTitle: "We break first, enemy breaks second",
        enemyFirstTitle: "Enemy breaks first, we break second",
        firstSteal: "First break steals <b>{score}</b> points.",
        afterFirst: "After first break: us <b>{our}</b> / enemy <b>{enemy}</b>.",
        counterSteal: "The counter-break steals <b>{score}</b> points.",
        finalOur: "Final us",
        finalEnemy: "Final enemy",
        winnerOur: "We are ahead",
        winnerEnemy: "Enemy is ahead",
        winnerTieMax: "Both teams hit 10k",
        winnerTie: "Still tied",
    },
};

function scoreText(key, values = {}) {
    const dict = SCORE_CALC_I18N[scoreCalcLanguage] || SCORE_CALC_I18N.vi;
    return (dict[key] || "").replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
}

function openScoreCalcModal() {
    if (!scoreCalcModal) return;
    updateScoreCalcLanguage();
    scoreCalcModal.classList.add("show");
    document.body.style.overflow = "hidden";
    setTimeout(() => ourScoreInput && ourScoreInput.focus(), 50);
}

function closeScoreCalcModal() {
    if (!scoreCalcModal) return;
    scoreCalcModal.classList.remove("show");
    document.body.style.overflow = "";
}

function getScoreCalculator() {
    return window.CTCScoreCalculator || null;
}

function scoreWinnerLabel(winner) {
    if (winner === "our") return scoreText("winnerOur");
    if (winner === "enemy") return scoreText("winnerEnemy");
    if (winner === "tie-max") return scoreText("winnerTieMax");
    return scoreText("winnerTie");
}

function scenarioToneClass(winner) {
    if (winner === "our") return "score-calc-scenario-safe";
    if (winner === "enemy") return "score-calc-scenario-danger";
    return "score-calc-scenario-neutral";
}

function recommendationText(recommendation) {
    if (recommendation === "break-first") {
        return scoreText("recBreakFirst");
    }
    if (recommendation === "wait-counter") {
        return scoreText("recWaitCounter");
    }
    return scoreText("recNeutral");
}

function buildScenarioHtml(title, scenario, formatter) {
    return `
        <div class="score-calc-scenario ${scenarioToneClass(scenario.final.winner)}">
            <h4>${title}</h4>
            <div class="score-calc-lines">
                <div>${scoreText("firstSteal", { score: formatter(scenario.afterFirst.steal) })}</div>
                <div>${scoreText("afterFirst", { our: formatter(scenario.afterFirst.our), enemy: formatter(scenario.afterFirst.enemy) })}</div>
                <div>${scoreText("counterSteal", { score: formatter(scenario.final.steal) })}</div>
                <div class="score-calc-score">
                    <span>${scoreText("finalOur")}: ${formatter(scenario.final.our)}</span>
                    <span>${scoreText("finalEnemy")}: ${formatter(scenario.final.enemy)}</span>
                </div>
                <div>${scoreWinnerLabel(scenario.final.winner)}</div>
            </div>
        </div>
    `;
}

function analyzeScoreCalculator() {
    const calculator = getScoreCalculator();
    if (!calculator || !scoreCalcResult) return;

    const ourScore = ourScoreInput ? ourScoreInput.value : "";
    const enemyScore = enemyScoreInput ? enemyScoreInput.value : "";
    const hasOurScore = String(ourScore).trim() !== "";
    const hasEnemyScore = String(enemyScore).trim() !== "";

    if (!hasOurScore || !hasEnemyScore) {
        lastScoreAnalysis = null;
        scoreCalcResult.innerHTML = `<div class="score-calc-warning">${scoreText("missing")}</div>`;
        return;
    }

    const analysis = calculator.analyzeBaseBreakStrategy(ourScore, enemyScore);
    lastScoreAnalysis = analysis;
    renderScoreAnalysis(analysis);
}

function renderScoreAnalysis(analysis) {
    const calculator = getScoreCalculator();
    if (!calculator || !scoreCalcResult || !analysis) return;

    const format = calculator.formatScore;
    const valueDiff = analysis.waitCounterValue - analysis.breakFirstValue;
    const diffLine = valueDiff > 0
        ? scoreText("waitBetter", { score: format(valueDiff) })
        : valueDiff < 0
            ? scoreText("breakBetter", { score: format(Math.abs(valueDiff)) })
            : scoreText("sameValue");

    scoreCalcResult.innerHTML = `
        <div class="score-calc-summary">
            <div><strong>${recommendationText(analysis.recommendation)}</strong></div>
            <div>${diffLine}</div>
        </div>
        <div class="score-calc-grid">
            ${buildScenarioHtml(scoreText("ourFirstTitle"), analysis.ourFirst, format)}
            ${buildScenarioHtml(scoreText("enemyFirstTitle"), analysis.enemyFirst, format)}
        </div>
    `;
}

function updateScoreCalcLanguage() {
    if (scoreCalcTitle) {
        scoreCalcTitle.innerHTML = `<i class="fa-solid fa-calculator" style="margin-right:8px;"></i>${scoreText("title")}`;
    }
    if (scoreCalcSubtitle) scoreCalcSubtitle.textContent = scoreText("subtitle");
    if (ourScoreLabel) ourScoreLabel.textContent = scoreText("ourScore");
    if (enemyScoreLabel) enemyScoreLabel.textContent = scoreText("enemyScore");
    if (analyzeScoreText) analyzeScoreText.textContent = scoreText("analyze");
    if (closeScoreCalcText) closeScoreCalcText.textContent = scoreText("close");
    if (scoreCalcEmptyText && !lastScoreAnalysis) scoreCalcEmptyText.textContent = scoreText("empty");

    scoreLangButtons.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.scoreLang === scoreCalcLanguage);
    });

    if (lastScoreAnalysis) renderScoreAnalysis(lastScoreAnalysis);
}

// =========================
// MODAL - MANAGE PLAYERS
// =========================
function resetPlayerForm() {
    if (!pmName || !pmRole || !pmPower || !pmGroup || !pmNote || !pmSaveBtn) return;

    state.editingPlayerId = null;
    pmName.value = "";
    pmRole.value = "Rifle";
    pmPower.value = "";
    pmGroup.value = "Elite";
    pmNote.value = "";
    pmSaveBtn.textContent = "Add";
}

function openPlayerManager() {
    if (!playerManagerModal) return;

    if (pmSelectAll) pmSelectAll.checked = false;
    if (pmDeleteSelectedBtn) pmDeleteSelectedBtn.classList.add("hidden");

    renderPlayerManagerList();
    resetPlayerForm();
    playerManagerModal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closePlayerManager() {
    if (!playerManagerModal) return;

    playerManagerModal.classList.remove("show");
    document.body.style.overflow = "";
    resetPlayerForm();
}

function updateDeleteSelectedBtn() {
    if (!pmDeleteSelectedBtn) return;
    const checked = pmList.querySelectorAll(".pm-select-row:checked").length;
    if (checked > 0) {
        pmDeleteSelectedBtn.textContent = `Delete Selected (${checked})`;
        pmDeleteSelectedBtn.classList.remove("hidden");
    } else {
        pmDeleteSelectedBtn.classList.add("hidden");
    }
}

function renderPlayerManagerList() {
    if (!pmList) return;

    if (pmSelectAll) pmSelectAll.checked = false;
    updateDeleteSelectedBtn();

    const keyword = (pmSearch?.value || "").trim().toLowerCase();
    pmList.innerHTML = "";

    const filtered = masterPlayers.filter(p => {
        return (
            p.name.toLowerCase().includes(keyword) ||
            p.role.toLowerCase().includes(keyword) ||
            p.group.toLowerCase().includes(keyword) ||
            String(p.power).includes(keyword) ||
            (p.note || "").toLowerCase().includes(keyword)
        );
    });

    if (!filtered.length) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "No players found";
        pmList.appendChild(empty);
        return;
    }

    filtered.forEach(player => {
        const row = document.createElement("div");
        row.className = "commander-item";
        row.innerHTML = `
            <div class="chip-main" style="flex-wrap: wrap; align-items: center; gap: 8px;">
                <input type="checkbox" class="pm-select-row" value="${escapeHtml(uid(player))}" style="cursor:pointer;" />
                <div class="commander-name">${escapeHtml(player.name)}</div>
                <span class="tag ${roleClass(player.role)}">${escapeHtml(player.role)}</span>
                <span class="tag power">${escapeHtml(String(player.power))}</span>
                <span class="tag">${escapeHtml(player.group)}</span>
                ${player.note ? `<span class="tag">${escapeHtml(player.note)}</span>` : ""}
            </div>
            <div class="chip-actions" style="gap:8px;">
                <button class="mini-btn" data-edit-player="${escapeHtml(uid(player))}">Edit</button>
                <button class="mini-btn" data-delete-player="${escapeHtml(uid(player))}">Delete</button>
            </div>
        `;
        pmList.appendChild(row);
    });

    // Handle single checkbox selection changes
    pmList.querySelectorAll(".pm-select-row").forEach(cb => {
        cb.addEventListener("change", () => {
            updateDeleteSelectedBtn();
        });
    });

    pmList.querySelectorAll("[data-edit-player]").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.editPlayer;
            const player = getPlayerById(id);
            if (!player) return;

            state.editingPlayerId = id;
            pmName.value = player.name;
            pmRole.value = player.role;
            pmPower.value = player.power;
            pmGroup.value = player.group;
            pmNote.value = player.note || "";
            pmSaveBtn.textContent = "Update";
        });
    });

    pmList.querySelectorAll("[data-delete-player]").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.deletePlayer;

            const ok = await customConfirm(
                "DELETE PLAYER?",
                `Are you sure you want to delete player <b>"${escapeHtml(id)}"</b>?`
            );
            if (!ok) return;

            masterPlayers = masterPlayers.filter(p => uid(p) !== id);
            removePlayerEverywhere(id);

            saveMasterPlayers();
            saveState();
            saveSharedStateDebounced();
            renderPlayerManagerList();
            render();

            if (state.editingPlayerId === id) {
                resetPlayerForm();
            }

            showToast("Player deleted");
        });
    });
}

function addOrUpdatePlayer() {
    if (!pmName || !pmRole || !pmPower || !pmGroup || !pmNote) return;

    const name = pmName.value.trim();
    const role = pmRole.value;
    const power = Number(pmPower.value);
    const group = pmGroup.value;
    const note = pmNote.value.trim();

    if (!name) {
        alert("Please enter player name");
        return;
    }

    if (!Number.isFinite(power) || power < 0) {
        alert("Please enter valid power");
        return;
    }

    const duplicate = masterPlayers.find(p => uid(p) === name);

    // ADD
    if (!state.editingPlayerId) {
        if (duplicate) {
            alert("Player name already exists");
            return;
        }

        const newPlayer = { name, role, power, group, note };
        masterPlayers.push(newPlayer);

        if (group !== "Commander") {
            state.pool.push(deepClone(newPlayer));
        }

        normalizeState();
        saveMasterPlayers();
        saveState();
        saveSharedStateDebounced();
        renderPlayerManagerList();
        render();
        resetPlayerForm();
        showToast("Player added");
        return;
    }

    // UPDATE
    const oldId = state.editingPlayerId;

    if (oldId !== name && duplicate) {
        alert("Another player with this name already exists");
        return;
    }

    const idx = masterPlayers.findIndex(p => uid(p) === oldId);
    if (idx === -1) return;

    const oldPlayer = masterPlayers[idx];
    const updatedPlayer = { name, role, power, group, note };
    masterPlayers[idx] = updatedPlayer;

    const replaceInArr = (arr) => arr.map(p => uid(p) === oldId ? deepClone(updatedPlayer) : p);

    state.pool = replaceInArr(state.pool);
    for (const cat of CATEGORIES) {
        state.categories[cat] = replaceInArr(state.categories[cat]);
    }

    // If changed to Commander => remove from pool/teams
    if (group === "Commander") {
        removePlayerEverywhere(name);
        if (oldId !== name) removePlayerEverywhere(oldId);
    }

    // If was Commander before and now not Commander => add to pool if missing
    if (oldPlayer.group === "Commander" && group !== "Commander") {
        const existsInPoolOrTeam =
            state.pool.some(p => uid(p) === name) ||
            CATEGORIES.some(cat => state.categories[cat].some(p => uid(p) === name));

        if (!existsInPoolOrTeam) {
            state.pool.push(deepClone(updatedPlayer));
        }
    }

    // If rename happened and old non-commander was not found anywhere, ensure still exists somewhere
    if (oldPlayer.group !== "Commander" && group !== "Commander") {
        const existsInPoolOrTeam =
            state.pool.some(p => uid(p) === name) ||
            CATEGORIES.some(cat => state.categories[cat].some(p => uid(p) === name));

        if (!existsInPoolOrTeam) {
            state.pool.push(deepClone(updatedPlayer));
        }
    }

    normalizeState();
    saveMasterPlayers();
    saveState();
    saveSharedStateDebounced();
    renderPlayerManagerList();
    render();
    resetPlayerForm();
    showToast("Player updated");
}

// =========================
// BUTTONS TO OPEN PICKER
// =========================
document.querySelectorAll("[data-open-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
        openPicker(btn.dataset.openModal);
    });
});

// =========================
// EVENTS
// =========================
if (searchInput) {
    searchInput.addEventListener("input", renderPool);
}

if (roleFilter) {
    roleFilter.addEventListener("change", () => {
        renderPool();
        if (pickerModal?.classList.contains("show")) {
            renderModalList(modalSearch?.value.trim() || "");
        }
    });
}

function closeMoreOptionsMenu() {
    if (moreOptionsMenu) moreOptionsMenu.classList.remove("show");
}

function bindMoreOption(button, action) {
    if (!button) return;
    button.addEventListener("click", () => {
        action();
        closeMoreOptionsMenu();
    });
}

bindMoreOption(smartSplitBtn, smartSplit);
bindMoreOption(randomSplitBtn, randomSplit);
bindMoreOption(sortPowerBtn, sortAllTeamsByPower);
bindMoreOption(sortNameBtn, sortAllTeamsByName);
if (copyBtn) copyBtn.addEventListener("click", copyResult);
if (resetBtn) resetBtn.addEventListener("click", resetAll);
if (clearTeamsBtn) clearTeamsBtn.addEventListener("click", clearTeamsOnly);

if (viewVideoBtn) {
    viewVideoBtn.addEventListener("click", openVideoModal);
}

if (closeVideoBtn) {
    closeVideoBtn.addEventListener("click", closeVideoModal);
}

if (videoModal) {
    videoModal.addEventListener("click", (e) => {
        if (e.target === videoModal) closeVideoModal();
    });
}

if (scoreCalcBtn) {
    scoreCalcBtn.addEventListener("click", openScoreCalcModal);
}

if (closeScoreCalcBtn) {
    closeScoreCalcBtn.addEventListener("click", closeScoreCalcModal);
}

if (analyzeScoreBtn) {
    analyzeScoreBtn.addEventListener("click", analyzeScoreCalculator);
}

scoreLangButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        scoreCalcLanguage = btn.dataset.scoreLang || "vi";
        updateScoreCalcLanguage();
    });
});

[ourScoreInput, enemyScoreInput].forEach(input => {
    if (!input) return;
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") analyzeScoreCalculator();
    });
});

if (scoreCalcModal) {
    scoreCalcModal.addEventListener("click", (e) => {
        if (e.target === scoreCalcModal) closeScoreCalcModal();
    });
}

if (modalSearch) {
    modalSearch.addEventListener("input", () => {
        renderModalList(modalSearch.value.trim());
    });
}

if (cancelModalBtn) {
    cancelModalBtn.addEventListener("click", closePicker);
}

if (pickerModal) {
    pickerModal.addEventListener("click", (e) => {
        if (e.target === pickerModal) closePicker();
    });
}

if (confirmModalBtn) {
    confirmModalBtn.addEventListener("click", () => {
        const target = state.modalTargetCategory;
        if (!target) return;

        const checked = [...checkGrid.querySelectorAll('input[type="checkbox"]:checked')]
            .map(input => input.value);

        if (!checked.length) {
            closePicker();
            return;
        }

        checked.forEach(playerId => movePlayer(playerId, target, false));
        saveState();
        render();
        closePicker();
        showToast(`Added ${checked.length} player(s)`);
    });
}

// Manage Players events
if (managePlayersBtn) {
    managePlayersBtn.addEventListener("click", openPlayerManager);
}

if (pmCloseBtn) {
    pmCloseBtn.addEventListener("click", closePlayerManager);
}

if (playerManagerModal) {
    playerManagerModal.addEventListener("click", (e) => {
        if (e.target === playerManagerModal) closePlayerManager();
    });
}

if (pmSearch) {
    pmSearch.addEventListener("input", renderPlayerManagerList);
}

if (pmSaveBtn) {
    pmSaveBtn.addEventListener("click", addOrUpdatePlayer);
}

if (pmSelectAll) {
    pmSelectAll.addEventListener("change", (e) => {
        const checked = e.target.checked;
        pmList.querySelectorAll(".pm-select-row").forEach(cb => {
            cb.checked = checked;
        });
        updateDeleteSelectedBtn();
    });
}

if (pmDeleteSelectedBtn) {
    pmDeleteSelectedBtn.addEventListener("click", async () => {
        const selectedCbs = pmList.querySelectorAll(".pm-select-row:checked");
        const selectedIds = [...selectedCbs].map(cb => cb.value);
        if (!selectedIds.length) return;

        const ok = await customConfirm(
            "DELETE SELECTED?",
            `Are you sure you want to delete the <b>${selectedIds.length}</b> selected player(s)?`
        );
        if (!ok) return;

        selectedIds.forEach(id => {
            masterPlayers = masterPlayers.filter(p => uid(p) !== id);
            removePlayerEverywhere(id);
        });

        saveMasterPlayers();
        saveState();
        saveSharedStateDebounced();
        renderPlayerManagerList();
        render();

        // If currently editing one of the deleted players, reset the form
        if (state.editingPlayerId && selectedIds.includes(state.editingPlayerId)) {
            resetPlayerForm();
        }

        showToast(`Deleted ${selectedIds.length} player(s)`);
    });
}

if (pmDeleteAllBtn) {
    pmDeleteAllBtn.addEventListener("click", async () => {
        if (!masterPlayers.length) {
            showToast("No players to delete");
            return;
        }

        const ok = await customConfirm(
            "DELETE ALL PLAYERS?",
            `Are you sure you want to permanently delete <b>ALL ${masterPlayers.length}</b> players?<br/>This will clear the entire list. You can reset to defaults later if needed.`
        );
        if (!ok) return;

        masterPlayers = [];
        state.pool = [];
        for (const cat of CATEGORIES) {
            state.categories[cat] = [];
        }

        saveMasterPlayers();
        saveState();
        saveSharedStateDebounced();
        renderPlayerManagerList();
        render();
        resetPlayerForm();

        showToast("All players deleted");
    });
}

if (pmResetDefaultBtn) {
    pmResetDefaultBtn.addEventListener("click", async () => {
        const ok = await customConfirm(
            "RESET PLAYERS?",
            "This will revert the player list to default version. <br/>All your custom additions will be lost."
        );
        if (!ok) return;

        masterPlayers = deepClone(DEFAULT_PLAYERS);
        saveMasterPlayers();
        initializeDefaultState();
        saveState();
        saveSharedStateDebounced();
        renderPlayerManagerList();
        render();
        resetPlayerForm();
        showToast("Players reset to default");
    });
}
if (moreOptionsBtn && moreOptionsMenu) {
    moreOptionsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        moreOptionsMenu.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
        if (!moreOptionsWrap.contains(e.target)) {
            moreOptionsMenu.classList.remove("show");
        }
    });
}

bindMoreOption(mobileResetBtn, resetAll);
// =========================
// WORKSPACE BROWSER LOGIC
// =========================
async function initWorkspaceFlow() {
    const params = new URLSearchParams(window.location.search);
    activeWorkspace = params.get("workspace");

    if (activeWorkspace) {
        document.title = `CTC Planner - ${activeWorkspace}`;
        const displayLabel = activeWorkspace === "Main-Plan" ? "Public Plan" : activeWorkspace;
        activeWorkspaceBadge.innerHTML = `<i class="fa-solid fa-terminal"></i> WORKSPACE: ${escapeHtml(displayLabel)}`;
        activeWorkspaceBadge.classList.remove("hidden");
        
        loadMasterPlayers();
        loadState();
        render();

        // Check if password is in URL parameters first
        let password = params.get("password");
        if (password) {
            sessionStorage.setItem(`ctc_auth_${activeWorkspace}`, password);
            // Clean it from the URL without reloading the page
            params.delete("password");
            const newUrl = `${window.location.pathname}?${params.toString()}`;
            window.history.replaceState({}, document.title, newUrl);
        } else {
            password = sessionStorage.getItem(`ctc_auth_${activeWorkspace}`);
        }

        const success = await loadSharedStateOnStartup(password);

        if (success) {
            workspaceBrowser.classList.add("hidden");
            mainApp.classList.remove("hidden");
            mainApp.classList.add("app-fade-in");
            
            // Trigger tutorial only when workspace is ready
            window.dispatchEvent(new Event("ctc:workspace-ready"));
        } else {
            // Failed or requires password - handled inside loadSharedStateOnStartup or redirect
        }
    } else {
        showWorkspaceBrowser();
        const authError = sessionStorage.getItem("ctc_auth_error");
        if (authError) {
            showToast(authError);
            sessionStorage.removeItem("ctc_auth_error");
        }
    }
}

// fetchAllWorkspaces moved to top section

async function showWorkspaceBrowser() {
    workspaceBrowser.classList.remove("hidden");
    mainApp.classList.add("hidden");
    workspaceList.innerHTML = `
        <div style="text-align:center; grid-column: 1/-1; padding: 40px;">
            <div class="loading-spinner"></div>
            <p style="margin-top:15px; color:var(--cyan); letter-spacing:2px;">SCANNING TACTICAL DATA...</p>
        </div>
    `;

    const list = await fetchAllWorkspaces();
    renderWorkspaceList(list);
}

function renderWorkspaceList(list) {
    if (!list.length) {
        workspaceList.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; padding: 40px;">
                <i class="fa-solid fa-folder-open" style="font-size: 48px; margin-bottom: 20px; opacity: 0.2;"></i>
                <p>No tactical plans found in cloud storage.</p>
                <p style="font-size: 12px; margin-top: 10px;">Initialize your first team workspace below to get started.</p>
            </div>
        `;
        return;
    }

    workspaceList.innerHTML = list.map(ws => {
        const date = new Date(ws.uploadedAt).toLocaleString();
        const isLegacy = ws.name === "Main-Plan";
        const displayName = ws.displayName || (isLegacy ? "Public Plan" : ws.name);
        
        return `
            <div class="wb-card ${isLegacy ? 'legacy-card' : ''}" onclick="window.handleWorkspaceSelection(event, '${ws.name}', ${ws.protected})">
                <div class="wb-name">
                    ${isLegacy ? '<i class="fa-solid fa-star" style="color:var(--amber); margin-right:8px;"></i>' : '<i class="fa-solid fa-folder" style="margin-right:8px; opacity:0.6;"></i>'}
                    ${escapeHtml(displayName)}
                    ${ws.protected ? '<i class="fa-solid fa-lock protected-badge" title="Password Protected"></i>' : ''}
                </div>
                ${ws.note ? `<div class="wb-note">${escapeHtml(ws.note)}</div>` : ''}
                <div class="wb-meta">
                    <span><i class="fa-regular fa-clock"></i> Updated: ${date}</span>
                    <span><i class="fa-solid fa-database"></i> Size: ${(ws.size / 1024).toFixed(1)} KB</span>
                </div>
                
                <div class="wb-actions">
                    <button class="mini-btn" onclick="deleteWorkspace(event, '${ws.name}', ${ws.protected})">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

window.handleWorkspaceSelection = async (e, name, isProtected) => {
    if (isProtected) {
        let authenticated = false;
        while (!authenticated) {
            const pass = await showTacticalKeypad();
            if (!pass) break; // User cancelled
            
            showToast("VERIFYING CODE...");
            try {
                const url = `${SHARED_STATE_API}?workspace=${encodeURIComponent(name)}&password=${encodeURIComponent(pass)}`;
                const res = await fetch(url, { cache: "no-store" });
                const json = await res.json();
                
                if (json.ok && json.data) {
                    if (json.data.requiresPassword) {
                        showToast("INVALID ACCESS CODE");
                    } else {
                        authenticated = true;
                        window.enterWorkspace(name, pass);
                    }
                } else {
                    showToast("SERVER ERROR");
                }
            } catch (err) {
                showToast("CONNECTION ERROR");
            }
        }
    } else {
        window.enterWorkspace(name);
    }
};

window.enterWorkspace = (name, password = null) => {
    if (password) {
        sessionStorage.setItem(`ctc_auth_${name}`, password);
    }
    const url = new URL(window.location.href);
    url.searchParams.set("workspace", name);
    url.searchParams.delete("password");
    window.location.href = url.toString();
};

window.deleteWorkspace = async (e, name, isProtected) => {
    e.stopPropagation();
    
    let password = null;
    if (isProtected) {
        password = await showTacticalKeypad();
        if (!password) return; // cancelled
    }

    const ok = await customConfirm(
        "DELETE WORKSPACE?",
        `Are you sure you want to permanently delete <b>"${escapeHtml(name)}"</b>? <br/>This action cannot be undone.`
    );
    if (!ok) return;
    
    try {
        const url = `${SHARED_STATE_API}?workspace=${encodeURIComponent(name)}${password ? `&password=${encodeURIComponent(password)}` : ""}`;
        const res = await fetch(url, {
            method: "DELETE"
        });
        if (res.ok) {
            showToast("Workspace deleted");
            showWorkspaceBrowser();
        } else {
            const errData = await res.json();
            showToast(errData.error || "Delete failed");
        }
    } catch (err) {
        showToast("Delete failed");
    }
};

async function handleCreateWorkspace() {
    const name = newWorkspaceNameInput.value.trim().replace(/[^a-zA-Z0-9-_]/g, "");
    const pass = newWorkspacePassInput.value.trim();
    const note = newWorkspaceNoteInput ? newWorkspaceNoteInput.value.trim() : "";
    
    if (!name) {
        showToast("Invalid workspace name!");
        return;
    }

    if (pass && !/^\d{6}$/.test(pass)) {
        showToast("Password must be 6 digits!");
        return;
    }

    const ok = await customConfirm(
        "CREATE WORKSPACE?",
        `Initialize ${pass ? '<b>PROTECTED</b>' : 'public'} workspace <b>"${name}"</b>?`,
        "Create Now",
        false
    );
    if (!ok) return;

    // Initialize with default state
    masterPlayers = deepClone(DEFAULT_PLAYERS);
    initializeDefaultState();
    
    // Set password and state in payload
    const payload = {
        version: 1,
        masterPlayers: deepClone(masterPlayers),
        pool: deepClone(state.pool),
        categories: deepClone(state.categories),
        updatedAt: Date.now(),
        password: pass || null,
        note: note || null
    };

    try {
        const res = await fetch(`${SHARED_STATE_API}?workspace=${encodeURIComponent(name)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            enterWorkspace(name, pass);
        } else {
            showToast("Creation failed");
        }
    } catch (err) {
        showToast("Error creating workspace");
    }
}

// Event Listeners
if (createWorkspaceBtn) {
    createWorkspaceBtn.addEventListener("click", handleCreateWorkspace);
}
if (newWorkspaceNameInput) {
    newWorkspaceNameInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleCreateWorkspace();
    });
}
if (uploadPlanBtn) {
    uploadPlanBtn.addEventListener("click", () => saveSharedStateOnline(true));
}
if (browseWorkspacesBtn) {
    browseWorkspacesBtn.addEventListener("click", () => {
        window.location.href = window.location.pathname; // Clear query params
    });
}

// =========================
// ROSTER MODAL — Show All Players
// =========================
const rosterModal    = document.getElementById("rosterModal");
const rosterStats    = document.getElementById("rosterStats");
const rosterGroups   = document.getElementById("rosterGroups");
const rosterSearch   = document.getElementById("rosterSearch");
const closeRosterBtn = document.getElementById("closeRosterBtn");
const showAllPlayersBtn = document.getElementById("showAllPlayersBtn");
let activeRosterGroup = "";

const ROLE_COLORS = {
    Rifle:   { color: "#5dffb2", bg: "rgba(93,255,178,0.12)",   border: "rgba(93,255,178,0.35)"  },
    Sniper:  { color: "#6ee7ff", bg: "rgba(110,231,255,0.12)",  border: "rgba(110,231,255,0.35)" },
    Warrior: { color: "#ffb347", bg: "rgba(255,179,71,0.12)",   border: "rgba(255,179,71,0.35)"  },
    Virus:   { color: "#ff6b8a", bg: "rgba(255,107,138,0.12)",  border: "rgba(255,107,138,0.35)" },
};

function getManorInfo(power) {
    const p = Number(power) || 0;
    if (p >= 150) return { label: "MANOR 30", cls: "manor-30", range: "Lv.150+" };
    if (p >= 145) return { label: "MANOR 29", cls: "manor-29", range: "Lv.145–149" };
    if (p >= 140) return { label: "MANOR 28", cls: "manor-28", range: "Lv.140–144" };
    return { label: "OTHER",    cls: "manor-other", range: "Lv.<140" };
}

function highlightText(text, keyword) {
    if (!keyword) return escapeHtml(text);
    const escaped = escapeHtml(text);
    const kw = escapeHtml(keyword);
    const re = new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return escaped.replace(re, `<mark class="roster-highlight">$1</mark>`);
}

function applyRosterGroupFilter(players, group) {
    if (!group) return players;
    return players.filter(p => p.group === group);
}

function renderRoster(keyword = "") {
    const kw = keyword.trim().toLowerCase();

    const searchedPlayers = masterPlayers.filter(p => {
        if (!kw) return true;
        return (
            p.name.toLowerCase().includes(kw) ||
            p.role.toLowerCase().includes(kw) ||
            p.group.toLowerCase().includes(kw) ||
            String(p.power).includes(kw) ||
            (p.note || "").toLowerCase().includes(kw)
        );
    });
    const filtered = applyRosterGroupFilter(searchedPlayers, activeRosterGroup);

    // ── Stats Strip ─────────────────────────────────────────
    const total      = searchedPlayers.length;
    const commanders = searchedPlayers.filter(p => p.group === "Commander").length;
    const elites     = searchedPlayers.filter(p => p.group === "Elite").length;
    const nonElites  = searchedPlayers.filter(p => p.group === "Non-Elite").length;
    const pending    = searchedPlayers.filter(p => p.group === "Pending").length;

    const statCards = [
        { value: total,      label: "Total",      color: "#c4b8ff", group: "" },
        { value: commanders, label: "Commander",   color: "#ffd700", group: "Commander" },
        { value: elites,     label: "Elite",       color: "var(--cyan)", group: "Elite" },
        { value: nonElites,  label: "Non-Elite",   color: "var(--green)", group: "Non-Elite" },
        { value: pending,    label: "Pending",     color: "var(--muted)", group: "Pending" },
    ];
    rosterStats.innerHTML = statCards.map(s => `
        <button type="button"
                class="roster-stat-card ${activeRosterGroup === s.group ? "active" : ""}"
                data-roster-group="${escapeHtml(s.group)}"
                aria-pressed="${activeRosterGroup === s.group ? "true" : "false"}">
            <div class="roster-stat-value" style="color:${s.color}">${s.value}</div>
            <div class="roster-stat-label">${s.label}</div>
        </button>
    `).join("") + buildRoleRow(filtered);

    // ── Manor Groups ────────────────────────────────────────
    const manorOrder = ["manor-30", "manor-29", "manor-28", "manor-other"];
    const manorBuckets = {};
    manorOrder.forEach(m => manorBuckets[m] = []);

    filtered.forEach(p => {
        const info = getManorInfo(p.power);
        manorBuckets[info.cls].push({ ...p, _manorInfo: info });
    });

    if (!filtered.length) {
        const groupText = activeRosterGroup ? ` in <b>${escapeHtml(activeRosterGroup)}</b>` : "";
        const searchText = keyword ? ` matching "<b>${escapeHtml(keyword)}</b>"` : "";
        rosterGroups.innerHTML = `<div class="roster-empty"><i class="fa-solid fa-user-slash" style="font-size:32px; opacity:.3; display:block; margin-bottom:12px;"></i>No players found${groupText}${searchText}</div>`;
        return;
    }

    rosterGroups.innerHTML = manorOrder
        .filter(m => manorBuckets[m].length > 0)
        .map(m => {
            const players = manorBuckets[m];
            const sample  = players[0]._manorInfo;
            return `
                <div class="roster-manor-section ${m}">
                    <div class="roster-manor-header">
                        <span class="roster-manor-badge">${sample.label}</span>
                        <span class="roster-manor-title">${sample.range}</span>
                        <span class="roster-manor-count">${players.length} PLAYER${players.length !== 1 ? "S" : ""}</span>
                    </div>
                    <div class="roster-player-grid">
                        ${players.map(p => buildRosterPlayerRow(p, kw)).join("")}
                    </div>
                </div>
            `;
        }).join("");
}

function buildRoleRow(players) {
    const roles = {};
    players.forEach(p => {
        roles[p.role] = (roles[p.role] || 0) + 1;
    });

    const pills = Object.entries(roles)
        .sort((a, b) => b[1] - a[1])
        .map(([role, count]) => {
            const rc = ROLE_COLORS[role] || { color: "var(--text)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.15)" };
            return `
                <span class="roster-role-pill tag ${roleClass(role)}"
                      style="background:${rc.bg}; border-color:${rc.border}; color:${rc.color};">
                    <span>${escapeHtml(role)}</span>
                    <span class="pill-count">${count}</span>
                </span>`;
        }).join("");

    return `<div class="roster-role-row" style="grid-column:1/-1;">
        <span style="font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); margin-right:4px;">Roles:</span>
        ${pills || '<span style="color:var(--muted); font-size:12px;">—</span>'}
    </div>`;
}

function buildRosterPlayerRow(player, kw) {
    const rc = ROLE_COLORS[player.role] || { color: "var(--muted)", bg: "transparent", border: "transparent" };
    const manorInfo = getManorInfo(player.power);
    
    let levelColor = "var(--muted)";
    if (manorInfo.cls === "manor-30") levelColor = "#ffd700";
    else if (manorInfo.cls === "manor-29") levelColor = "var(--cyan)";
    else if (manorInfo.cls === "manor-28") levelColor = "var(--green)";

    const name  = highlightText(player.name, kw);
    const note  = player.note ? `<div class="roster-player-note"><i class="fa-solid fa-comment-dots" style="opacity:.5; margin-right:4px;"></i>${highlightText(player.note, kw)}</div>` : "";
    const group = player.group === "Commander"
        ? `<span class="tag commander" style="font-size:9px; padding:1px 6px;">CMD</span>`
        : "";

    return `
        <div class="roster-player-row">
            <div class="roster-player-name">${name} ${group}</div>
            <span class="tag ${roleClass(player.role)}" style="font-size:10px; background:${rc.bg}; border-color:${rc.border}; color:${rc.color};">${escapeHtml(player.role)}</span>
            <span class="roster-player-level" style="color:${levelColor}; border-color:${levelColor}25;">${escapeHtml(String(player.power))}</span>
            ${note}
        </div>
    `;
}

function openRosterModal() {
    if (!rosterModal) return;
    activeRosterGroup = "";
    if (rosterSearch) rosterSearch.value = "";
    renderRoster("");
    rosterModal.classList.add("show");
    document.body.style.overflow = "hidden";
    setTimeout(() => rosterSearch && rosterSearch.focus(), 80);
}

function closeRosterModal() {
    if (!rosterModal) return;
    rosterModal.classList.remove("show");
    document.body.style.overflow = "";
}

if (showAllPlayersBtn) {
    showAllPlayersBtn.addEventListener("click", openRosterModal);
}
if (closeRosterBtn) {
    closeRosterBtn.addEventListener("click", closeRosterModal);
}
if (rosterModal) {
    rosterModal.addEventListener("click", e => {
        if (e.target === rosterModal) closeRosterModal();
    });
}
if (rosterStats) {
    rosterStats.addEventListener("click", e => {
        const card = e.target.closest("[data-roster-group]");
        if (!card) return;
        activeRosterGroup = card.dataset.rosterGroup || "";
        renderRoster(rosterSearch ? rosterSearch.value : "");
    });
}
if (rosterSearch) {
    rosterSearch.addEventListener("input", () => renderRoster(rosterSearch.value));
}

// =========================
// INIT
// =========================
initWorkspaceFlow();
