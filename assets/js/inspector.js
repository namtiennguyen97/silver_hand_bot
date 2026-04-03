/* ===============================================================
   INSPECTOR.JS - Game Manager for Member Approval Mini-game
   Papers Please style camp recruitment inspector
=============================================================== */

/* ================================================
   DAY DATA - Criteria & Applicants
================================================ */
/* ================================================
   NPC IMAGE POOL
================================================ */
const NPC_IMAGES = [
    'assets/img/inspector_npc/npc_1.png',
    'assets/img/inspector_npc/npc_2.png',
    'assets/img/inspector_npc/npc_3.png',
    'assets/img/inspector_npc/npc_4.png',
    'assets/img/inspector_npc/npc_5.png',
    'assets/img/inspector_npc/npc_6.png',
    'assets/img/inspector_npc/npc_7.png',
    'assets/img/inspector_npc/npc_8.png',
    'assets/img/inspector_npc/npc_9.png',
    'assets/img/inspector_npc/npc_10.png',
];

// Fisher-Yates shuffle, returns shuffled copy
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Assign unique NPC images to all applicants in a day (no repeats)
function assignNpcImages(dayIndex) {
    const applicants = GAME_DAYS[dayIndex].applicants;
    const pool = shuffleArray(NPC_IMAGES);
    applicants.forEach((app, i) => {
        app.img = pool[i % pool.length];
    });
}

const GAME_DAYS = [

    /* ===== DAY 1 ===== */
    {
        day: 1,
        title: "Ngày đầu tiên",
        subtitle: "SCREENING DAY 01 — CHECKPOINT ALPHA",
        criteria: [
            { icon: "✅", cls: "ok",      text: "Approve individuals with practical survival skills (Farmer, Medic, Engineer)" },
            { icon: "✅", cls: "ok",      text: "Approve individuals with no prior criminal record on the server" },
            { icon: "⛔", cls: "danger",  text: "Deny individuals affiliated with enemy camps (Red Faction Logo)" },
            { icon: "⚠️", cls: "warning", text: "Caution: Unidentified professions may be masking their identity" }
        ],
        applicants: [
            {
                id: "A01", name: "ALEX 'GREENFIELD' HART", img: null,
                profession: "Farmer / Livestock", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Hey... name's Alex. I grow crops, raise livestock. My settlement got hit 3 days ago.", next: "l2" },
                    { text: "No weapons, no record. Just looking for a safe place for what's left of my family.", next: null }
                ]
            },
            {
                id: "A02", name: "??? [UNIDENTIFIED]", img: null,
                profession: "Undisclosed", criminal: false, enemyCamp: false,
                shouldApprove: false,
                lines: [
                    { text: "Look, I don't need to explain myself. Just let me in. I'll be useful.", next: "l2" },
                    { text: "Occupation? Doesn't matter. You're asking too many questions.", next: null }
                ]
            },
            {
                id: "A03", name: "SARA 'MEND' COLE", img: null,
                profession: "Field Medic", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "I'm a medic. Three years running a field clinic out in Silent Plain.", next: "l2" },
                    { text: "I can treat wounded and sort out meds. Every camp needs someone like me.", next: null }
                ]
            },
            {
                id: "A04", name: "MARCUS VANE", img: null,
                profession: "Ex Mercenary", criminal: false, enemyCamp: true,
                shouldApprove: false,
                lines: [
                    { text: "Heh... SAO-ĐÊM. Heard this camp's got muscle. I want in.", next: "l2" },
                    { text: "[A red faction logo briefly exposed under his jacket as he raises his arm]", next: null }
                ]
            },
            {
                id: "A05", name: "DEREK 'MASON' FORD", img: null,
                profession: "Engineer / Construction", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "I build shelters, fortifications, dig trenches — all by hand if needed.", next: "l2" },
                    { text: "No guns, no politics. Just give me tools and materials and I'll get to work.", next: null }
                ]
            },
            {
                id: "A06", name: "LENA CROSS", img: null,
                profession: "Black Market Trader", criminal: true, enemyCamp: false,
                shouldApprove: false,
                lines: [
                    { text: "Hi there. I'm a merchant — I can connect your camp with major supply lines.", next: "l2" },
                    { text: "[SYSTEM ALERT: 1 violation — illegal arms exchange recorded at Mount Gray Bear sector]", next: null }
                ]
            },
            {
                id: "A07", name: "RYAN 'TRACKER' WOLFE", img: null,
                profession: "Hunter / Scout", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Survived solo in the wilds for 8 months. Know the terrain, know the traps.", next: "l2" },
                    { text: "You need someone to scout and forage? I'm your best option.", next: null }
                ]
            }
        ]
    },

    /* ===== DAY 2 ===== */
    {
        day: 2,
        title: "Day Two",
        subtitle: "SCREENING DAY 02 — TÌNH HÌNH CĂN KIỆT",
        criteria: [
            { icon: "✅", cls: "ok",      text: "Priority: Tier 3+ combat level individuals" },
            { icon: "✅", cls: "ok",      text: "Approve members who have participated in Patrol or Shelter Land ops" },
            { icon: "⛔", cls: "danger",  text: "Deny accounts less than 30 days old on the server" },
            { icon: "⚠️", cls: "warning", text: "Investigate: Carrying more than 1 heavy weapon" }
        ],
        applicants: [
            {
                id: "B01", name: "VICTOR 'IRON' SHAW", img: null,
                profession: "Combat Veteran", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "I've run 4 Shelter Land ops with my old camp. Tier 4 fighter.", next: "l2" },
                    { text: "Camp dissolved after the turf dispute last month. Looking for a new home base.", next: null }
                ]
            },
            {
                id: "B02", name: "MIKA REED", img: null,
                profession: "Recruit — New Player", criminal: false, enemyCamp: false,
                shouldApprove: false,
                lines: [
                    { text: "I've only been on the server for... 12 days. But I learn super fast, I promise!", next: "l2" },
                    { text: "Never been in a raid yet, but I really want to contribute if you give me a chance.", next: null }
                ]
            },
            {
                id: "B03", name: "JAMES 'GHOST' COLE", img: null,
                profession: "Sniper / Marksman", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Tier 5 sniper. 47 days old account. Held overwatch in 6 consecutive Patrol missions.", next: "l2" },
                    { text: "Carrying one rifle and personal ammo. All registered and legit.", next: null }
                ]
            },
            {
                id: "B04", name: "DANTE KRIEG", img: null,
                profession: "???", criminal: false, enemyCamp: false,
                shouldApprove: false,
                lines: [
                    { text: "Just let me in already. I've got 3 heavy machine guns, an RPG and 2 crates of ammo.", next: "l2" },
                    { text: "I can handle anyone in your way. Anyone — including your own squad.", next: null }
                ]
            },
            {
                id: "B05", name: "COMMANDER ELISE VALE", img: null,
                profession: "Ex-Camp Commander", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Former Major of Camp Dark Steel. 82-day account. Led 3 Shelter Land operations.", next: "l2" },
                    { text: "Dark Steel disbanded this month. I need a disciplined camp to keep fighting.", next: null }
                ]
            },
            {
                id: "B06", name: "SEAN 'SHIELD' PARKS", img: null,
                profession: "Close-range Guard", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "55-day account, Tier 3 CQC. Specialize in escort and member protection during patrols.", next: "l2" },
                    { text: "One combat knife, one sidearm. Nothing more, nothing less.", next: null }
                ]
            }
        ]
    },

    /* ===== DAY 3 ===== */
    {
        day: 3,
        title: "Final Day",
        subtitle: "SCREENING DAY 03 — NGUY CƠ NỘI GIÁN",
        criteria: [
            { icon: "⛔", cls: "danger",  text: "Deny anyone linked to Delta-9 camp (Confirmed Espionage)" },
            { icon: "⛔", cls: "danger",  text: "Deny individuals with red tattoos on neck/arms (Cartel Marks)" },
            { icon: "✅", cls: "ok",      text: "Approve individuals referred of Official camp members" },
            { icon: "⚠️", cls: "warning", text: "Caution: Delta-9 is attempting to plant operatives in major camps" }
        ],
        applicants: [
            {
                id: "C01", name: "ARIA CHEN", img: null,
                profession: "Referred by Official Bao", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Officer Bao sent me. He said to come find the Mayor directly.", next: "l2" },
                    { text: "I specialize in resource recovery and food processing. Nothing to do with Delta-9.", next: null }
                ]
            },
            {
                id: "C02", name: "BLAKE 'SHADOW' FINN", img: null,
                profession: "Ex Delta-9 Operative", criminal: false, enemyCamp: true,
                shouldApprove: false,
                lines: [
                    { text: "Heard you need people. I've got solid experience in night ops.", next: "l2" },
                    { text: "[ID scan detects a Delta-9 badge tucked beneath the folds of his jacket]", next: null }
                ]
            },
            {
                id: "C03", name: "WOLF STRIDER", img: null,
                profession: "Drifter — No affiliation", criminal: false, enemyCamp: false,
                shouldApprove: false,
                lines: [
                    { text: "Just a free agent. No camp, no crew. Been wandering solo for months.", next: "l2" },
                    { text: "[Security camera zoom: clear view of a red serpent tattoo on the left side of his neck]", next: null }
                ]
            },
            {
                id: "C04", name: "VERA 'WRENCH' KIM", img: null,
                profession: "Referred by Official Mai", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Officer Mai sent me. I'm a tech specialist — weapons maintenance and vehicle repair.", next: "l2" },
                    { text: "No dark affiliations. Mai can vouch for me completely.", next: null }
                ]
            },
            {
                id: "C05", name: "REED 'WHISPER' CALLOWAY", img: null,
                profession: "Intelligence — [WARNING]", criminal: false, enemyCamp: true,
                shouldApprove: false,
                lines: [
                    { text: "Please — I'm running from Delta-9. They want me dead because I know too much.", next: "l2" },
                    { text: "[Behavioral analysis: speech too rehearsed, zero signs of genuine fear — scripted narrative detected]", next: null }
                ]
            },
            {
                id: "C06", name: "LUNA HAYES", img: null,
                profession: "Pharmacist — Referred by Official Thien", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "I can synthesize medicine and vaccines from wild-crafted materials. Officer Thien can confirm.", next: "l2" },
                    { text: "Zero Delta-9 links. No tattoos. I just want to live and contribute.", next: null }
                ]
            },
            {
                id: "C07", name: "UNKNOWN DRIFTER", img: null,
                profession: "Origin: Unverified", criminal: false, enemyCamp: true,
                shouldApprove: false,
                lines: [
                    { text: "I need into this camp. Now. No time for explanations.", next: "l2" },
                    { text: "[Auto-scan: Delta-9 tracking device detected inside subject's backpack]", next: null }
                ]
            }
        ]
    }
];

/* ================================================
   MAYOR INTRO SCRIPTS (Day Introductions)
================================================ */
const MAYOR_INTRO_SCRIPTS = {
    day_1: {
        'start': {
            speaker: 'MAYOR AI',
            side: 'right',
            image: 'assets/img/mayor_dialogue_1.png',
            text: 'Chào mừng Tactician. Chào mừng bạn đến với quy trình kiểm soát nhân sự đầu tiên của Camp SAO-ĐÊM.',
            next: 'd1_2'
        },
        'd1_2': {
            speaker: 'MAYOR AI',
            side: 'right',
            text: 'Camp chúng ta đang phát triển, nhưng an ninh là ưu tiên hàng đầu. Hãy lọc kỹ những người tị nạn.',
            next: 'd1_3'
        },
        'd1_3': {
            speaker: 'MAYOR AI',
            side: 'right',
            image: 'assets/img/mayor_dialogue_2.png',
            text: 'Ưu tiên những người có kỹ năng sinh tồn thực tế. Tuyệt đối không nhận kẻ phạm tội hay gián điệp camp thù địch.',
            next: 'd1_4'
        },
        'd1_4': {
            speaker: 'MAYOR AI',
            side: 'right',
            text: 'Chúc may mắn. Tôi sẽ giám sát kết quả của bạn vào cuối ngày.',
            next: null
        }
    },
    day_2: {
        'start': {
            speaker: 'MAYOR AI',
            side: 'right',
            image: 'assets/img/mayor_dialogue_2.png',
            effect: 'flash',
            text: 'Báo cáo tình hình: Nguồn cung thực phẩm đang cạn kiệt. Chúng ta cần những người có thực lực chiến đấu thực sự.',
            next: 'd2_2'
        },
        'd2_2': {
            speaker: 'MAYOR AI',
            side: 'right',
            text: 'Hôm nay, hãy chú ý đến những người có Tier chiến đấu cao và đã từng tham gia tuần tra. Họ sẽ giúp ích cho Shelter Land tới.',
            next: 'd2_3'
        },
        'd2_3': {
            speaker: 'MAYOR AI',
            side: 'right',
            image: 'assets/img/mayor_dialogue_3.png',
            text: 'Cẩn thận với những kẻ mang nhiều vũ khí hạng nặng nhưng không rõ lai lịch. Đừng để chúng lọt lưới.',
            next: null
        }
    },
    day_3: {
        'start': {
            speaker: 'MAYOR AI',
            side: 'right',
            image: 'assets/img/mayor_dialogue_1.png',
            effect: 'shake',
            text: 'Báo động cấp độ ĐỎ! Hệ thống radar phát hiệu tín hiệu của gián điệp trà trộn trong dòng người tị nạn.',
            next: 'd3_2'
        },
        'd3_2': {
            speaker: 'MAYOR AI',
            side: 'right',
            text: 'Hôm nay, chỉ được duyệt những người có thông tin minh bạch 100%. Nếu thấy bất cứ nghi vấn nào, hãy TỪ CHỐI ngay lập tức.',
            next: 'd3_3'
        },
        'd3_3': {
            speaker: 'MAYOR AI',
            side: 'right',
            image: 'assets/img/mayor_dialogue_2.png',
            text: 'Sự tồn vong của SAO-ĐÊM nằm trong tay bạn. Hãy làm tốt nhiệm vụ cuối cùng này.',
            next: null
        }
    }
};

/* ================================================
   GAME STATE
================================================ */
const State = {
    day: 0,
    applicantIndex: 0,
    currentLine: 0,
    approved: 0,
    rejected: 0,
    correct: 0,
    wrong: 0,
    totalScore: 0,
    dialogueDone: false,
    processing: false,
    dayScores: []
};

/* ================================================
   DOM REFS
================================================ */
const $ = id => document.getElementById(id);
let criteriaBoard, npcCharImg, npcSkeleton, dlgSpeaker, dlgText, dlgNext,
    approveBtn, rejectBtn, dayTransition, resultsScreen, gameOverScreen,
    decisionFlash, stampOverlay, applicantCounter, dayBadge, scoreDisplay, lookupTerminal;

let vnEngine;

/* ================================================
   INITIALIZE
================================================ */
let _initialized = false;
function initGame() {
    if (_initialized) return;
    _initialized = true;

    criteriaBoard    = $('criteriaBoard');
    npcCharImg       = $('npcCharImg');
    npcSkeleton      = $('npcSkeleton');
    dlgSpeaker       = $('dlgSpeaker');
    dlgText          = $('dlgText');
    dlgNext          = $('dlgNext');
    approveBtn       = $('approveBtn');
    rejectBtn        = $('rejectBtn');
    dayTransition    = $('dayTransition');
    resultsScreen    = $('resultsScreen');
    gameOverScreen   = $('gameOverScreen');
    decisionFlash    = $('decisionFlash');
    stampOverlay     = $('stampOverlay');
    applicantCounter = $('applicantCounter');
    dayBadge         = $('dayBadge');
    scoreDisplay     = $('scoreDisplay');
    lookupTerminal   = $('lookupTerminal');

    // Dialogue click to advance
    $('inspectorDialogue').addEventListener('click', () => advanceLine());

    // Decision buttons
    approveBtn.addEventListener('click', () => makeDecision(true));
    rejectBtn.addEventListener('click',  () => makeDecision(false));

    // Lookup terminal toggle — with modal support
    window.toggleCriteria = (forceClose) => {
        const isOpen = criteriaBoard.classList.contains('show');
        if (forceClose || isOpen) {
            criteriaBoard.classList.remove('show');
        } else {
            criteriaBoard.classList.add('show');
        }
    };
    lookupTerminal.addEventListener('click', () => window.toggleCriteria());

    // Init VN Engine for introductions
    vnEngine = new VNEngine();

    showDayTransition(0);
}

// Primary: wait for loading animation to finish
window.addEventListener('app:loaded', initGame);

// Fallback: in case app:loaded already fired or loading.js is absent
if (document.readyState === 'complete') {
    setTimeout(initGame, 600);
} else {
    window.addEventListener('load', () => setTimeout(initGame, 600));
}


/* ================================================
   DAY TRANSITION
================================================ */
function showDayTransition(dayIndex) {
    State.day = dayIndex;
    const day = GAME_DAYS[dayIndex];

    dayTransition.querySelector('.dt-eyecatch').textContent = `DAY ${day.day}`;
    dayTransition.querySelector('.dt-subtitle').textContent = day.subtitle;
    dayTransition.classList.add('show');

    dayTransition.querySelector('.dt-start-btn').onclick = () => {
        dayTransition.classList.remove('show');

        // Start Mayor Intro first
        const introKey = `day_${dayIndex + 1}`;
        if (MAYOR_INTRO_SCRIPTS[introKey]) {
            setTimeout(() => {
                vnEngine.start(MAYOR_INTRO_SCRIPTS[introKey], 'start', () => {
                    startDay(dayIndex);
                });
            }, 500);
        } else {
            setTimeout(() => startDay(dayIndex), 500);
        }
    };
}


/* ================================================
   START DAY
================================================ */
function startDay(dayIndex) {
    const day = GAME_DAYS[dayIndex];
    State.applicantIndex = 0;
    State.approved = 0;
    State.rejected = 0;
    State.correct  = 0;
    State.wrong    = 0;
    State.dialogueDone = false;

    // Assign unique random NPC images for this day
    assignNpcImages(dayIndex);

    // Hide criteria at start of day
    if (criteriaBoard) criteriaBoard.classList.remove('show');

    // Update HUD
    if (dayBadge) dayBadge.textContent = `DAY ${day.day} / ${GAME_DAYS.length}`;

    // Render criteria
    renderCriteria(day.criteria);

    // Load first applicant
    loadApplicant(dayIndex, 0);
}

/* ================================================
   RENDER CRITERIA
================================================ */
function renderCriteria(rules) {
    const body = criteriaBoard.querySelector('.criteria-body');
    body.innerHTML = rules.map(r => `
        <div class="criteria-rule ${r.cls}">
            <span class="criteria-icon">${r.icon}</span>
            <span>${r.text}</span>
        </div>
    `).join('');
}

/* ================================================
   LOAD APPLICANT
================================================ */
function loadApplicant(dayIndex, applicantIndex) {
    const day = GAME_DAYS[dayIndex];
    const applicants = day.applicants;

    if (applicantIndex >= applicants.length) {
        showDayResults(dayIndex);
        return;
    }

    State.applicantIndex = applicantIndex;
    State.currentLine    = 0;
    State.dialogueDone   = false;
    State.processing     = false;

    const applicant = applicants[applicantIndex];

    // Update counter
    if (applicantCounter) {
        applicantCounter.innerHTML = `Đơn thứ <span>${applicantIndex + 1}</span> / ${applicants.length}`;
    }

    // Disable buttons
    approveBtn.classList.remove('active');
    rejectBtn.classList.remove('active');

    // Hide old image, show skeleton while new image loads
    npcCharImg.classList.remove('npc-enter', 'npc-exit');
    npcCharImg.style.opacity = '0';   // hide via inline style
    npcSkeleton.classList.add('active');

    // Update dialogue speaker immediately
    dlgSpeaker.textContent = applicant.name;
    dlgText.textContent    = '';
    dlgNext.style.display  = 'none';

    // Preload the new NPC image before showing it
    const preload = new Image();
    preload.onload = () => {
        // Image ready — swap src, clear inline opacity, slide in
        npcCharImg.src = applicant.img;
        npcCharImg.style.opacity = '';   // ← clear inline style so CSS/animation takes over
        npcSkeleton.classList.remove('active');
        npcCharImg.classList.add('npc-enter');
        npcCharImg.onanimationend = () => npcCharImg.classList.remove('npc-enter');

        // Start typing first line after image appears
        setTimeout(() => typeLine(applicant.lines[0].text), 400);
    };
    preload.onerror = () => {
        // Fallback if image fails: hide skeleton and continue
        npcSkeleton.classList.remove('active');
        npcCharImg.style.opacity = '0';
        setTimeout(() => typeLine(applicant.lines[0].text), 300);
    };
    preload.src = applicant.img;
}

/* ================================================
   TYPEWRITER
================================================ */
let typeTimer = null;
function typeLine(text) {
    if (typeTimer) clearInterval(typeTimer);
    dlgText.textContent = '';
    dlgNext.style.display = 'none';

    let i = 0;
    typeTimer = setInterval(() => {
        dlgText.textContent += text.charAt(i);
        i++;
        if (i >= text.length) {
            clearInterval(typeTimer);
            typeTimer = null;
            dlgNext.style.display = 'block';

            // Check if this is last line
            const applicant = GAME_DAYS[State.day].applicants[State.applicantIndex];
            const line = applicant.lines[State.currentLine];
            if (!line.next) {
                State.dialogueDone = true;
                setTimeout(() => {
                    approveBtn.classList.add('active');
                    rejectBtn.classList.add('active');
                }, 400);
            }
        }
    }, 28);
}

function advanceLine() {
    if (State.processing) return;

    const applicant = GAME_DAYS[State.day].applicants[State.applicantIndex];

    // If still typing, skip to end
    if (typeTimer) {
        clearInterval(typeTimer);
        typeTimer = null;
        dlgText.textContent = applicant.lines[State.currentLine].text;
        dlgNext.style.display = 'block';
        const line = applicant.lines[State.currentLine];
        if (!line.next) {
            State.dialogueDone = true;
            setTimeout(() => {
                approveBtn.classList.add('active');
                rejectBtn.classList.add('active');
            }, 200);
        }
        return;
    }

    if (State.dialogueDone) return; // Wait for button press

    // Move to next line
    const line = applicant.lines[State.currentLine];
    if (line.next) {
        const nextLineIndex = State.currentLine + 1;
        if (nextLineIndex < applicant.lines.length) {
            State.currentLine = nextLineIndex;
            typeLine(applicant.lines[nextLineIndex].text);
        }
    }
}

/* ================================================
   MAKE DECISION
================================================ */
function makeDecision(isApprove) {
    if (!State.dialogueDone || State.processing) return;
    State.processing = true;

    const applicant = GAME_DAYS[State.day].applicants[State.applicantIndex];
    const isCorrect = (isApprove === applicant.shouldApprove);

    if (isApprove) State.approved++; else State.rejected++;
    if (isCorrect)  State.correct++;  else State.wrong++;
    State.totalScore += isCorrect ? 10 : -5;

    // Update score display
    if (scoreDisplay) scoreDisplay.textContent = `SCORE: ${State.totalScore}`;

    // Flash feedback
    decisionFlash.className = isApprove ? 'flash-approve' : 'flash-reject';
    setTimeout(() => decisionFlash.className = '', 500);

    // Stamp
    stampOverlay.classList.remove('show');
    void stampOverlay.offsetWidth;
    stampOverlay.querySelector('.stamp-text').className = `stamp-text ${isApprove ? 'approved' : 'rejected'}`;
    stampOverlay.querySelector('.stamp-text').textContent = isApprove ? 'DUYỆT' : 'TỪ CHỐI';
    stampOverlay.classList.add('show');

    // Disable buttons
    approveBtn.classList.remove('active');
    rejectBtn.classList.remove('active');

    // Slide out NPC and load next
    setTimeout(() => {
        npcCharImg.classList.add('npc-exit');
        stampOverlay.classList.remove('show');
        setTimeout(() => {
            loadApplicant(State.day, State.applicantIndex + 1);
        }, 500);
    }, 1200);
}

/* ================================================
   SHOW DAY RESULTS
================================================ */
function showDayResults(dayIndex) {
    State.dayScores.push({
        day: dayIndex + 1,
        correct: State.correct,
        wrong:   State.wrong,
        approved: State.approved,
        rejected: State.rejected
    });

    const accuracy = Math.round((State.correct / (State.correct + State.wrong)) * 100) || 0;
    const msg = accuracy >= 80
        ? "Tốt! Phán đoán chính xác. SAO-ĐÊM nhận đúng người cần thiết."
        : accuracy >= 50
        ? "Khá. Một số quyết định còn do dự. Hãy đọc kỹ tiêu chí hơn nhé."
        : "Không tốt. Nhiều sai sót nghiêm trọng. Camp có nguy cơ bị xâm nhập.";

    const screen = resultsScreen;
    screen.querySelector('.results-title').textContent = `// KẾT QUẢ NGÀY ${dayIndex + 1} //`;
    screen.querySelector('#rs-correct').textContent    = State.correct;
    screen.querySelector('#rs-wrong').textContent      = State.wrong;
    screen.querySelector('#rs-approved').textContent   = State.approved;
    screen.querySelector('#rs-rejected').textContent   = State.rejected;
    screen.querySelector('#rs-accuracy').textContent   = `${accuracy}%`;
    screen.querySelector('#rs-msg').textContent        = msg;

    const nextDayIndex = dayIndex + 1;
    const isLast = nextDayIndex >= GAME_DAYS.length;
    const nextBtn = screen.querySelector('.results-next-btn');
    nextBtn.textContent = isLast ? '// XEM KẾT QUẢ TỔNG //' : `// NGÀY ${nextDayIndex + 1} //`;
    nextBtn.onclick = () => {
        screen.classList.remove('show');
        if (isLast) {
            setTimeout(() => showGameOver(), 600);
        } else {
            setTimeout(() => showDayTransition(nextDayIndex), 600);
        }
    };

    setTimeout(() => screen.classList.add('show'), 400);
}

/* ================================================
   SHOW GAME OVER
================================================ */
function showGameOver() {
    const totalCorrect  = State.dayScores.reduce((a, d) => a + d.correct, 0);
    const totalApps     = GAME_DAYS.reduce((a, d) => a + d.applicants.length, 0);
    const overallPct    = Math.round((totalCorrect / totalApps) * 100);
    const rank = overallPct >= 90 ? 'S — GRANDMASTER INSPECTOR'
               : overallPct >= 75 ? 'A — SENIOR INSPECTOR'
               : overallPct >= 60 ? 'B — INSPECTOR'
               : overallPct >= 40 ? 'C — JUNIOR ANALYST'
               : 'D — COMPROMISED';

    gameOverScreen.querySelector('.go-rank').textContent  = rank;
    gameOverScreen.querySelector('.go-title').textContent = '// MISSION COMPLETE //';
    gameOverScreen.querySelector('.go-score').innerHTML   = `${State.totalScore}<span> PTS</span>`;
    gameOverScreen.querySelector('#go-pct').textContent   = `Chính xác: ${overallPct}%  |  Tổng đúng: ${totalCorrect}/${totalApps}`;

    gameOverScreen.querySelector('#goReplay').onclick = () => {
        State.day = 0; State.totalScore = 0; State.dayScores = [];
        gameOverScreen.classList.remove('show');
        setTimeout(() => showDayTransition(0), 600);
    };
    gameOverScreen.querySelector('#goHome').onclick = () => {
        window.location.href = 'index.html';
    };

    setTimeout(() => gameOverScreen.classList.add('show'), 600);
}
