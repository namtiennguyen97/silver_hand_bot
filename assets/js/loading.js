const TOTAL_CHUNKS = 10;
const progressBar = document.getElementById("loadingProgress");

let chunks = [];
let percent = 0;
let target = 0;

// Tạo chunk
for (let i = 0; i < TOTAL_CHUNKS; i++) {
    const div = document.createElement("div");
    div.className = "chunk";
    progressBar.appendChild(div);
    chunks.push(div);
}

function render(p) {
    const active = Math.floor((p / 100) * TOTAL_CHUNKS);
    chunks.forEach((c, i) => {
        c.classList.toggle("active", i < active);
    });
}

// Animation loop
function tick() {
    if (percent < target) {
        percent++;
        render(percent);
    }
    requestAnimationFrame(tick);
}

tick();

/* =========================
   BẮT EVENT LOAD THẬT
   ========================= */

// HTML parse
document.addEventListener("DOMContentLoaded", () => {
    target = 40;
});

// DOM interactive
document.onreadystatechange = () => {
    if (document.readyState === "interactive") {
        target = 70;
    }
};

// FULL LOAD
window.addEventListener("load", () => {
    target = 100;

    // 👉 GIỮ NGUYÊN LUỒNG CŨ
    setTimeout(() => {
        document.body.classList.add("finished");
    }, 300);
});
