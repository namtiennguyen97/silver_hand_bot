/* =============================================
   DRAMA CAMPAIGN LOGIC
============================================= */
// status: unlocked, cleared, locked
const STAGE_DATA = [
    {
        id: "INSPECTOR",
        title: "Camp Inspector",
        status: "cleared",
        type: "minigame",
        img: "assets/img/inspector_desk.png",
        link: "inspector.html",
        x: 10, y: 50,
        description: "You are the new officer in charge of personnel control at Camp SAO-ĐÊM. Screen new members over 3 days as the criteria change each day.",
        rules: [
            {icon: "🎮", text: "Review each profile — Approve or Reject"},
            {icon: "📋", text: "Mayor AI provides the daily criteria"},
            {icon: "📊", text: "Your score depends on decision accuracy"},
            {icon: "⚠️", text: "Spies are infiltrating — screen carefully!"}
        ],
        tags: ["CLEARED", "3 DAYS", "SAO-ĐÊM"]
    },
    {
        id: "CTC_PLANER",
        title: "CTC Planer",
        status: "unlocked",
        type: "workspace",
        img: "assets/img/mayor_mobile_workspace.png",
        link: "ctc-planer.html",
        x: 35, y: 55,
        description: "The system manages the CTC battle roster, assigns roles, and organizes detailed strategic plans.",
        rules: [
            {icon: "🔧", text: "Manage the list of battle participants"},
            {icon: "📈", text: "Monitor and adjust in real time"},
            {icon: "💾", text: "Plan strategies and export reports"}
        ],
        tags: ["UNLOCKED", "UTILITY", "CTC"]
    },
    {
        id: "26-23",
        title: "Be a official",
        status: "locked",
        type: "drama",
        img: "assets/img/drama/smirk.png",
        link: null,
        x: 55, y: 68,
        description: "It locked!",
        rules: []
    },
    {
        id: "26-24",
        title: "Boss camp",
        status: "locked",
        type: "drama",
        img: "assets/img/drama/smirk.png",
        link: null,
        x: 75, y: 50,
        description: "It locked!",
        rules: []
    }
];

/* =============================================
   MODAL LOGIC
============================================= */
function openStageModal(stage) {
    const modal = document.getElementById('stageDetailModal');
    if (!modal) return;

    // Fill in data
    document.getElementById('sdmBadge').textContent = stage.type === 'minigame' ? 'MINI-GAME' : `STAGE ${stage.id}`;
    document.getElementById('sdmTitle').textContent = stage.title.toUpperCase();
    document.getElementById('sdmSubtitle').textContent = stage.type === 'minigame'
        ? '// MINI-GAME — PAPERS PLEASE STYLE'
        : `// DRAMA STAGE — ${stage.id}`;
    document.getElementById('sdmPreviewImg').src = stage.img;
    document.getElementById('sdmDesc').textContent = stage.description || stage.title;

    // Status tag
    const statusTag = document.getElementById('sdmStatusTag');
    statusTag.textContent = stage.status.toUpperCase();
    statusTag.className = 'sdm-tag';
    if (stage.status === 'cleared') statusTag.classList.add('cleared');
    else if (stage.status === 'locked') statusTag.classList.add('locked');

    // Rules list
    const rulesContainer = modal.querySelector('.sdm-rules');
    if (stage.rules && stage.rules.length > 0) {
        rulesContainer.style.display = 'flex';
        rulesContainer.innerHTML = stage.rules.map(r => `
            <div class="sdm-rule-item">
                <span class="sdm-rule-icon">${r.icon}</span>
                <span>${r.text}</span>
            </div>
        `).join('');
    } else {
        rulesContainer.style.display = 'none';
    }

    // Start button
    const startBtn = document.getElementById('sdmStartBtn');
    if (stage.status === 'locked') {
        startBtn.disabled = true;
        startBtn.textContent = '🔒 LOCKED';
    } else {
        startBtn.disabled = false;
        startBtn.textContent = '▶️ BẮT ĐẦU';
        startBtn.onclick = () => {
            if (stage.link) {
                window.location.href = stage.link;
            }
        };
    }

    // Show modal with animation
    modal.classList.add('active');
}

function closeStageModal() {
    const modal = document.getElementById('stageDetailModal');
    if (modal) modal.classList.remove('active');
}

/* =============================================
   RENDER STAGE MAP
============================================= */
function renderStageMap() {
    const canvas = document.getElementById('dramaRootNodes');
    const svgPathContainer = document.getElementById('stageLinesSvg');
    if (!canvas || !svgPathContainer) return;

    const existingNodes = canvas.querySelectorAll('.stage-node');
    existingNodes.forEach(n => n.remove());

    let svgLines = '';

    STAGE_DATA.forEach((stage, index) => {
        const nodeDiv = document.createElement('div');
        const isMinigame = stage.type === 'minigame';
        nodeDiv.className = `stage-node ${stage.status === 'cleared' ? 'is-cleared' : ''} ${isMinigame ? 'is-minigame' : ''}`;
        nodeDiv.style.left = `${stage.x}%`;
        nodeDiv.style.top = `${stage.y}%`;
        nodeDiv.style.transform = 'translate(-50%, -50%)';

        nodeDiv.innerHTML = `
            <div class="node-label">${stage.id}</div>
            <div class="node-box">
                <img src="${stage.img}" class="node-thumb" alt="${stage.title}">
                <div class="node-play-btn"></div>
                ${stage.status === 'cleared' ? '<div class="node-clear-tag">CLR</div>' : ''}
                ${isMinigame ? '<div class="node-minigame-tag">GAME</div>' : ''}
                ${stage.status === 'locked' ? '<div class="node-lock-tag">🔒</div>' : ''}
            </div>
            <div class="node-title">${stage.title}</div>
        `;

        nodeDiv.onclick = () => {
            if (window.playSfx) window.playSfx(new Audio('assets/sounds/nierMail.mp3'));
            openStageModal(stage);
        };

        canvas.appendChild(nodeDiv);

        if (index < STAGE_DATA.length - 1) {
            const current = stage;
            const next = STAGE_DATA[index + 1];
            svgLines += `<line x1="${current.x}%" y1="${current.y}%" x2="${next.x}%" y2="${next.y}%" stroke="rgba(255,255,255,0.8)" stroke-width="3" />`;
            svgLines += `<line x1="${current.x}%" y1="${current.y}%" x2="${next.x}%" y2="${next.y}%" stroke="rgba(0,255,255,0.4)" stroke-width="8" filter="blur(2px)" />`;
        }
    });

    svgPathContainer.innerHTML = svgLines;

    // Wire up modal back btn
    const backBtn = document.getElementById('sdmBackBtn');
    if (backBtn) backBtn.addEventListener('click', closeStageModal);

    // Close on backdrop click
    const modal = document.getElementById('stageDetailModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeStageModal();
        });
    }
}

/* --- INIT --- */
document.addEventListener('DOMContentLoaded', () => {
    renderStageMap();
    window.addEventListener('resize', () => {
    });
});
