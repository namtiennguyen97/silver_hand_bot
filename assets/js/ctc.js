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

const moreOptionsWrap = document.getElementById("moreOptionsWrap");
const moreOptionsBtn = document.getElementById("moreOptionsBtn");
const moreOptionsMenu = document.getElementById("moreOptionsMenu");

const mobileSmartSplitBtn = document.getElementById("mobileSmartSplitBtn");
const mobileSortPowerBtn = document.getElementById("mobileSortPowerBtn");
const mobileSortNameBtn = document.getElementById("mobileSortNameBtn");
const mobileResetBtn = document.getElementById("mobileResetBtn");
const mobileRandomSplitBtn = document.getElementById("mobileRandomSplitBtn");
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
function buildSharedPayload() {
    normalizeState();

    return {
        version: 1,
        masterPlayers: deepClone(masterPlayers),
        pool: deepClone(state.pool),
        categories: deepClone(state.categories),
        updatedAt: Date.now()
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
    try {
        const res = await fetch(SHARED_STATE_API, {
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
    if (isApplyingRemoteState) return;

    const payload = buildSharedPayload();
    const signature = buildStateSignature(payload);

    // Không save nếu state không đổi
    if (!force && signature === lastSavedSignature) {
        return;
    }

    try {
        const res = await fetch(SHARED_STATE_API, {
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
    } catch (e) {
        console.warn("saveSharedStateOnline failed", e);
    }
}

function saveSharedStateDebounced() {
    if (isApplyingRemoteState) return;

    clearTimeout(sharedSaveTimer);
    sharedSaveTimer = setTimeout(() => {
        saveSharedStateOnline();
    }, SHARED_SAVE_DEBOUNCE_MS);
}

async function loadSharedStateOnStartup() {
    const remote = await fetchSharedState();

    if (!remote) {
        // Chưa có dữ liệu cloud => push state local/default lên cloud 1 lần
        await saveSharedStateOnline(true);
        return;
    }

    const remoteSignature = buildStateSignature(remote);
    const localSignature = buildStateSignature();

    // Nếu remote giống local thì chỉ sync meta, khỏi render lại
    if (remoteSignature === localSignature) {
        lastSharedUpdatedAt = Number(remote.updatedAt) || 0;
        lastSavedSignature = localSignature;
        lastAppliedRemoteSignature = remoteSignature;
        return;
    }

    applySharedPayload(remote, {
        saveToLocal: true,
        silent: true
    });
}

async function pollSharedState() {
    // Không poll khi tab đang ẩn => tiết kiệm quota
    if (document.hidden) return;

    const remote = await fetchSharedState();
    if (!remote) return;

    const remoteUpdatedAt = Number(remote.updatedAt) || 0;
    const remoteSignature = buildStateSignature(remote);
    const localSignature = buildStateSignature();

    // Nếu remote cũ hơn hoặc bằng local đã biết => bỏ qua
    if (remoteUpdatedAt <= lastSharedUpdatedAt) {
        return;
    }

    // Nếu nội dung giống local thì chỉ update mốc thời gian
    if (remoteSignature === localSignature) {
        lastSharedUpdatedAt = remoteUpdatedAt;
        lastSavedSignature = localSignature;
        lastAppliedRemoteSignature = remoteSignature;
        return;
    }

    // Nếu remote vừa apply rồi mà poll lại đúng bản đó => bỏ qua
    if (remoteSignature === lastAppliedRemoteSignature) {
        lastSharedUpdatedAt = remoteUpdatedAt;
        return;
    }

    applySharedPayload(remote, {
        saveToLocal: true,
        silent: false
    });
}

function startSharedSyncPolling() {
    clearInterval(sharedSyncTimer);

    sharedSyncTimer = setInterval(() => {
        pollSharedState();
    }, SHARED_SYNC_INTERVAL_MS);
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

function renderPlayerManagerList() {
    if (!pmList) return;

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
            <div class="chip-main" style="flex-wrap: wrap;">
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
        btn.addEventListener("click", () => {
            const id = btn.dataset.deletePlayer;

            if (!confirm(`Delete player "${id}"?`)) return;

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

if (smartSplitBtn) smartSplitBtn.addEventListener("click", smartSplit);
if (randomSplitBtn) randomSplitBtn.addEventListener("click", randomSplit);
if (sortPowerBtn) sortPowerBtn.addEventListener("click", sortAllTeamsByPower);
if (sortNameBtn) sortNameBtn.addEventListener("click", sortAllTeamsByName);
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

if (pmResetDefaultBtn) {
    pmResetDefaultBtn.addEventListener("click", () => {
        if (!confirm("Reset player list to default? This will remove your custom edits.")) return;

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

if (mobileSmartSplitBtn) {
    mobileSmartSplitBtn.addEventListener("click", () => {
        smartSplit();
        moreOptionsMenu.classList.remove("show");
    });
}

if (mobileSortPowerBtn) {
    mobileSortPowerBtn.addEventListener("click", () => {
        sortAllTeamsByPower();
        moreOptionsMenu.classList.remove("show");
    });
}

if (mobileSortNameBtn) {
    mobileSortNameBtn.addEventListener("click", () => {
        sortAllTeamsByName();
        moreOptionsMenu.classList.remove("show");
    });
}

if (mobileResetBtn) {
    mobileResetBtn.addEventListener("click", () => {
        resetAll();
        moreOptionsMenu.classList.remove("show");
    });
}
if (mobileRandomSplitBtn) {
    mobileRandomSplitBtn.addEventListener("click", () => {
        randomSplit();
        moreOptionsMenu.classList.remove("show");
    });
}
// =========================
// INIT
// =========================
loadMasterPlayers();
loadState();
render();
loadSharedStateOnStartup().finally(() => {
    startSharedSyncPolling();
});