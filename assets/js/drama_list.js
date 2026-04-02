/* =============================================
   DRAMA CAMPAIGN LOGIC
============================================= */

const STAGE_DATA = [
  {
    id: "26-22",
    title: "Scammer come back",
    status: "cleared",
    img: "assets/img/drama/smirk.png",
    x: 10, y: 50
  },
  {
    id: "26-23",
    title: "Be a official",
    status: "cleared",
    img: "assets/img/drama/smirk.png",
    x: 35, y: 65
  },
  {
    id: "26-24",
    title: "Tranh Chấp Vùng Kín",
    status: "cleared",
    img: "assets/img/drama/smirk.png",
    x: 60, y: 45
  },
  {
    id: "26-25",
    title: "Camp Invasion",
    status: "locked",
    img: "assets/img/drama/smirk.png",
    x: 85, y: 65
  }
];

function renderStageMap() {
    const canvas = document.getElementById('dramaRootNodes');
    const svgPathContainer = document.getElementById('stageLinesSvg');
    if (!canvas || !svgPathContainer) return;

    // Clear existing nodes but keep SVG
    const existingNodes = canvas.querySelectorAll('.stage-node');
    existingNodes.forEach(n => n.remove());

    let svgLines = '';

    STAGE_DATA.forEach((stage, index) => {
        // Draw Node
        const nodeDiv = document.createElement('div');
        nodeDiv.className = `stage-node ${stage.status === 'cleared' ? 'is-cleared' : ''}`;
        nodeDiv.style.left = `${stage.x}%`;
        nodeDiv.style.top = `${stage.y}%`;
        nodeDiv.style.transform = `translate(-50%, -50%)`;

        nodeDiv.innerHTML = `
            <div class="node-label">${stage.id}</div>
            <div class="node-box">
                <img src="${stage.img}" class="node-thumb" alt="${stage.title}">
                <div class="node-play-btn"></div>
                <div class="node-clear-tag">CLR</div>
            </div>
            <div class="node-title">${stage.title}</div>
        `;

        // Interaction (Optional: load content or VN)
        nodeDiv.onclick = () => {
            if(window.playSfx) window.playSfx(new Audio('assets/sounds/nierMail.mp3'));
            // You can trigger the Visual Novel from here
            if (typeof VNEngine !== 'undefined' && typeof VN_SCRIPT !== 'undefined') {
                 // re-trigger VN
            }
        };

        canvas.appendChild(nodeDiv);

        // Draw Line to next node
        if (index < STAGE_DATA.length - 1) {
            const current = stage;
            const next = STAGE_DATA[index + 1];
            
            // Draw a line from current (x,y) to next (x,y) 
            // the coordinates in SVG are relative to the canvas viewBox (which is 100x100 if we set preserveAspectRatio)
            svgLines += `<line x1="${current.x}%" y1="${current.y}%" x2="${next.x}%" y2="${next.y}%" stroke="rgba(255,255,255,0.8)" stroke-width="3" />`;
            // Add a cyan glow overlay line
            svgLines += `<line x1="${current.x}%" y1="${current.y}%" x2="${next.x}%" y2="${next.y}%" stroke="rgba(0,255,255,0.4)" stroke-width="8" filter="blur(2px)" />`;
        }
    });

    svgPathContainer.innerHTML = svgLines;
}

/* --- INIT --- */
document.addEventListener('DOMContentLoaded', () => {
    // Basic setup from visual novel if it was in the script
    renderStageMap();

    // Re-render lines on window resize just in case
    window.addEventListener('resize', () => {
        // SVG percentages auto-scale, so no explicit JS recalculation needed
    });
});
