/* =============================================
   CAMP COMMANDER: AEGIS PROTOCOL — LOGIC
============================================= */

// --- CONFIG & STATE ---
let gameState = {
  credits: 0,
  population: 100, // Starting population
  incomeBase: 5,
  levels: {
    energy: 1,
    defense: 1,
    comms: 0
  },
  lastUpdate: Date.now()
};

// Buff state
let activeBuffMultiplier = 1;

// --- UPGRADE DATA ---
const UPGRADES = {
  energy: {
    name: "Energy Core",
    icon: "⚡",
    baseCost: 100,
    costMultiplier: 1.5,
    effect: (lv) => lv * 5, // CR/sec bonus
    desc: (lv) => `Tăng hiệu quả năng lượng (+${(lv+1)*5} CR/sec)`
  },
  defense: {
    name: "Wall Grid",
    icon: "🛡️",
    baseCost: 250,
    costMultiplier: 1.8,
    effect: (lv) => lv * 10, // Security %
    desc: (lv) => `Gia cố bức tường (+10% Security)`
  },
  comms: {
    name: "Comms Array",
    icon: "📡",
    baseCost: 500,
    costMultiplier: 2.2,
    effect: (lv) => lv * 0.05, // Cost reduction %
    desc: (lv) => `Mở rộng kết nối (-${(lv+1)*5}% Cost Upgrade)`
  }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  loadLocalState();
  initUI();
  startGameLoop();
  syncGlobalData();
  
  // Update Global Treasury every 30 seconds
  setInterval(syncGlobalData, 30000);
});

function loadLocalState() {
  const saved = localStorage.getItem('camp_commander_save');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      gameState = { ...gameState, ...data };
      
      // Calculate offline income
      const now = Date.now();
      const diffSec = Math.floor((now - gameState.lastUpdate) / 1000);
      if (diffSec > 0) {
        const income = calculateTotalIncome() * diffSec;
        gameState.credits += income;
        console.log(`Offline income: ${income} CR across ${diffSec}s`);
      }
    } catch (e) {
      console.error("Failed to load save", e);
    }
  }
  
  // Get current user info from index.html shared storage if available
  const user = JSON.parse(localStorage.getItem('pgr_user') || '{}');
  if (user.username) {
    document.getElementById('currentUserDisplay').textContent = `COMMANDER: ${user.username.toUpperCase()}`;
  }
}

function saveLocalState() {
  gameState.lastUpdate = Date.now();
  localStorage.setItem('camp_commander_save', JSON.stringify(gameState));
}

// --- UI UPDATES ---
function initUI() {
  updateStats();
  renderUpgrades();
  
  // Event Listeners
  document.getElementById('collectBtn').addEventListener('click', handleManualCollect);
  document.getElementById('donateBtn').addEventListener('click', handleDonate);
}

function updateStats() {
  document.getElementById('statCredits').textContent = Math.floor(gameState.credits).toLocaleString();
  document.getElementById('statPop').textContent = gameState.population.toLocaleString();
  document.getElementById('incomeVal').textContent = calculateTotalIncome();
}

function calculateTotalIncome() {
  let income = gameState.incomeBase;
  income += (gameState.levels.energy - 1) * 5;
  return income * activeBuffMultiplier;
}

function getUpgradeCost(id) {
  const up = UPGRADES[id];
  const lv = gameState.levels[id];
  let cost = Math.floor(up.baseCost * Math.pow(up.costMultiplier, lv));
  
  // Apply comms discount
  if (gameState.levels.comms > 0) {
    const discount = UPGRADES.comms.effect(gameState.levels.comms);
    cost = Math.floor(cost * (1 - discount));
  }
  return cost;
}

function renderUpgrades() {
  const list = document.getElementById('upgradeList');
  list.innerHTML = '';
  
  for (const id in UPGRADES) {
    const up = UPGRADES[id];
    const lv = gameState.levels[id];
    const cost = getUpgradeCost(id);
    const canAfford = gameState.credits >= cost;
    
    const card = document.createElement('div');
    card.className = `upgrade-card ${id}-card`;
    card.innerHTML = `
      <div class="up-icon">${up.icon}</div>
      <div class="up-info">
        <div class="up-name">${up.name}</div>
        <div class="up-level">Lv. ${lv}</div>
        <div class="up-desc">${up.desc(lv)}</div>
      </div>
      <button class="up-btn" id="upBtn-${id}" ${canAfford ? '' : 'disabled'}>
        <span class="cost">${cost.toLocaleString()}</span>
        <span class="currency">CR</span>
      </button>
    `;
    
    card.querySelector('button').onclick = () => buyUpgrade(id);
    list.appendChild(card);
  }
}

// --- GAME ACTIONS ---
function handleManualCollect(e) {
  const amount = 1 + Math.floor(calculateTotalIncome() * 0.1); // 10% of sec income or 1
  gameState.credits += amount;
  updateStats();
  createClickEffect(e, `+${amount}`);
  checkUpgradeAffordability();
}

function createClickEffect(e, text) {
  const container = document.getElementById('clickEffects');
  const effect = document.createElement('div');
  effect.className = 'click-float';
  
  // Get touch or mouse pos relative to button or window
  const rect = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left || rect.width / 2;
  const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top || rect.height / 2;
  
  effect.style.left = `${x}px`;
  effect.style.top = `${y}px`;
  effect.textContent = text;
  
  container.appendChild(effect);
  setTimeout(() => effect.remove(), 800);
}

function buyUpgrade(id) {
  const cost = getUpgradeCost(id);
  if (gameState.credits >= cost) {
    gameState.credits -= cost;
    gameState.levels[id]++;
    saveLocalState();
    updateStats();
    renderUpgrades();
    
    // SFX if available
    if (window.playSfx) {
         // Generic tech sound
    }
  }
}

function checkUpgradeAffordability() {
  for (const id in UPGRADES) {
    const btn = document.getElementById(`upBtn-${id}`);
    if (btn) {
      const cost = getUpgradeCost(id);
      btn.disabled = gameState.credits < cost;
    }
  }
}

// --- GLOBAL SYNC ---
async function syncGlobalData() {
  try {
    const res = await fetch('/api/camp');
    if (res.ok) {
      const data = await res.json();
      updateGlobalUI(data);
    }
  } catch (e) {
    console.error("Global sync failed", e);
  }
}

function updateGlobalUI(data) {
  const total = data.totalCredits || 0;
  document.getElementById('globalTotal').textContent = total.toLocaleString();
  
  // Milestone progress (example: 10M milestone)
  const milestone = 10000000;
  const progress = Math.min((total / milestone) * 100, 100);
  document.getElementById('globalProgress').style.width = `${progress}%`;
  
  // Buff state
  if (data.systemBuff && data.systemBuff.endAt > Date.now()) {
    activeBuffMultiplier = data.systemBuff.multiplier;
    document.getElementById('activeBuff').textContent = `ACTIVE BUFF: ${data.systemBuff.type} (x${activeBuffMultiplier})`;
    document.getElementById('activeBuff').classList.add('active');
  } else {
    activeBuffMultiplier = 1;
    document.getElementById('activeBuff').textContent = `ACTIVE BUFF: NONE`;
    document.getElementById('activeBuff').classList.remove('active');
  }
  
  // Donor list
  const list = document.getElementById('donorList');
  list.innerHTML = '';
  (data.donors || []).forEach(d => {
    const item = document.createElement('div');
    item.className = 'donor-item';
    item.innerHTML = `
      <img src="${d.avatar}" class="donor-avatar">
      <span class="donor-name">${d.username}</span>
      <span class="donor-amt">+${d.amount.toLocaleString()}</span>
    `;
    list.appendChild(item);
  });
}

async function handleDonate() {
  const amountInput = document.getElementById('donateAmount');
  const amount = parseInt(amountInput.value);
  
  if (isNaN(amount) || amount <= 0) {
    alert("Vui lòng nhập số tiền hợp lệ!");
    return;
  }
  
  if (gameState.credits < amount) {
    alert("Bạn không đủ Credits!");
    return;
  }
  
  const user = JSON.parse(localStorage.getItem('pgr_user') || '{}');
  
  try {
    const res = await fetch('/api/camp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'donate',
        amount: amount,
        username: user.username || "Guest Commander",
        avatar: user.avatar
      })
    });
    
    if (res.ok) {
      gameState.credits -= amount;
      amountInput.value = '';
      updateStats();
      saveLocalState();
      const updated = await res.json();
      updateGlobalUI(updated.data);
      alert(`Đã quyên góp ${amount} Credits vào quỹ doanh trại!`);
    }
  } catch (e) {
    alert("Lỗi kết nối server!");
  }
}

// --- MAIN LOOP ---
function startGameLoop() {
  setInterval(() => {
    const income = calculateTotalIncome() / 10; // Run 10 times per sec for smoothness
    gameState.credits += income;
    updateStats();
    checkUpgradeAffordability();
    
    // Save every 10 seconds
    if (Math.random() < 0.01) saveLocalState();
  }, 100);
}
