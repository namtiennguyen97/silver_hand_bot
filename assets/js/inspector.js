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

const CAMP_RELATIONS = {
    enemies: ['Astral', 'Hunter', 'Tagalog', 'Konoha', 'Fortis'],
    allies:  ['Eternal', 'SANTUY', 'AVALON', 'Players', 'VNHouse', 'Vior', 'RedRoom', 'UNITY']
};

const MAYOR_NOTES = [
    /* DAY 1 */
    "LƯU Ý QUAN TRỌNG TỪ THỊ TRƯỞNG:\n\nHiện nay có một số anh em VN mua lại tài khoản (acc) từ người nước ngoài thuộc các Camp đối thủ để sử dụng.\n\nNếu gặp trường hợp thẻ bài ghi quốc tịch nước ngoài và thuộc Camp đối địch, nhưng người đó khẳng định trong hội thoại là 'người Việt' hoặc 'tài khoản mới mua', chúng ta VẪN DUYỆT cho họ vào camp.",
    /* DAY 2 */
    "Chỉ thị Ngày 2 đang được soạn thảo...",
    /* DAY 3 */
    "Chỉ thị Ngày 3 đang được soạn thảo..."
];

const GAME_DAYS = [

    /* ===== DAY 1 ===== */
    {
        day: 1,
        title: "Serious Mode: Phase 01",
        subtitle: "SCREENING DAY 01 — IDENTITY VERIFICATION",
        criteria: [
            { icon: "🇻🇳", cls: "ok",      text: "PRIORITY: VN Members — Full access granted" },
            { icon: "🌐", cls: "warning", text: "GLOBAL: Foreign members must be Level 145+ for entry" },
            { icon: "⛔", cls: "danger",  text: "DENY: Hostile camps (Astral, Hunter, Tagalog, Konoha, Fortis)" },
            { icon: "🔍", cls: "ok",      text: "HINT: Use 'CHECK ID' and 'RIVAL' to cross-verify affiliations" }
        ],
        applicants: [
            {
                id: "A01", name: "ELYSIUM", img: null,
                nationality: "VN", level: 152, cert: "Herb", camp: "Eternal",
                friends: [
                    { name: "MEND", intimacy: 85, camp: "AVALON" },
                    { name: "FORD", intimacy: 70, camp: "VNHouse" }
                ],
                profession: "Dân cày nguyên liệu", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Chào sếp, mình từ vùng xanh mới qua. Chuyên đi farm nguyên liệu nên muốn tìm camp nào an toàn để cất đồ.", next: "l2" },
                    { text: "Mình có bác FORD bên VNHouse bảo chứng nhé. Rất mong được cày cuốc cùng anh em.", next: null }
                ]
            },
            {
                id: "A02", name: "COBRA", img: null,
                nationality: "JPN", level: 138, cert: "Rifle man", camp: "Konoha",
                friends: [
                    { name: "UCHIHA_IT", intimacy: 99, camp: "Konoha" }
                ],
                profession: "Solo player tìm team", criminal: false, enemyCamp: true,
                shouldApprove: false, // Enemy Camp (Konoha)
                lines: [
                    { text: "Sếp ơi, em lang thang mãi cũng chán. Cấp 138 rồi, PK cũng khá, cho em xin một slot vào camp với.", next: "l2" },
                    { text: "Acc em quốc tịch JPN nhưng em ở VN nhé, sếp check kỹ giúp em.", next: null }
                ]
            },
            {
                id: "A03", name: "NIGHTMARE", img: null,
                nationality: "VN", level: 160, cert: "Warrior", camp: "AVALON",
                friends: [
                    { name: "ELYSIUM", intimacy: 85, camp: "Eternal" }
                ],
                profession: "Người chơi cũ quay lại", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Chào sếp, mình mới chơi lại game sau một thời gian off. Thấy camp mình đang tuyển nên ghé qua xin chân chạy vặt.", next: "l2" },
                    { text: "Mình quen thân với ELYSIUM đây, kỹ năng thì sếp cứ yên tâm, không lụ nghề đâu.", next: null }
                ]
            },
            {
                id: "A04", name: "STORM", img: null,
                nationality: "USA", level: 180, cert: "Sniper", camp: "Tagalog",
                friends: [
                    { name: "CHIEF_TAG", intimacy: 95, camp: "Tagalog" }
                ],
                profession: "Sát thủ săn Bounty", criminal: false, enemyCamp: true,
                shouldApprove: false, // Enemy Camp (Tagalog)
                lines: [
                    { text: "Chào, tôi chuyên đi săn Bounty đây. Cấp 180 chắc sếp cũng hiểu trình độ thế nào rồi nhỉ.", next: "l2" },
                    { text: "[Hệ thống quét thấy thẻ bài Camp Tagalog được giấu kỹ dưới áo giáp — Có dấu hiệu gian lận]", next: null }
                ]
            },
            {
                id: "A05", name: "TITAN", img: null,
                nationality: "VN", level: 148, cert: "Logger", camp: "VNHouse",
                friends: [
                    { name: "ELYSIUM", intimacy: 70, camp: "Eternal" }
                ],
                profession: "Kiến trúc sư xây Base", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Sếp ơi mình là FORD đây, chuyên xây dựng pháo đài. Elysium chắc có kể về mình rồi nhỉ?", next: "l2" },
                    { text: "Mình muốn xin vào camp để hỗ trợ anh em thiết kế khu phòng thủ cho chắc chắn. Cho mình xin slot nha.", next: null }
                ]
            },
            {
                id: "A06", name: "VIPER", img: null,
                nationality: "USA", level: 142, cert: "Virut", camp: "Players",
                friends: [
                    { name: "MARKET_MAKER", intimacy: 45, camp: "RedRoom" }
                ],
                profession: "Thương nhân chợ đen", criminal: false, enemyCamp: false,
                shouldApprove: false, // USA and Level < 145
                lines: [
                    { text: "Chào sếp, em chuyên buôn bán nhu yếu phẩm đủ loại. Tuy cấp hơi thấp nhưng em nhiều đồ lắm.", next: "l2" },
                    { text: "Em có nhiều mối làm ăn bên server Mỹ, cho em vào camp em để giá ưu đãi cho anh em cày cuốc.", next: null }
                ]
            },
            {
                id: "A07", name: "WOLFE", img: null,
                nationality: "VN", level: 165, cert: "Sniper", camp: "Eternal",
                profession: "Người chơi hệ thám hiểm", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Chào anh, tôi toàn đi dạo bản đồ một mình cả năm nay rồi. Mọi ngóc ngách ở đây tôi đều thuộc hết.", next: "l2" },
                    { text: "Nếu camp mình cần người dẫn đường đi chiếm cứ điểm thì cứ gọi tôi nhé.", next: null }
                ]
            },
            {
                id: "A08", name: "PHANTOM", img: null,
                nationality: "JPN", level: 140, cert: "Rifle man", camp: "Konoha",
                friends: [
                    { name: "REBORN", intimacy: 10, camp: "Konoha" }
                ],
                profession: "Chủ mới mua acc", criminal: false, enemyCamp: true,
                shouldApprove: true, // Special Case: Bought Account
                lines: [
                    { text: "Chào sếp, acc này tôi mới mua của một khứa JPN bên Konoha.", next: "l2" },
                    { text: "Tôi là người VN 100%, mới nhảy hố game này nên mua acc cày cho nhanh. Nhận em vào camp với anh em cho vui sếp ơi.", next: null }
                ]
            }
        ]
    },

    /* ===== DAY 2 ===== */
    {
        day: 2,
        title: "Day Two",
        subtitle: "SCREENING DAY 02 — CHIẾN DỊCH THANH LỌC",
        criteria: [
            { icon: "✅", cls: "ok",      text: "Ưu tiên: Anh em có Tier chiến đấu cao" },
            { icon: "✅", cls: "ok",      text: "Duyệt: Những ai từng đi Tuần tra hoặc Shelter Land" },
            { icon: "⛔", cls: "danger",  text: "Từ chối: Tài khoản chơi chưa đủ 30 ngày" },
            { icon: "⚠️", cls: "warning", text: "Cảnh báo: Mang theo quá nhiều vũ khí hạng nặng" }
        ],
        applicants: [
            {
                id: "B01", name: "VICTOR 'IRON' SHAW", img: null,
                profession: "Tay chơi lão luyện", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Tôi đi Shelter Land 4 lần rồi sếp. Tier 4 chiến đấu, bao nhiệt tình luôn.", next: "l2" },
                    { text: "Camp cũ mới giải tán vì tranh chấp địa bàn, giờ đang tìm bến đỗ mới để tiếp tục cày.", next: null }
                ]
            },
            {
                id: "B02", name: "MIKA REED", img: null,
                profession: "Tân thủ tò mò", criminal: false, enemyCamp: false,
                shouldApprove: false,
                lines: [
                    { text: "Dạ chào sếp, em mới chơi được... 12 ngày à. Nhưng em hứa sẽ tiếp thu nhanh lắm!", next: "l2" },
                    { text: "Em chưa bao giờ đi raid hay gì hết, sếp cho em vào camp làm chân chạy vặt cũng được ạ.", next: null }
                ]
            },
            {
                id: "B03", name: "JAMES 'GHOST' COLE", img: null,
                profession: "Xạ thủ bọc lót", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Hê lô sếp, mình chuyên bọc lót cho anh em đi tuần tra. Acc chơi được 47 ngày rồi.", next: "l2" },
                    { text: "Trên người chỉ mang một khẩu súng với đạn dược cá nhân thôi, hàng chính chủ 100%.", next: null }
                ]
            },
            {
                id: "B04", name: "DANTE KRIEG", img: null,
                profession: "Người chơi hệ hù dọa", criminal: false, enemyCamp: false,
                shouldApprove: false,
                lines: [
                    { text: "Mở cửa cho tôi vào nhanh đi. Tôi mang theo 3 khẩu súng máy với đống đạn hạng nặng đây.", next: "l2" },
                    { text: "Vào camp tôi sẽ xử đẹp bất cứ đứa nào ngáng đường... kể cả đội của sếp luôn.", next: null }
                ]
            },
            {
                id: "B05", name: "COMMANDER ELISE VALE", img: null,
                profession: "Cựu chủ Camp", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Chào anh, tôi từng quản lý camp bên Dark Steel. Acc chơi được 82 ngày, đi Shelter Land suốt.", next: "l2" },
                    { text: "Bên đó giải tán rồi nên tôi muốn tìm một camp có kỷ luật để cùng anh em đi chiếm cứ điểm.", next: null }
                ]
            },
            {
                id: "B06", name: "SEAN 'SHIELD' PARKS", img: null,
                profession: "Hộ vệ nhiệt tình", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Chào sếp, em chơi được 55 ngày rồi, Tier 3 chiến đấu. Chuyên bảo kê anh em đi farm.", next: "l2" },
                    { text: "Hành trang gọn nhẹ chỉ có con dao với súng lục thôi, cho em vào camp với nha.", next: null }
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
            { icon: "⛔", cls: "danger",  text: "Cấm: Bất cứ ai liên quan đến Camp Delta-9 (Gián điệp)" },
            { icon: "⛔", cls: "danger",  text: "Cấm: Người chơi có hình xăm đỏ (Dấu hiệu tội phạm)" },
            { icon: "✅", cls: "ok",      text: "Duyệt: Những ai được quan chức cấp cao bảo lãnh" },
            { icon: "⚠️", cls: "warning", text: "Lưu ý: Delta-9 đang tìm cách xâm nhập bằng mọi giá" }
        ],
        applicants: [
            {
                id: "C01", name: "ARIA CHEN", img: null,
                profession: "Người quen bảo lãnh", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Chào anh, anh Bảo bảo em qua đây gặp sếp trực tiếp để xin vào camp.", next: "l2" },
                    { text: "Em chuyên đi gom nguyên liệu chế đồ, không liên quan gì đến hội Delta-9 đâu ạ.", next: null }
                ]
            },
            {
                id: "C02", name: "BLAKE 'SHADOW' FINN", img: null,
                profession: "Kẻ săn đêm", criminal: false, enemyCamp: true,
                shouldApprove: false,
                lines: [
                    { text: "Nghe nói camp mình đang cần người đi raid đêm. Tôi có nhiều kinh nghiệm PK lắm nè.", next: "l2" },
                    { text: "[Hệ thống quét thấy huy hiệu Delta-9 giấu trong tay áo — Nghi vấn gián điệp]", next: null }
                ]
            },
            {
                id: "C03", name: "WOLF STRIDER", img: null,
                profession: "Lãng khách solo", criminal: false, enemyCamp: false,
                shouldApprove: false,
                lines: [
                    { text: "Sếp ơi tôi toàn chơi một mình thôi, nay muốn đổi gió vào camp cày chung với team cho vui.", next: "l2" },
                    { text: "[Camera an ninh phát hiện hình xăm rắn đỏ bên cổ trái — Thuộc danh sách đen]", next: null }
                ]
            },
            {
                id: "C04", name: "VERA 'WRENCH' KIM", img: null,
                profession: "Thợ bảo trì súng", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Chào sếp, chị Mai giới thiệu em qua đây. Em chuyên bảo trì vũ khí với sửa xe cho anh em.", next: "l2" },
                    { text: "Lý lịch em sạch 100%, chị Mai bảo chứng nên sếp cứ yên tâm nhận em nha.", next: null }
                ]
            },
            {
                id: "C05", name: "REED 'WHISPER' CALLOWAY", img: null,
                profession: "Kẻ đào tẩu", criminal: false, enemyCamp: true,
                shouldApprove: false,
                lines: [
                    { text: "Cứu em với sếp, em đang bị tụi Delta-9 truy đuổi vì biết quá nhiều bí mật của tụi nó.", next: "l2" },
                    { text: "[Phân tích hành vi: Giọng nói có vẻ đang diễn kịch, không hề có dấu hiệu sợ hãi thật sự]", next: null }
                ]
            },
            {
                id: "C06", name: "LUNA HAYES", img: null,
                profession: "Dân chế Buff", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Chào anh, em biết chế nhiều loại thuốc tăng lực hỗ trợ anh em đi raid. Anh Thiện bảo em qua đây.", next: "l2" },
                    { text: "Lý lịch em trong sạch, không hình xăm, chỉ muốn vào camp để cống hiến thôi.", next: null }
                ]
            },
            {
                id: "C07", name: "UNKNOWN DRIFTER", img: null,
                profession: "Người chơi bí ẩn", criminal: false, enemyCamp: true,
                shouldApprove: false,
                lines: [
                    { text: "Cho tôi vào camp ngay đi, không có thời gian để giải thích nhiều đâu.", next: "l2" },
                    { text: "[Hệ thống tự động quét thấy thiết bị định vị của Delta-9 trong balo đối tượng]", next: null }
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
    decisionFlash, stampOverlay, applicantCounter, dayBadge, scoreDisplay, lookupTerminal,
    idCardModal, idCardBtn, idAvatarImg, idName, idNation, idLevel, idCert, idCamp, socialContainer,
    rivalModal, rivalBtn, enemyList, allyList,
    mayorNoteModal, mayorBtn, mayorNoteContent;

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

    // ID Card Modal elements
    idCardModal      = $('idCardModal');
    idCardBtn        = $('idCardBtn');
    idAvatarImg      = $('idAvatarImg');
    idName           = $('idName');
    idNation         = $('idNation');
    idLevel          = $('idLevel');
    idCert           = $('idCert');
    idCamp           = $('idCamp');
    socialContainer  = $('socialCircleContainer');

    // Rival Modal elements
    rivalModal       = $('rivalModal');
    rivalBtn         = $('rivalBtn');
    enemyList        = $('enemyCampList');
    allyList         = $('allyCampList');

    // Mayor Note elements
    mayorNoteModal   = $('mayorNoteModal');
    mayorBtn         = $('mayorBtn');
    mayorNoteContent = $('mayorNoteContent');

    // Dialogue click to advance
    $('inspectorDialogue').addEventListener('click', () => advanceLine());

    // Decision buttons
    approveBtn.addEventListener('click', () => makeDecision(true));
    rejectBtn.addEventListener('click',  () => makeDecision(false));

    // Lookup terminal toggle — with modal support
    window.toggleCriteria = (forceClose) => {
        const isOpen = criteriaBoard.classList.contains('show');
        const show = !(forceClose || isOpen);
        if (show) {
            criteriaBoard.classList.add('show');
            if (lookupContainer) lookupContainer.style.display = 'none';
        } else {
            criteriaBoard.classList.remove('show');
            if (lookupContainer) lookupContainer.style.display = 'flex';
        }
    };
    lookupTerminal.addEventListener('click', () => window.toggleCriteria());

    // Init VN Engine for introductions
    vnEngine = new VNEngine();

    // ID Card Toggle
    window.toggleIdCard = (show) => {
        if (show) {
            renderIdCard();
            idCardModal.classList.add('show');
            if (lookupContainer) lookupContainer.style.display = 'none';
            playSfx('nierMail');
        } else {
            idCardModal.classList.remove('show');
            if (lookupContainer) lookupContainer.style.display = 'flex';
            playSfx('nierMenu');
        }
    };
    idCardBtn.addEventListener('click', () => window.toggleIdCard(true));

    // Rival Modal Toggle
    window.toggleRivalModal = (show) => {
        if (show) {
            populateCamps();
            rivalModal.classList.add('show');
            if (lookupContainer) lookupContainer.style.display = 'none';
            playSfx('nierMail');
        } else {
            rivalModal.classList.remove('show');
            if (lookupContainer) lookupContainer.style.display = 'flex';
            playSfx('nierMenu');
        }
    };

    // Mayor Note Toggle
    window.toggleMayorNote = (show) => {
        if (show) {
            if (mayorNoteContent) {
                mayorNoteContent.textContent = MAYOR_NOTES[State.day] || "Không có chỉ thị mới.";
            }
            mayorNoteModal.classList.add('show');
            if (lookupContainer) lookupContainer.style.display = 'none';
            playSfx('nierMail');
        } else {
            mayorNoteModal.classList.remove('show');
            if (lookupContainer) lookupContainer.style.display = 'flex';
            playSfx('nierMenu');
        }
    };

    showDayTransition(0);
}

function populateCamps() {
    if (!enemyList || !allyList) return;
    enemyList.innerHTML = '';
    allyList.innerHTML = '';
    
    CAMP_RELATIONS.enemies.forEach(c => {
        const tag = document.createElement('div');
        tag.className = 'camp-tag';
        tag.textContent = c;
        enemyList.appendChild(tag);
    });
    CAMP_RELATIONS.allies.forEach(c => {
        const tag = document.createElement('div');
        tag.className = 'camp-tag';
        tag.textContent = c;
        allyList.appendChild(tag);
    });
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

    // Hide tools during intro
    if (lookupContainer) lookupContainer.style.display = 'none';

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
   ID CARD RENDERING & SOCIAL CIRCLE 2.0
================================================ */
function renderIdCard() {
    const applicant = GAME_DAYS[State.day].applicants[State.applicantIndex];
    if (!applicant) return;

    idName.textContent   = applicant.name;
    idNation.textContent = applicant.nationality || "UNKNOWN";
    idLevel.textContent  = applicant.level || "0";
    idCert.textContent   = applicant.cert || "NONE";
    idCamp.textContent   = applicant.camp || "UNKNOWN";
    idAvatarImg.src      = applicant.img;
    
    const serial = `SN: ${Math.floor(Math.random()*900+100)}-${applicant.id || 'A00'}-${Math.floor(Math.random()*9000+1000)}`;
    const serialEl = $('idCardSerial');
    if (serialEl) serialEl.textContent = serial;

    drawSocialCircle(applicant.friends || []);
}

function drawSocialCircle(friends) {
    if (!socialContainer) return;
    socialContainer.innerHTML = '';
    
    const centerX = socialContainer.offsetWidth / 2;
    const centerY = socialContainer.offsetHeight / 2;
    const applicant = GAME_DAYS[State.day].applicants[State.applicantIndex];
    
    // Center Node (The Applicant)
    const centerNode = document.createElement('div');
    centerNode.className = 'social-node center';
    centerNode.style.left = (centerX - 30) + 'px';
    centerNode.style.top  = (centerY - 30) + 'px';
    centerNode.innerHTML  = `<img src="${applicant.img}" class="social-avatar">`;
    socialContainer.appendChild(centerNode);
    
    if (!friends || friends.length === 0) {
        return;
    }

    const radius = Math.min(socialContainer.offsetWidth, socialContainer.offsetHeight) * 0.35;
    friends.forEach((friend, idx) => {
        const angle = (idx / friends.length) * (2 * Math.PI);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        // Link Line
        const link = document.createElement('div');
        link.className = 'social-link';
        link.style.left = centerX + 'px';
        link.style.top  = centerY + 'px';
        link.style.width = radius + 'px';
        link.style.transform = `rotate(${angle}rad)`;
        socialContainer.appendChild(link);

        // Intimacy Label (Middle of the line)
        const midX = centerX + (radius/2) * Math.cos(angle);
        const midY = centerY + (radius/2) * Math.sin(angle);
        const intLabel = document.createElement('div');
        intLabel.className = 'intimacy-label';
        intLabel.textContent = `${friend.intimacy}%`;
        intLabel.style.left = midX + 'px';
        intLabel.style.top  = midY + 'px';
        socialContainer.appendChild(intLabel);
        
        // Friend Node
        const node = document.createElement('div');
        node.className = 'social-node';
        node.style.left = (x - 20) + 'px';
        node.style.top  = (y - 20) + 'px';
        // Use a generic avatar or head-only for friends for now
        node.innerHTML = `<img src="assets/img/avatars/generic.png" class="social-avatar">`;
        socialContainer.appendChild(node);
        
        // Label
        const label = document.createElement('div');
        label.className = 'social-label';
        label.style.left = x + 'px';
        label.style.top  = (y + 25) + 'px';
        label.innerHTML = `
            <span class="friend-name">${friend.name}</span>
            <span class="friend-camp">${friend.camp}</span>
        `;
        socialContainer.appendChild(label);
    });
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

    // Update Mayor Note content for this day
    if (mayorNoteContent) {
        mayorNoteContent.textContent = MAYOR_NOTES[dayIndex] || "Không có chỉ thị mới.";
    }

    // Show lookup tools ONLY after intro
    if (lookupContainer) lookupContainer.style.display = 'flex';
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
                    idCardBtn.style.display = 'block';
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
                idCardBtn.style.display = 'block';
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
    idCardBtn.style.display = 'none';

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
    // Hide tools
    if (lookupContainer) lookupContainer.style.display = 'none';
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
