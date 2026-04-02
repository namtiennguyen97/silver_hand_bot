/* ===============================================================
   INSPECTOR.JS - Game Manager for Member Approval Mini-game
   Papers Please style camp recruitment inspector
=============================================================== */

/* ================================================
   DAY DATA - Criteria & Applicants
================================================ */
const GAME_DAYS = [

    /* ===== DAY 1 ===== */
    {
        day: 1,
        title: "Ngày đầu tiên",
        subtitle: "SCREENING DAY 01 — CHECKPOINT ALPHA",
        criteria: [
            { icon: "✅", cls: "ok",      text: "Nhận người có kỹ năng sinh tồn thực tế (nghề nông, y tế, xây dựng)" },
            { icon: "✅", cls: "ok",      text: "Nhận người chưa có tiền án phạm tội trong server" },
            { icon: "⛔", cls: "danger",  text: "Từ chối người đã thuộc camp thù địch (Logo màu đỏ)" },
            { icon: "⚠️", cls: "warning", text: "Thận trọng: Kẻ không khai nghề thường che giấu danh tính" }
        ],
        applicants: [
            {
                id: "A01", name: "NGUYỄN VĂN AN", img: "assets/img/npc_default.png",
                profession: "Nông dân", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Xin chào Thị trưởng... Tôi tên An, tôi trồng lúa và chăn nuôi được. Camp tôi bị tấn công 3 ngày trước.", next: "l2" },
                    { text: "Tôi không có vũ khí, không có lịch sử tấn công ai. Chỉ muốn tìm nơi sống sót cho gia đình mình.", next: null }
                ]
            },
            {
                id: "A02", name: "???  [ẨN DANH]", img: "assets/img/npc_default.png",
                profession: "Không khai", criminal: false, enemyCamp: false,
                shouldApprove: false,
                lines: [
                    { text: "Tôi... tôi không cần nói nhiều. Chỉ cần cho tôi vào. Tôi sẽ hữu ích.", next: "l2" },
                    { text: "Nghề à? Cái đó không quan trọng. Mấy ông hỏi nhiều quá.", next: null }
                ]
            },
            {
                id: "A03", name: "TRẦN THỊ BÌNH", img: "assets/img/npc_default.png",
                profession: "Y tá", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Tôi là y tá. 3 năm phục vụ ở bệnh xá dã chiến ngoài khu Silent Plain.", next: "l2" },
                    { text: "Tôi có thể chăm sóc thương binh và phân loại thuốc men. Camp nào cũng cần người như tôi.", next: null }
                ]
            },
            {
                id: "A04", name: "ĐOÀN QUANG MINH", img: "assets/img/npc_default.png",
                profession: "Cựu lính thuê", criminal: false, enemyCamp: true,
                shouldApprove: false,
                lines: [
                    { text: "Heh... SAO-ĐÊM hả. Nghe nói camp này mạnh. Tôi muốn gia nhập.", next: "l2" },
                    { text: "[Logo đỏ phía sau áo khoác lộ ra một khoảnh khắc khi hắn giơ tay lên]", next: null }
                ]
            },
            {
                id: "A05", name: "LÊ CÔNG HIỆU", img: "assets/img/npc_default.png",
                profession: "Thợ xây", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Tôi biết xây nhà, làm công sự, đào hầm phòng thủ. Tất cả đều làm được bằng tay.", next: "l2" },
                    { text: "Không cần súng, không cần đấu đá. Tôi chỉ cần công cụ và nguyên liệu.", next: null }
                ]
            },
            {
                id: "A06", name: "PHẠM THỊ LOAN", img: "assets/img/npc_default.png",
                profession: "Buôn bán", criminal: true, enemyCamp: false,
                shouldApprove: false,
                lines: [
                    { text: "Chào anh, tôi là thương nhân. Tôi có thể kết nối nguồn hàng cho camp.", next: "l2" },
                    { text: "[Hệ thống nhận diện: Có 1 vi phạm - Trao đổi vũ khí bất hợp pháp tại khu vực Mount Gray Bear]", next: null }
                ]
            },
            {
                id: "A07", name: "HOÀNG MINH TUẤN", img: "assets/img/npc_default.png",
                profession: "Thợ săn / Dẫn đường", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Tôi đã sống một mình ngoài vùng hoang dã 8 tháng. Biết địa hình, biết đánh bẫy thú.", next: "l2" },
                    { text: "Camp cần người scout và thu lương thực — tôi là lựa chọn tốt nhất.", next: null }
                ]
            }
        ]
    },

    /* ===== DAY 2 ===== */
    {
        day: 2,
        title: "Ngày thứ hai",
        subtitle: "SCREENING DAY 02 — TÌNH HÌNH CĂN KIỆT",
        criteria: [
            { icon: "✅", cls: "ok",      text: "Ưu tiên người có cấp độ chiến đấu (Tier 3 trở lên)" },
            { icon: "✅", cls: "ok",      text: "Nhận người từng tham gia Patrol hoặc Shelter Land" },
            { icon: "⛔", cls: "danger",  text: "Từ chối người chưa đủ 30 ngày tuổi tài khoản server" },
            { icon: "⚠️", cls: "warning", text: "Người mang quá 1 vũ khí hạng nặng cần điều tra thêm" }
        ],
        applicants: [
            {
                id: "B01", name: "VÕ ANH DŨNG", img: "assets/img/npc_default.png",
                profession: "Lính chiến", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Tôi đã tham gia 4 lần Shelter Land với camp cũ. Tier 4 chiến đấu.", next: "l2" },
                    { text: "Camp tôi tan rã sau trận tranh chấp tháng trước. Đang cần camp mới.", next: null }
                ]
            },
            {
                id: "B02", name: "BÙI THANH TUYỀN", img: "assets/img/npc_default.png",
                profession: "Newbie", criminal: false, enemyCamp: false,
                shouldApprove: false,
                lines: [
                    { text: "Em mới tham gia server được... 12 ngày thôi ạ. Nhưng em học rất nhanh!", next: "l2" },
                    { text: "Em chưa tham gia trận nào nhưng em rất muốn cống hiến. Anh cho em cơ hội nhé?", next: null }
                ]
            },
            {
                id: "B03", name: "NGUYỄN HÙNG CƯỜNG", img: "assets/img/npc_default.png",
                profession: "Xạ thủ", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Tier 5 sniper. 47 ngày tuổi. Tôi đã giữ vị trí cao điểm trong 6 trận Patrol liên tiếp.", next: "l2" },
                    { text: "Mang theo 1 súng trường và đạn cá nhân. Tất cả đều đăng ký hợp lệ.", next: null }
                ]
            },
            {
                id: "B04", name: "TRƯƠNG KIM LONG", img: "assets/img/npc_default.png",
                profession: "???", criminal: false, enemyCamp: false,
                shouldApprove: false,
                lines: [
                    { text: "Anh cứ để tôi vào đi. Tôi mang theo 3 khẩu súng máy, RPG và 2 rương đạn.", next: "l2" },
                    { text: "Tôi có thể xử lý bất cứ ai cản đường. Kể cả... đội của anh.", next: null }
                ]
            },
            {
                id: "B05", name: "PHAN THỊ QUỲNH NHƯ", img: "assets/img/npc_default.png",
                profession: "Chỉ huy camp cũ", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Tôi từng là Major của camp Đêm Thép. Tài khoản 82 ngày. Đã từng dẫn 3 trận Shelter Land.", next: "l2" },
                    { text: "Camp Đêm Thép giải tán tháng này. Tôi đang tìm camp có tổ chức để tiếp tục chiến.", next: null }
                ]
            },
            {
                id: "B06", name: "ĐỖ VĂN KHẢI", img: "assets/img/npc_default.png",
                profession: "Vệ sĩ", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "55 ngày tuổi, Tier 3 cận chiến. Tôi đặc biệt ở khả năng bảo vệ member khi patrol.", next: "l2" },
                    { text: "1 dao chiến và 1 khẩu súng lục. Không hơn không kém.", next: null }
                ]
            }
        ]
    },

    /* ===== DAY 3 ===== */
    {
        day: 3,
        title: "Ngày cuối",
        subtitle: "SCREENING DAY 03 — NGUY CƠ NỘI GIÁN",
        criteria: [
            { icon: "⛔", cls: "danger",  text: "Từ chối bất kỳ ai có liên hệ với camp Delta-9 (gián điệp đã ghi nhận)" },
            { icon: "⛔", cls: "danger",  text: "Từ chối người có hình xăm đỏ vùng cổ hoặc tay (dấu hiệu Cartel)" },
            { icon: "✅", cls: "ok",      text: "Nhận người có giới thiệu từ Official trong camp" },
            { icon: "⚠️", cls: "warning", text: "Cẩn thận: Delta-9 đang cài người vào các camp lớn" }
        ],
        applicants: [
            {
                id: "C01", name: "NGUYỄN THỊ PHƯƠNG", img: "assets/img/npc_default.png",
                profession: "Được giới thiệu bởi Official Bảo", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Dạ, em được anh Bảo trong camp giới thiệu vào ạ. Anh ấy bảo em cứ ra đây gặp thị trưởng.", next: "l2" },
                    { text: "Em chuyên về phục hồi tài nguyên và chế biến đồ ăn. Không liên quan gì Delta-9 ạ.", next: null }
                ]
            },
            {
                id: "C02", name: "HÀ THANH LIÊM", img: "assets/img/npc_default.png",
                profession: "Cựu thành viên Delta-9", criminal: false, enemyCamp: true,
                shouldApprove: false,
                lines: [
                    { text: "Tôi nghe nói camp đang cần người. Tôi có kinh nghiệm tác chiến đêm rất tốt.", next: "l2" },
                    { text: "[Nhận diện thấy huy hiệu Delta-9 bị che phủ dưới lớp áo khoác]", next: null }
                ]
            },
            {
                id: "C03", name: "TRIỆU VĂN KIÊN", img: "assets/img/npc_default.png",
                profession: "Tự do", criminal: false, enemyCamp: false,
                shouldApprove: false,
                lines: [
                    { text: "Tôi chỉ là người tự do thôi. Không camp nào. Đi lang thang một mình mấy tháng nay.", next: "l2" },
                    { text: "[Camera an ninh phóng to: Thấy rõ hình xăm đỏ hình con rắn vùng cổ trái]", next: null }
                ]
            },
            {
                id: "C04", name: "LÝ THANH HÀ", img: "assets/img/npc_default.png",
                profession: "Được giới thiệu bởi Official Mai", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Chị Mai nhờ tôi đến. Tôi là chuyên gia kỹ thuật — có thể sửa vũ khí và phương tiện.", next: "l2" },
                    { text: "Tôi không liên quan gì đến các tổ chức đen. Chị Mai có thể xác nhận cho tôi.", next: null }
                ]
            },
            {
                id: "C05", name: "PHÙNG VĂN KHOA", img: "assets/img/npc_default.png",
                profession: "Tình báo — [CẢNH BÁO]", criminal: false, enemyCamp: true,
                shouldApprove: false,
                lines: [
                    { text: "Anh ơi, tôi đang chạy trốn khỏi Delta-9. Họ muốn giết tôi vì tôi biết quá nhiều.", next: "l2" },
                    { text: "[Phân tích hành vi: Nói quá mượt mà, không biểu hiện lo lắng thực sự — đây là lời kịch bản sẵn]", next: null }
                ]
            },
            {
                id: "C06", name: "ĐINH THỊ HƯƠNG", img: "assets/img/npc_default.png",
                profession: "Dược sĩ — Được giới thiệu bởi Official Thiên", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Tôi có thể bào chế thuốc men và vaccine từ nguyên liệu hoang dã. Anh Thiên xác nhận.", next: "l2" },
                    { text: "Không có liên kết Delta-9. Không xăm trổ gì cả. Tôi chỉ muốn sống và cống hiến.", next: null }
                ]
            },
            {
                id: "C07", name: "NGUYỄN CAO THẮNG", img: "assets/img/npc_default.png",
                profession: "Không rõ nguồn gốc", criminal: false, enemyCamp: true,
                shouldApprove: false,
                lines: [
                    { text: "Tôi cần vào camp này gấp. Không có thời gian giải thích nhiều.", next: "l2" },
                    { text: "[Scan tự động phát hiện: Thiết bị theo dõi loại Delta-9 gắn trong ba lô]", next: null }
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
let criteriaBoard, npcCharImg, dlgSpeaker, dlgText, dlgNext,
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

    // Lookup terminal toggle
    lookupTerminal.addEventListener('click', () => {
        criteriaBoard.classList.toggle('show');
    });

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

    // Slide in character
    npcCharImg.classList.remove('npc-exit');
    npcCharImg.src = applicant.img;
    npcCharImg.classList.add('npc-enter');
    npcCharImg.onanimationend = () => npcCharImg.classList.remove('npc-enter');

    // Update dialogue
    dlgSpeaker.textContent = applicant.name;
    dlgText.textContent    = '';
    dlgNext.style.display  = 'none';

    // Start typing first line
    setTimeout(() => typeLine(applicant.lines[0].text), 600);
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
            npcCharImg.classList.remove('npc-exit');
            dlgText.textContent    = '';
            dlgSpeaker.textContent = '';
            dlgNext.style.display  = 'none';
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
