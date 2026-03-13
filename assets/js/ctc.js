// =========================
// CONFIG / DATA
// =========================
const STORAGE_KEY = "ctc_team_planner_v21_object_state";

const FIXED_PLAYERS = [
    { name: "Chychy", role: "Rifle", power: 148, group: "Commander", note: "" },
    { name: "Maybe", role: "Warrior", power: 148, group: "Commander", note: "" },

    { name: "DL", role: "Sniper", power: 147, group: "Elite", note: "" },
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
    modalTargetCategory: null
};

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
    toastEl.textContent = text;
    toastEl.classList.add("show");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toastEl.classList.remove("show"), 1500);
}

function getPlayerById(id) {
    return FIXED_PLAYERS.find(p => uid(p) === id) || null;
}

function getCommanders() {
    return FIXED_PLAYERS.filter(p => p.group === "Commander");
}

function getNonCommanders() {
    return FIXED_PLAYERS.filter(p => p.group !== "Commander");
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function roleClass(role) {
    return String(role || "").toLowerCase();
}

function sortPlayersByPower(arr) {
    arr.sort((a, b) => {
        if (b.power !== a.power) return b.power - a.power;
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

function normalizeState() {
    const seen = new Set();

    for (const cat of CATEGORIES) {
        const arr = Array.isArray(state.categories[cat]) ? state.categories[cat] : [];
        state.categories[cat] = arr.filter(p => {
            const id = uid(p);
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
        });
    }

    state.pool = (Array.isArray(state.pool) ? state.pool : []).filter(p => {
        const id = uid(p);
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

function saveState() {
    normalizeState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        pool: state.pool,
        categories: state.categories
    }));
}

function initializeDefaultState() {
    state.pool = getNonCommanders().map(p => deepClone(p));
    for (const cat of CATEGORIES) state.categories[cat] = [];
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
    render();
    showToast("Teams cleared");
}

function resetAll() {
    initializeDefaultState();
    saveState();
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
    render();
    showToast("Random split complete");
}

function smartSplit() {
    const all = getNonCommanders().map(p => deepClone(p));

    // sort high power first, then distribute to lowest total power team
    all.sort((a, b) => {
        if (b.power !== a.power) return b.power - a.power;
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
    render();
    showToast("Smart split complete");
}

function sortAllTeamsByPower() {
    for (const cat of CATEGORIES) sortPlayersByPower(state.categories[cat]);
    saveState();
    render();
    showToast("Sorted by power");
}

function sortAllTeamsByName() {
    for (const cat of CATEGORIES) sortPlayersByName(state.categories[cat]);
    saveState();
    render();
    showToast("Sorted by name");
}

function countLabel(n) {
    return `${n} player${n !== 1 ? "s" : ""}`;
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
    const commanders = getCommanders();
    commanderListEl.innerHTML = "";
    commanders.forEach(p => commanderListEl.appendChild(buildCommanderItem(p)));
    commanderCountEl.textContent = countLabel(commanders.length);
}

function renderPool() {
    const keyword = searchInput.value.trim().toLowerCase();
    const role = roleFilter.value;

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

    // Commander block
    lines.push(`Commander (${commanders.length}):`);
    commanders.forEach((p) => {
        let line = `${p.name} **(${p.role} - ${p.power})**`;
        if (p.note) line += ` (${p.note})`;
        lines.push(line);
    });

    lines.push("");

    // Team blocks (current configured state)
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

    // Pool / unassigned
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
        .then(() => showToast("Plan copied"))
        .catch(() => alert("Copy failed.\n\n" + text));
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
// MODAL
// =========================
function renderModalList(keyword = "") {
    checkGrid.innerHTML = "";

    const role = roleFilter.value;
    const available = state.pool.filter(p => {
        const matchText =
            p.name.toLowerCase().includes(keyword.toLowerCase()) ||
            p.role.toLowerCase().includes(keyword.toLowerCase()) ||
            p.group.toLowerCase().includes(keyword.toLowerCase()) ||
            (p.note || "").toLowerCase().includes(keyword.toLowerCase());

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
        const id = `pick_${uid(player).replace(/\s+/g, "_")}_${Math.random().toString(36).slice(2, 6)}`;
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
    state.modalTargetCategory = category;
    modalTitle.textContent = `Add players → ${category}`;
    modalSearch.value = "";
    renderModalList("");
    pickerModal.classList.add("show");
    document.body.style.overflow = "hidden";
    setTimeout(() => modalSearch.focus(), 50);
}

function closePicker() {
    pickerModal.classList.remove("show");
    document.body.style.overflow = "";
    state.modalTargetCategory = null;
}

document.querySelectorAll("[data-open-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
        openPicker(btn.dataset.openModal);
    });
});

modalSearch.addEventListener("input", () => {
    renderModalList(modalSearch.value.trim());
});

cancelModalBtn.addEventListener("click", closePicker);

pickerModal.addEventListener("click", (e) => {
    if (e.target === pickerModal) closePicker();
});

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

// =========================
// EVENTS
// =========================
searchInput.addEventListener("input", renderPool);
roleFilter.addEventListener("change", () => {
    renderPool();
    if (pickerModal.classList.contains("show")) renderModalList(modalSearch.value.trim());
});

smartSplitBtn.addEventListener("click", smartSplit);
randomSplitBtn.addEventListener("click", randomSplit);
sortPowerBtn.addEventListener("click", sortAllTeamsByPower);
sortNameBtn.addEventListener("click", sortAllTeamsByName);
copyBtn.addEventListener("click", copyResult);
resetBtn.addEventListener("click", resetAll);
clearTeamsBtn.addEventListener("click", clearTeamsOnly);

// =========================
// INIT
// =========================
loadState();
render();