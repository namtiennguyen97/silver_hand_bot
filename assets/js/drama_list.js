/* =============================================
   DRAMA CAMPAIGN LOGIC
============================================= */

const STAGE_DATA = [
  {
    id: "INSPECTOR",
    title: "Camp Inspector",
    status: "unlocked",
    type: "minigame",
    img: "assets/img/inspector_desk.png",
    link: "inspector.html",
    x: 10, y: 50,
    description: "Bạn là quan chức kiểm soát nhân sự Camp SAO-ĐÊM. Sàng lọc người tị nạn qua 3 ngày với các tiêu chí thay đổi.",
    rules: [
      { icon: "🎮", text: "Xét duyệt từng hồ sơ — Approve hoặc Reject" },
      { icon: "📋", text: "Mayor AI giới thiệu tiêu chí mỗi ngày" },
      { icon: "📊", text: "Kết quả dựa trên độ chính xác quyết định" },
      { icon: "⚠️", text: "Gián điệp đang trà trộn — hãy lọc kỹ!" }
    ],
    tags: ["UNLOCKED", "3 DAYS", "SAO-ĐÊM"]
  },
  {
    id: "CAMP_AEGIS",
    title: "Camp Aegis",
    status: "unlocked",
    type: "minigame",
    img: "assets/img/mayor_mobile_workspace.png",
    link: "camp_aegis.html",
    x: 35, y: 55,
    description: "Quản lý tối thượng doanh trại SAO-ĐÊM. Tích hợp thời tiết thực, trồng trọt, chế biến, quản lý nhân sự và giao dịch với NPC bot hằng ngày. Tiến trình lưu trữ đám mây 24/7.",
    rules: [
      { icon: "⛅", text: "Thời tiết thực tế ảnh hưởng trực tiếp đến năng suất" },
      { icon: "🌾", text: "Trồng trọt và thu hoạch theo thời gian thực" },
      { icon: "🏪", text: "Mở chợ giao dịch với hàng chục loại NPC bot" },
      { icon: "💾", text: "Lưu trữ tiến trình chơi vĩnh viễn trên Blob" }
    ],
    tags: ["UNLOCKED", "REAL-TIME", "SAVES"]
  },
  {
    id: "26-23",
    title: "Be a official",
    status: "locked",
    type: "drama",
    img: "assets/img/drama/smirk.png",
    link: null,
    x: 55, y: 68,
    description: "Nội dung chưa được mở khóa. Hoàn thành các nhiệm vụ trước để tiếp tục.",
    rules: []
  },
  {
    id: "26-24",
    title: "Tranh Chấp Vùng Kín",
    status: "locked",
    type: "drama",
    img: "assets/img/drama/smirk.png",
    link: null,
    x: 75, y: 50,
    description: "Nội dung chưa được mở khóa. Hoàn thành các nhiệm vụ trước để tiếp tục.",
    rules: []
  },
  {
    id: "26-25",
    title: "Camp Invasion",
    status: "locked",
    type: "drama",
    img: "assets/img/drama/smirk.png",
    link: null,
    x: 90, y: 65,
    description: "Nội dung chưa được mở khóa. Hoàn thành các nhiệm vụ trước để tiếp tục.",
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
    document.getElementById('sdmTitle').textContent  = stage.title.toUpperCase();
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
        nodeDiv.style.top  = `${stage.y}%`;
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
            const next    = STAGE_DATA[index + 1];
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
    window.addEventListener('resize', () => {});
});
