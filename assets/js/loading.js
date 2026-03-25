const LOADING_TOTAL_CHUNKS = 16;
const loadingProgressBar = document.getElementById("loadingProgress");
const loadingPercentage = document.getElementById("loadingPercentage");
const loadingStatus = document.getElementById("loadingStatus");

let loadingChunks = [];
let loadingPercent = 0;
let loadingTarget = 0;

if (loadingProgressBar) {
    loadingProgressBar.innerHTML = "";

    for (let i = 0; i < LOADING_TOTAL_CHUNKS; i++) {
        const div = document.createElement("div");
        div.className = "loading-chunk";
        loadingProgressBar.appendChild(div);
        loadingChunks.push(div);
    }

    function renderLoading(p) {
        const active = Math.floor((p / 100) * LOADING_TOTAL_CHUNKS);
        loadingChunks.forEach((c, i) => {
            c.classList.toggle("is-active", i < active);
        });
        
        if (loadingPercentage) {
            loadingPercentage.textContent = `${p}%`;
        }
        
        if (loadingStatus) {
            if (p < 30) loadingStatus.textContent = "INITIALIZING CORE...";
            else if (p < 60) loadingStatus.textContent = "LOADING ASSETS...";
            else if (p < 90) loadingStatus.textContent = "SYNCHRONIZING DATA...";
            else loadingStatus.textContent = "DONE";
        }
    }

    function tickLoading() {
        if (loadingPercent < loadingTarget) {
            loadingPercent++;
            renderLoading(loadingPercent);
        }
        requestAnimationFrame(tickLoading);
    }

    tickLoading();

    document.addEventListener("DOMContentLoaded", () => {
        loadingTarget = 40;
    });

    document.addEventListener("readystatechange", () => {
        if (document.readyState === "interactive") {
            loadingTarget = 70;
        }
    });

    window.addEventListener("load", () => {
        loadingTarget = 100;

        setTimeout(() => {
            document.body.classList.add("finished");
            window.dispatchEvent(new Event("app:loaded"));
        }, 500); // Tăng delay một chút để người dùng kịp thấy "DONE"
    });
}