/* ===============================================================
   CAMP AEGIS — Core Game Logic
   Isometric Camp Management with Weather & Real-time Growth
=============================================================== */

const CAMP_CONFIG = {
    SAVE_KEY: 'camp_aegis_save',
    GRID_ROWS: 3,
    GRID_COLS: 4,
    PLOT_SIZE: 120, // Base isometric unit
    INITIAL_CREDITS: 1000,
    WEATHER_SYNC_INTERVAL: 30 * 60 * 1000, // 30 mins
};

// Cây trồng / Công trình
const BUILDING_TYPES = {
    EMPTY: { id: 'empty', name: 'Đất trống', icon: '🕳️' },
    FARM:  { 
        id: 'farm', name: 'Lô đất trồng', icon: '🌾', cost: 100,
        crops: {
            synth_herb: { name: ' Synth Herb', growTime: 60, yield: 2, icon: '🌿', xp: 10 },
            data_crystal: { name: 'Data Crystal', growTime: 300, yield: 1, icon: '🔵', xp: 50 },
            energy_root: { name: 'Energy Root', growTime: 3600, yield: 1, icon: '⚡', xp: 200 }
        }
    },
    WORKSHOP: { id: 'workshop', name: 'Xưởng chế biến', icon: '🏭', cost: 500 },
    MARKET:   { id: 'market', name: 'Chợ NPC', icon: '🏪', cost: 300 }
};

let gameState = {
    credits: CAMP_CONFIG.INITIAL_CREDITS,
    plots: [], // Flattened grid
    inventory: {},
    tech: [],
    weather: { temp: 25, desc: 'Clear', code: 0, location: 'Hanoi' },
    lastOnline: Date.now()
};

// --- CANVAS SETUP ---
let canvas, ctx;
let offsetX = 0, offsetY = 0;
let isDragging = false, lastMousePos = { x: 0, y: 0 };
let selectedPlotIndex = -1;

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    updateLoading('SYNCING NEURAL NETWORK...', 20);
    
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    updateLoading('LOADING CAMP DATA...', 40);
    loadGame();

    updateLoading('FETCHING ATMOSPHERIC DATA...', 70);
    await fetchWeather();

    updateLoading('INITIALIZING GRID...', 90);
    setupGridEvents();
    
    // Start Loops
    setInterval(gameTick, 1000);
    requestAnimationFrame(renderLoop);
    
    updateLoading('WELCOME BACK, COMMANDER', 100);
    setTimeout(() => {
        document.getElementById('loadingOverlay').style.opacity = '0';
        setTimeout(() => document.getElementById('loadingOverlay').remove(), 500);
    }, 800);
}

function updateLoading(status, percent) {
    document.getElementById('loadingStatus').textContent = status;
    document.getElementById('loadingPercentage').textContent = percent + '%';
    document.getElementById('loadingProgress').style.width = percent + '%';
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 160; // Subtract HUD/Nav
    // Center the grid
    offsetX = canvas.width / 2;
    offsetY = 100;
}

// --- WEATHER (Open-Meteo) ---
async function fetchWeather() {
    try {
        const lat = 21.0285, lon = 105.8542; // Hanoi
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.current_weather) {
            const cw = data.current_weather;
            gameState.weather.temp = cw.temperature;
            gameState.weather.code = cw.weathercode;
            gameState.weather.desc = interpretWeatherCode(cw.weathercode);
            updateWeatherUI();
        }
    } catch (e) {
        console.warn("Weather fetch failed, using fallback.", e);
    }
}

function interpretWeatherCode(code) {
    if (code === 0) return 'TRỜI QUANG';
    if (code <= 3) return 'HƠI CÓ MÂY';
    if (code <= 48) return 'SƯƠNG MÙ';
    if (code <= 67) return 'MƯA NHẸ';
    if (code <= 82) return 'MƯA LỚN';
    if (code <= 99) return 'GIÔNG BÃO';
    return 'DỮ LIỆU LỖI';
}

function updateWeatherUI() {
    document.getElementById('w-temp').textContent = `${gameState.weather.temp}°C`;
    document.getElementById('w-desc').textContent = gameState.weather.weathercode > 60 ? `⚠️ ${gameState.weather.desc}` : gameState.weather.desc;
    document.getElementById('w-icon').textContent = getWeatherIcon(gameState.weather.weathercode);
}

function getWeatherIcon(code) {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 67) return '🌧️';
    if (code <= 82) return '⛈️';
    return '❓';
}

// --- GRID & PLOTS ---
function initPlots() {
    const total = CAMP_CONFIG.GRID_ROWS * CAMP_CONFIG.GRID_COLS;
    for (let i = 0; i < total; i++) {
        gameState.plots.push({
            id: i,
            type: 'empty',
            plantedAt: null,
            cropType: null,
            level: 1,
            owner: null // Link to approved member later
        });
    }
}

function setupGridEvents() {
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        offsetX += e.clientX - lastMousePos.x;
        offsetY += e.clientY - lastMousePos.y;
        lastMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - offsetX;
        const mouseY = e.clientY - rect.top - offsetY;

        // Convert Click to Isometric Map
        const plot = getPlotAt(mouseX, mouseY);
        if (plot) {
            handlePlotClick(plot);
        } else {
            closePlotMenu();
        }
    });
}

function getPlotAt(mx, my) {
    const size = CAMP_CONFIG.PLOT_SIZE;
    // Isometric reverse transform
    const col = Math.floor((mx / (size / 2) + my / (size / 4)) / 2);
    const row = Math.floor((my / (size / 4) - mx / (size / 2)) / 2);

    if (row >= 0 && row < CAMP_CONFIG.GRID_ROWS && col >= 0 && col < CAMP_CONFIG.GRID_COLS) {
        return gameState.plots[row * CAMP_CONFIG.GRID_COLS + col];
    }
    return null;
}

// --- RENDER ---
function renderLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const size = CAMP_CONFIG.PLOT_SIZE;
    const now = Date.now();

    for (let row = 0; row < CAMP_CONFIG.GRID_ROWS; row++) {
        for (let col = 0; col < CAMP_CONFIG.GRID_COLS; col++) {
            const plot = gameState.plots[row * CAMP_CONFIG.GRID_COLS + col];
            
            // Calc Screen Pos
            const screenX = (col - row) * (size / 2) + offsetX;
            const screenY = (col + row) * (size / 4) + offsetY;

            drawPlot(screenX, screenY, plot, now);
        }
    }
    
    // Updates HUD
    document.getElementById('creditsVal').textContent = Math.floor(gameState.credits).toLocaleString();
    document.getElementById('serverTime').textContent = `SYSTEM TIME: ${new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}`;

    requestAnimationFrame(renderLoop);
}

function drawPlot(x, y, plot, now) {
    const size = CAMP_CONFIG.PLOT_SIZE;
    
    // Draw Base Diamond
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size/2, y + size/4);
    ctx.lineTo(x, y + size/2);
    ctx.lineTo(x - size/2, y + size/4);
    ctx.closePath();

    // Plot Styling
    ctx.fillStyle = plot.type === 'empty' ? 'rgba(0, 242, 255, 0.05)' : 'rgba(57, 255, 20, 0.1)';
    ctx.strokeStyle = plot.type === 'empty' ? 'rgba(0, 242, 255, 0.2)' : 'rgba(57, 255, 20, 0.4)';
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();

    // Draw Content Icon
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    let label = BUILDING_TYPES[plot.type.toUpperCase()].icon;
    
    if (plot.type === 'farm' && plot.cropType) {
        const crop = BUILDING_TYPES.FARM.crops[plot.cropType];
        
        // --- WEATHER & TECH INFLUENCE ---
        let growthMultiplier = 1;
        // Rain code (60-67) + Irrigation Grid Tech
        if (gameState.weather.code >= 60 && gameState.weather.code <= 67 && gameState.tech.includes('irrigation')) {
            growthMultiplier = 1.2; // 20% faster
        }
        
        const elapsed = (now - plot.plantedAt) / 1000;
        const progress = Math.min(1, (elapsed * growthMultiplier) / crop.growTime);
        
        if (progress >= 1) {
            label = '✅'; // Ready to harvest
            // Glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'var(--neon-green)';
        } else {
            label = crop.icon;
            // Draw progress bar
            ctx.fillStyle = '#111';
            ctx.fillRect(x - 20, y + size/2, 40, 4);
            ctx.fillStyle = 'var(--neon-blue)';
            ctx.fillRect(x - 20, y + size/2, 40 * progress, 4);
        }
    }

    ctx.fillText(label, x, y + size/2.5);
    ctx.shadowBlur = 0;

    // Plot Number
    ctx.font = '10px Share Tech Mono';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText(`#${plot.id + 1}`, x, y + 10);
}

// --- INTERACTIONS ---
function handlePlotClick(plot) {
    const menu = document.getElementById('plotMenu');
    menu.style.display = 'block';
    menu.style.left = (lastMousePos.x) + 'px';
    menu.style.top = (lastMousePos.y) + 'px';
    
    selectedPlotIndex = plot.id;
    const actions = document.getElementById('plotActions');
    actions.innerHTML = '';

    if (plot.type === 'empty') {
        renderActionButton(actions, 'Xây Farm (100C)', () => buildPlot('farm'));
        renderActionButton(actions, 'Xây Workshop (500C)', () => buildPlot('workshop'), gameState.credits < 500);
    } else if (plot.type === 'farm') {
        if (!plot.cropType) {
            renderActionButton(actions, 'Trồng Synth Herb', () => plantCrop('synth_herb'));
            renderActionButton(actions, 'Trồng Data Crystal', () => plantCrop('data_crystal'));
        } else {
            const crop = BUILDING_TYPES.FARM.crops[plot.cropType];
            const ready = (Date.now() - plot.plantedAt) / 1000 >= crop.growTime;
            if (ready) {
                renderActionButton(actions, `Thu hoạch ${crop.name}`, () => harvestCrop());
            } else {
                renderActionButton(actions, 'Đang lớn...', () => {}, true);
            }
        }
    }
}

function renderActionButton(parent, text, cb, disabled = false) {
    const btn = document.createElement('button');
    btn.className = 'btn-plot';
    btn.textContent = text;
    btn.disabled = disabled;
    btn.onclick = () => { cb(); closePlotMenu(); };
    parent.appendChild(btn);
}

function closePlotMenu() {
    document.getElementById('plotMenu').style.display = 'none';
}

function buildPlot(type) {
    const cost = BUILDING_TYPES[type.toUpperCase()].cost;
    if (gameState.credits >= cost) {
        gameState.credits -= cost;
        gameState.plots[selectedPlotIndex].type = type;
        saveGame();
    }
}

function plantCrop(cropId) {
    const plot = gameState.plots[selectedPlotIndex];
    plot.cropType = cropId;
    plot.plantedAt = Date.now();
    saveGame();
}

function harvestCrop() {
    const plot = gameState.plots[selectedPlotIndex];
    const crop = BUILDING_TYPES.FARM.crops[plot.cropType];
    
    // Add to inventory
    gameState.inventory[plot.cropType] = (gameState.inventory[plot.cropType] || 0) + crop.yield;
    gameState.plots[selectedPlotIndex].cropType = null;
    gameState.plots[selectedPlotIndex].plantedAt = null;
    
    // XP reward (stub)
    gameState.credits += 20; // Basic reward for selling immediately
    saveGame();
}

// --- SAVE / LOAD ---
function saveGame() {
    localStorage.setItem(CAMP_CONFIG.SAVE_KEY, JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem(CAMP_CONFIG.SAVE_KEY);
    if (saved) {
        gameState = JSON.parse(saved);
        // Handle offline growth logic later
    } else {
        initPlots();
    }
}

function gameTick() {
    // Basic tick for background logic
}
