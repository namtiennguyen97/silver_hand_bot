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
    'assets/img/inspector_npc/npc_11.png',
    'assets/img/inspector_npc/npc_12.png',
    'assets/img/inspector_npc/npc_13.png',
    'assets/img/inspector_npc/npc_14.png',
    'assets/img/inspector_npc/npc_15_couple_type.png',
    'assets/img/inspector_npc/npc_16_couple_type.png',
    'assets/img/inspector_npc/npc_17.png',
    'assets/img/inspector_npc/npc_18.png',
    'assets/img/inspector_npc/npc_19.png',
    'assets/img/inspector_npc/npc_20.png',
    'assets/img/inspector_npc/npc_21.png',
    'assets/img/inspector_npc/npc_22.png',
    'assets/img/inspector_npc/npc_23.png',
    'assets/img/inspector_npc/npc_24.png',
    'assets/img/inspector_npc/npc_25.png',
];

// Helper to resolve portrait image path from main NPC image path
function resolvePortraitPath(mainPath) {
    if (!mainPath) return "";
    const filename = mainPath.split('/').pop();
    // Filename in portrail folder matches the numeric prefix (e.g., npc_15_couple_type.png -> npc_15.png)
    const match = filename.match(/npc_\d+/);
    if (match) {
        return `assets/img/inspector_npc/portrail/${match[0]}.png`;
    }
    return `assets/img/inspector_npc/portrail/${filename}`;
}

const STORY_CHARACTER_IMAGES = {
    'FORD': 'assets/img/inspector_npc/npc_10.png',
    'MEND': 'assets/img/inspector_npc/npc_11.png',
    'CHIEF_TAG': 'assets/img/inspector_npc/npc_18.png',
    'MARKET_MAKER': 'assets/img/inspector_npc/npc_20.png',
    'REBORN': 'assets/img/inspector_npc/npc_22.png',
    'BẢO': 'assets/img/inspector_npc/npc_1.png',
    'MAI': 'assets/img/inspector_npc/npc_14.png',
    'THIỆN': 'assets/img/inspector_npc/npc_3.png',
    'ZATAN': 'assets/img/inspector_npc/npc_17.png'
};

// Helper to find a character's main image by their name
function findCharacterImageByName(name) {
    if (!name) return null;
    const cleanName = name.trim().toUpperCase();

    // 1. Check direct applicant name match
    for (const day of GAME_DAYS) {
        for (const app of day.applicants) {
            if (app.name.toUpperCase() === cleanName) return app.img;
        }
    }

    // 2. Check story character mapping
    if (STORY_CHARACTER_IMAGES[cleanName]) {
        return STORY_CHARACTER_IMAGES[cleanName];
    }

    // 3. Persistent fallback based on character name hash
    // (ensures same character always gets same random portrait)
    let hash = 0;
    for (let i = 0; i < cleanName.length; i++) {
        hash = ((hash << 5) - hash) + cleanName.charCodeAt(i);
        hash |= 0;
    }
    const idx = (Math.abs(hash) % 25) + 1;
    return `assets/img/inspector_npc/npc_${idx}.png`;
}

// Fisher-Yates shuffle, returns shuffled copy
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Assign unique NPC images to all applicants in a day (no repeats, only if not already assigned)
function assignNpcImages(dayIndex) {
    const applicants = GAME_DAYS[dayIndex].applicants;
    const pool = shuffleArray(NPC_IMAGES);
    let poolIndex = 0;
    applicants.forEach((app) => {
        // Chỉ random ảnh nếu NPC chưa được chỉ định sẵn ảnh (img đang là null)
        if (!app.img) {
            app.img = pool[poolIndex % pool.length];
            poolIndex++;
        }
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
    "THÔNG BÁO QUAN TRỌNG NGÀY 2:\n\nHôm nay chúng ta đón chào một số anh em chiến binh từ các chương trình đánh thuê CTC quốc tế trở về. \n\nHãy kiểm tra danh mục 'CTC RETURNER' để nhận diện họ. Đây là những nhân tài cần thiết cho sức mạnh quân sự của SAO-ĐÊM, hãy DUYỆT cho họ vào camp ngay lập tức khi họ xuất hiện.",
    /* DAY 3 */
    "Chỉ thị Ngày 3 đang được soạn thảo..."
];

const CTC_DATA = [
    { 
        name: "Kaelith", 
        img: "npc_5.png", 
        story: "Chiến binh kỳ cựu từng chinh chiến tại các chiến trường CTC Châu Âu. Kỹ năng bắn tỉa điêu luyện, vừa hoàn thành hợp đồng đánh thuê 6 tháng và quyết định trở về cống hiến cho SAO-ĐÊM."
    },
    { 
        name: "Xero", 
        img: "npc_12.png", 
        story: "Chuyên gia phá bẫy và đột kích. Từng phục vụ trong đội quân đánh thuê tại vùng Shelter Land phía Bắc. Trở về với lượng lớn kinh nghiệm chiến đấu thực tế."
    },
    { 
        name: "Valkyrie", 
        img: "npc_19.png", 
        story: "Nữ chiến binh dũng mãnh, nổi danh với khả năng càn quét bằng vũ khí hạng nặng. Cô ấy đã giúp nhiều Camp chiến thắng trong các trận CTC lớn trước khi quay về nhà."
    }
];

const GAME_DAYS = [

    /* ===== DAY 1 ===== */
    {
        day: 1,
        title: "Serious Mode: Phase 01",
        subtitle: "SCREENING DAY 01 — IDENTITY VERIFICATION",
        criteria: [
            { icon: "🇻🇳", cls: "ok",      text: "PRIORITY: Đối với mem VN thì nhận vào không khắt khe." },
            { icon: "🌐", cls: "warning", text: "GLOBAL: Nếu là người nước ngoài thì ít nhất phải level 145+" },
            { icon: "⛔", cls: "danger",  text: "DENY: Kiểm tra hòm thư rival camp và danh sách black list nhé" },
            { icon: "🔍", cls: "ok",      text: "HINT: Hãy chọn check ID để kiểm tra từng người" }
        ],
        applicants: [
            {
                id: "A01", name: "ELYSIUM", img: null,
                nationality: "VN", level: 120, cert: "Herb", camp: "Eternal",
                friends: [
                    { name: "MEND", intimacy: 85, camp: "AVALON" },
                    { name: "FORD", intimacy: 70, camp: "VNHouse" }
                ],
                profession: "Dân cày nguyên liệu", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Chào sếp, mình thấy camp còn nhiều slot nên mình muốn vào trải nghiệm.", next: "l2" },
                    { text: "Mình có bác FORD bên VNHouse bảo chứng nhé. Rất mong được cày cuốc cùng anh em.", next: null }
                ]
            },
            {
                id: "A-BL-01", name: "ZATAN", img: "assets/img/inspector_npc/npc_17.png",
                nationality: "VN", level: 124, cert: "Drifter", camp: "Eternal",
                profession: "Chuyên gia 'off' lâu ngày", criminal: false, enemyCamp: false,
                shouldApprove: false, 
                lines: [
                    { text: "Chào Mayor, cho mình vào lại camp với.", next: "l2" },
                    { text: "Lần này mình hứa sẽ không off lâu nữa đâu mà... Đi mà, cho mình một cơ hội cuối đi!", next: null }
                ]
            },
            {
                id: "A02", name: "COBRA", img: null,
                nationality: "JPN", level: 147, cert: "Rifle man", camp: "Konoha",
                friends: [
                    { name: "UCHIHA_IT", intimacy: 99, camp: "Konoha" }
                ],
                profession: "Solo player tìm team", criminal: false, enemyCamp: true,
                shouldApprove: false, // Enemy Camp (Konoha)
                lines: [
                    { text: "Hi- i just want to traveller through every camp just for fun.", next: "l2" },
                    { text: "Believe me, i didnt spy or anything, just want to join for fun", next: null }
                ]
            },
            {
                id: "A03", name: "NIGHTMARE", img: null,
                nationality: "VN", level: 144, cert: "Warrior", camp: "AVALON",
                friends: [
                    { name: "ELYSIUM", intimacy: 85, camp: "Eternal" }
                ],
                profession: "Người chơi cũ quay lại", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Chào sếp, mình mới chơi lại game sau một thời gian off. Thấy camp mình đang tuyển nên ghé qua xin chân chạy vặt.", next: "l2" },
                    { text: "Mình quen thân với ELYSIUM đây, kỹ năng thì sếp cứ yên tâm, không lụt nghề đâu.", next: null }
                ]
            },
            {
                id: "A04", name: "STORM", img: null,
                nationality: "USA", level: 148, cert: "Sniper", camp: "Tagalog",
                friends: [
                    { name: "CHIEF_TAG", intimacy: 95, camp: "Tagalog" }
                ],
                profession: "Sát thủ săn Bounty", criminal: false, enemyCamp: true,
                shouldApprove: false, // Enemy Camp (Tagalog)
                lines: [
                    { text: "Hi- can i join your camp?", next: "l2" },
                    { text: "I just want to join- no reason", next: null }
                ]
            },
            {
                id: "A05", name: "TITAN", img: null,
                nationality: "VN", level: 142, cert: "Logger", camp: "VNHouse",
                friends: [
                    { name: "ELYSIUM", intimacy: 70, camp: "Eternal" }
                ],
                profession: "Kiến trúc sư xây Base", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Sếp ơi mình là FORD đây, mình là VN và chỉ chơi chill. Elysium chắc có kể về mình rồi nhỉ?", next: "l2" },
                    { text: "Mình muốn xin vào camp. Cho mình xin slot nha.", next: null }
                ]
            },
            {
                id: "A06", name: "VIPER", img: null,
                nationality: "USA", level: 142, cert: "Logger", camp: "Players",
                friends: [
                    { name: "MARKET_MAKER", intimacy: 45, camp: "RedRoom" }
                ],
                profession: "Thương nhân chợ đen", criminal: false, enemyCamp: false,
                shouldApprove: false, // USA and Level < 145
                lines: [
                    { text: "Chào sếp, em chuyên buôn bán goldbar. Rate hợp lý cho ae nè.", next: "l2" },
                    { text: "Em có nhiều mối làm ăn với mấy khứa nước ngoài, cho em vào camp em để giá ưu đãi cho anh em cày cuốc.", next: null }
                ]
            },
            {
                id: "A07", name: "WOLFE", img: null,
                nationality: "VN", level: 146, cert: "Sniper", camp: "Eternal",
                profession: "Người chơi hệ thám hiểm", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Hi sis- wait- re you girl or boy ? haha. Sao Dem new official?", next: "l2" },
                    { text: "I just want to join and fighting for you guys side. Thats all", next: null }
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
                    { text: "Chào sếp, acc này tôi mới mua của một khứa bên Konoha.", next: "l2" },
                    { text: "Tôi là người VN 100%, mới nhảy hố game này nên mua acc cày cho nhanh. Nhận em vào camp với anh em cho vui sếp ơi hehe.", next: null }
                ]
            }
        ]
    },

    /* ===== DAY 2 ===== */
    {
        day: 2,
        title: "Day Two",
        subtitle: "SCREENING DAY 02 — ĐÁNH THUÊ TRỞ VỀ",
        criteria: [
            { icon: "🇻🇳", cls: "ok",      text: "PRIORITY: Đối với mem VN thì nhận vào không khắt khe." },
            { icon: "🌐", cls: "warning", text: "GLOBAL: Nếu là người nước ngoài thì ít nhất phải level 145+" },
            { icon: "⛔", cls: "danger",  text: "DENY: Kiểm tra hòm thư rival camp và danh sách black list nhé" },
            { icon: "🔍", cls: "ok",      text: "HINT: Hãy chọn check ID để kiểm tra từng người" },
            { icon: "🔍", cls: "ok",      text: "Hãy check cả danh sách CTC returner để xem mọi người đi đánh thuê trở về nhé" },
        ],
        applicants: [
            {
                id: "B01", name: "Xeno", img: null,
                profession: "Play boy", criminal: false, enemyCamp: false,
                nationality: "VN", level: 139, cert: "Miner", camp: "Tagalog",
                friends: [
                    { name: "Sword", intimacy: 85, camp: "Tagalog" },
                    { name: "MENGR", intimacy: 70, camp: "Astral" }
                ],
                shouldApprove: true,
                lines: [
                    { text: "Chào sếp", next: "l2" },
                    { text: "Sau một thời gian lang thang phiêu bạt camp nước ngoài, mình muốn vào camp mình trải nghiệm", next: null }
                ]
            },
            {
                id: "B02", name: "Mangos", img: null,
                profession: "Warrior", criminal: false, enemyCamp: false,
                nationality: "INDO", level: 147, cert: "Herb", camp: "Hunter",
                friends: [
                    { name: "Sins", intimacy: 90, camp: "Hunter" },
                    { name: "MENGR", intimacy: 45, camp: "Astral" }
                ],
                shouldApprove: false,
                lines: [
                    { text: "Hi, the ctc season has been ended", next: "l2" },
                    { text: "Can i join your camp for the next ctc?", next: null }
                ]
            },
            {
                id: "B03", name: "JAMES", img: null,
                profession: "Sniper", criminal: false, enemyCamp: false,
                nationality: "ThaiLand", level: 147, cert: "Herb", camp: "Hunter",
                friends: [
                    { name: "Sins", intimacy: 90, camp: "Hunter" },
                    { name: "MENGR", intimacy: 45, camp: "Astral" }
                ],
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

// NPC 6 & 8 - Supplemental Blacklist Applicants
const PT_BINH_APP = {
    id: "A-BL-02", name: "pt_bình", img: "assets/img/inspector_npc/npc_6.png",
    nationality: "VN", level: 135, cert: "Logger", camp: "Eternal",
    profession: "Cựu thành viên Sao Đêm", criminal: true, enemyCamp: false,
    shouldApprove: false, 
    lines: [
        { text: "Chào sếp, cho tui cơ hội quay lại camp với. Tui biết sai rồi, lần này tui sẽ chăm chỉ cày cuốc.", next: "l2" },
        { text: "[Hệ thống: Đối tượng từng bị trục xuất vì hiềm khích và bêu xấu Sao Đêm. Liên tục rêu rao bêu xấu bên ngoài nhưng luôn tìm cách vào lại thất bại.]", next: null }
    ]
};

const ROY_APP = {
    id: "A-BL-03", name: "Roy", img: "assets/img/inspector_npc/npc_8.png",
    nationality: "VN", level: 148, cert: "Warrior", camp: "Unity",
    profession: "Người chơi tự do", criminal: true, enemyCamp: false,
    shouldApprove: false, 
    lines: [
        { text: "Chào bạn, mình là Minh Nhật. Muốn tìm một camp ổn định để gắn bó lâu dài. Mình có kinh nghiệm PK và săn Boss.", next: "l2" },
        { text: "[Cảnh báo: Nhận dạng thông tin trùng khớp với 'Roy' - Scammer khét tiếng Life After VN. Thường tự giới thiệu là Minh Nhật kèm đời tư giả mạo.]", next: null }
    ]
};

// Inject Roy into Day 3
GAME_DAYS[2].applicants.splice(4, 0, ROY_APP);

// Inject pt_bình randomly into Day 2 or Day 3
if (Math.random() < 0.5) {
    GAME_DAYS[1].applicants.splice(3, 0, PT_BINH_APP); // Day 2
} else {
    GAME_DAYS[2].applicants.splice(2, 0, PT_BINH_APP); // Day 3
}

// Inject one random CTC member into Day 2
const randomCTC = CTC_DATA[Math.floor(Math.random() * CTC_DATA.length)];
const CTC_APP = {
    id: "A-CTC-01", name: randomCTC.name, img: `assets/img/inspector_npc/${randomCTC.img}`,
    nationality: "VN", level: 150, cert: "Warrior", camp: "SAO-ĐÊM",
    profession: "Chiến binh CTC trở về", criminal: false, enemyCamp: false,
    shouldApprove: true,
    lines: [
        { text: `Chào sếp, tôi là ${randomCTC.name} đây. Tôi vừa hoàn thành chuyến đánh thuê CTC quốc tế và trở về camp.`, next: "l2" },
        { text: "Rất vui được quay lại sát cánh cùng anh em SAO-ĐÊM. Sếp check hồ sơ ctc của tôi nhé.", next: null }
    ]
};
GAME_DAYS[1].applicants.splice(Math.floor(Math.random() * 3) + 2, 0, CTC_APP);


/* ================================================
   MAYOR INTRO SCRIPTS (Day Introductions)
================================================ */
const MAYOR_INTRO_SCRIPTS = {
    day_1: {
        'start': {
            speaker: 'Silver-Hand',
            side: 'right',
            image: 'assets/img/mayor_dialogue_1.png',
            text: 'Chào mừng tân Official. Chào mừng bạn đến với quy trình kiểm soát nhân sự đầu tiên của Camp SAO-ĐÊM.',
            next: 'd1_2'
        },
        'd1_2': {
            speaker: 'SYSTEM',
            side: 'left',
            image: 'assets/img/system.png',
            text: 'Thông báo- có nhiều đơn duyệt camp vẫn còn tồn đọng!',
            next: 'd1_3'
        },
        'd1_3': {
            speaker: 'Silver-Hand',
            side: 'right',
            image: 'assets/img/mayor_dialogue_2.png',
            text: 'Phải rồi, xử lý vụ này trước vậy, hãy dựa vào những tiêu chí tôi đề ra trong ngày hôm nay để duyệt member nhé.',
            next: 'd1_4'
        },
        'd1_4': {
            speaker: 'Silver-Hand',
            side: 'right',
            text: 'Chúc may mắn. Tôi sẽ giám sát kết quả của bạn vào cuối ngày.',
            next: null
        }
    },
    day_2: {
        'start': {
            speaker: 'Silver-Hand',
            side: 'right',
            image: 'assets/img/mayor_dialogue_5.png',
            effect: 'flash',
            text: 'Chúc mừng bạn đã tới ngày thứ 2.',
            next: 'd2_2'
        },
        'd2_2': {
            speaker: 'Chy Chy',
            side: 'left',
            image: 'assets/img/inspector_npc/npc_20.png',
            text: 'Chú ơi- mùa CTC này xong rồi, ae đi đánh thuê ở các camp đồng minh sẽ về đấy, chú để ý để duyệt nhé.',
            next: 'd2_3'
        },
        'd2_3': {
            speaker: 'Silver-Hand',
            side: 'right',
            image: 'assets/img/mayor_dialogue_3.png',
            text: 'Uả... hôm nay đã là mùa cuối CTC rồi à. Ok để bảo bạn new official đây quản lý nhé.',
            next: null
        }
    },
    day_3: {
        'start': {
            speaker: 'Silver-Hand',
            side: 'right',
            image: 'assets/img/mayor_dialogue_1.png',
            effect: 'shake',
            text: 'Chúc mừng tới ngày 3 bạn nhé. Tôi có việc quan trọng giao cho bạn đây',
            next: 'd3_2'
        },
        'd3_2': {
            speaker: 'DL',
            side: 'left',
            image: 'assets/img/inspector_npc/npc_25.png',
            text: 'Chú Nam, nhiều ae camp nước ngoài sẽ tới camp mình để chuẩn bị cho mùa CTC sắp tới',
            next: 'd3_3'
        },
        'd3_3': {
            speaker: 'Chy Chy',
            side: 'left',
            image: 'assets/img/inspector_npc/npc_20.png',
            text: 'OK. Và chú nhớ duyệt cả những acc được báo danh liệt kê từ các camp đồng minh nhé',
            next: 'd3_4'
        },
        'd3_4': {
            speaker: 'Silver-Hand',
            side: 'right',
            image: 'assets/img/mayor_dialogue_2.png',
            text: 'Rắc rối nhỉ. Chúc bạn new official may mắn.',
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
    dayScores: [],
    ctcUnlockShown: false,
    day1UnlockShown: false
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
    mayorNoteModal, mayorBtn, mayorNoteContent,
    ctcModal, ctcBtn, ctcGrid;

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

    // CTC elements
    ctcModal         = $('ctcModal');
    ctcBtn           = $('ctcBtn');
    ctcGrid          = $('ctcGrid');

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

    // CTC Modal Toggle
    window.toggleCtcModal = (show) => {
        if (show) {
            populateCtcList();
            ctcModal.classList.add('show');
            if (lookupContainer) lookupContainer.style.display = 'none';
            playSfx('nierMail');
        } else {
            ctcModal.classList.remove('show');
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
    idAvatarImg.src      = resolvePortraitPath(applicant.img);
    
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
    centerNode.innerHTML  = `<img src="${resolvePortraitPath(applicant.img)}" class="social-avatar">`;
    socialContainer.appendChild(centerNode);
    
    if (!friends || friends.length === 0) {
        return;
    }

    const radius = Math.min(socialContainer.offsetWidth * 0.45, socialContainer.offsetHeight * 0.45);
    friends.forEach((friend, idx) => {
        // Rotate layout by an offset (e.g., 30 degrees) to ensure a more natural, angled branching look
        const startOffset = Math.PI / 6;
        const angle = ((idx / friends.length) * (2 * Math.PI)) + startOffset;
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
        
        // Find friend's image or use fallback
        const friendImg = findCharacterImageByName(friend.name);
        const portraitSrc = friendImg ? resolvePortraitPath(friendImg) : "assets/img/avatars/generic.png";
        
        node.innerHTML = `<img src="${portraitSrc}" class="social-avatar">`;
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
    if (lookupContainer) {
        lookupContainer.style.display = 'flex';
        // Show/Hide CTC button based on day
        if (ctcBtn) {
            const isDay2 = (State.day >= 1);
            ctcBtn.style.display = isDay2 ? 'flex' : 'none';
            // Fire the "NEW FUNCTION UNLOCKED" animation only once, on Day 2 start
            if (State.day === 1 && !State.ctcUnlockShown) {
                State.ctcUnlockShown = true;
                setTimeout(() => triggerCtcUnlockAnim(), 800);
            }
        }
        // Fire Day 1 unlock animation
        if (State.day === 0 && !State.day1UnlockShown) {
            State.day1UnlockShown = true;
            setTimeout(() => triggerDay1UnlockAnim(), 800);
        }
    }
}

/* ================================================
   CTC UNLOCK ANIMATION (fires once on Day 2 start)
================================================ */
function triggerCtcUnlockAnim() {
    const toast = document.getElementById('ctcUnlockToast');
    const badge = document.getElementById('ctcNewBadge');

    // 1. Add glow ring on button
    if (ctcBtn) ctcBtn.classList.add('ctc-glow');

    // 2. Slide toast up
    if (toast) {
        toast.classList.remove('hide');
        toast.classList.add('show');
    }

    // 3. After 3.5s: slide toast back down, remove glow (but keep badge)
    setTimeout(() => {
        if (toast) {
            toast.classList.remove('show');
            toast.classList.add('hide');
        }
        if (ctcBtn) ctcBtn.classList.remove('ctc-glow');
    }, 3500);

    // 4. After 10s: remove the NEW badge permanently
    setTimeout(() => {
        if (badge) {
            badge.style.transition = 'opacity 0.5s';
            badge.style.opacity = '0';
            setTimeout(() => badge.remove(), 500);
        }
    }, 10000);
}

/* ================================================
   DAY 1 UNLOCK ANIMATION (fires once on Day 1 start)
================================================ */
function triggerDay1UnlockAnim() {
    const toast = document.getElementById('day1UnlockToast');
    const rivalBtnLocal = document.getElementById('rivalBtn');
    const blacklistBtnLocal = document.getElementById('blacklistBtn');
    const rivalBadge = document.getElementById('rivalNewBadge');
    const blacklistBadge = document.getElementById('blacklistNewBadge');

    // 1. Add glow ring on buttons
    if (rivalBtnLocal) rivalBtnLocal.classList.add('rival-glow');
    if (blacklistBtnLocal) blacklistBtnLocal.classList.add('blacklist-glow');

    // 2. Slide toast up
    if (toast) {
        toast.classList.remove('hide');
        toast.classList.add('show');
    }

    // 3. After 3.5s: slide toast back down, remove glow (but keep badges)
    setTimeout(() => {
        if (toast) {
            toast.classList.remove('show');
            toast.classList.add('hide');
        }
        if (rivalBtnLocal) rivalBtnLocal.classList.remove('rival-glow');
        if (blacklistBtnLocal) blacklistBtnLocal.classList.remove('blacklist-glow');
    }, 3500);

    // 4. After 10s: remove the NEW badges permanently
    setTimeout(() => {
        if (rivalBadge) {
            rivalBadge.style.transition = 'opacity 0.5s';
            rivalBadge.style.opacity = '0';
            setTimeout(() => rivalBadge.remove(), 500);
        }
        if (blacklistBadge) {
            blacklistBadge.style.transition = 'opacity 0.5s';
            blacklistBadge.style.opacity = '0';
            setTimeout(() => blacklistBadge.remove(), 500);
        }
    }, 10000);
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
    stampOverlay.querySelector('.stamp-text').textContent = isApprove ? 'ACCEPT' : 'REFUSE';
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
/* ============ BLACKLIST LOGIC ============ */
const BLACKLIST_DATA = [
    { 
        name: "ZATAN", 
        img: "npc_17.png", 
        story: "Từng là ở SAO ĐÊM, tuy nhiên người này liên tục offline mất tăm và ra vào camp liên tục, thời gian chơi cũng không bền, chuyên gia gạ mua acc rồi bán ngay tức thì với giá cao hơn kiếm lời.. Hơn hết rất nhiều người tố cáo cách sống rất không được sạch sẽ trong quá khứ. Sau một thời gian ra vào camp rồi lại offline trên dưới 6-7 lần, camp quyết định không nhận người này nữa."
    },
    { 
        name: "pt_bình", 
        img: "npc_6.png", 
        story: "Hiềm khích cá nhân với các cấp quản lý Sao Đêm ngày xưa. Sau khi bị trục xuất, đối tượng liên tục bêu xấu camp và tẩy não nhiều người VN bên ngoài khác, nhưng nực cười ở chỗ đối tượng vẫn âm mưu trà trộn quay lại bằng nhiều cách khác nhau. Thậm chí từng cố gắng comeback camp nhưng không được."
    },
    { 
        name: "Roy", 
        img: "npc_8.png", 
        story: "Kẻ lừa đảo chuyên nghiệp. Thường lấy tên 'Minh Nhật' để tiếp cận người mới, gạ người ta mua bán và đặc biệt là gửi code cho bản thân- sau đó cách thức của scammer này luôn là dán email recovery vào để chiếm đoạt tài sản. Chúng có 2 người 1 nam và 1 nữ thay phiên nhau scam và mời gọi. Trong văn nói chuyện luôn xưng gọi Ní ơi và cố gắng thân thiết đến mức độ sến súa nhất có thế- rất hay thề thốt và nổ, chúng từng suýt thành công chiếm đoạt tài khoản của Silver-Hand vào cuối năm 2023 nhưng bị lật kèo."
    }
];

function toggleBlacklist(show) {
    const modal = document.getElementById('blacklistModal');
    if (show) {
        populateBlacklist();
        modal.classList.add('show');
    } else {
        modal.classList.remove('show');
    }
}

function populateBlacklist() {
    const grid = document.getElementById('blacklistGrid');
    const storyBox = document.getElementById('blacklistStory');
    if (!grid) return;
    grid.innerHTML = '';
    
    if (storyBox) storyBox.textContent = "Chọn một đối tượng để xem báo cáo vi phạm...";
    
    BLACKLIST_DATA.forEach(person => {
        const item = document.createElement('div');
        item.className = 'blacklist-item';
        
        const portrait = `assets/img/inspector_npc/portrail/${person.img}`;
        
        item.innerHTML = `
            <div class="blacklist-avatar-wrap">
                <img src="${portrait}" class="blacklist-avatar">
            </div>
            <div class="blacklist-name">${person.name}</div>
        `;
        
        item.onclick = () => {
            // Remove active from others
            document.querySelectorAll('.blacklist-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Show story
            showBlacklistStory(person.story);
            playSfx('nierMenu');
        };
        
        grid.appendChild(item);
    });
}

let blacklistTypeTimer = null;
let currentBlacklistStory = "";

function showBlacklistStory(text) {
    const box = document.getElementById('blacklistStory');
    if (!box) return;
    
    currentBlacklistStory = text;
    if (blacklistTypeTimer) clearInterval(blacklistTypeTimer);
    box.textContent = '';
    
    let i = 0;
    blacklistTypeTimer = setInterval(() => {
        box.textContent += text.charAt(i);
        // Auto-scroll to bottom
        box.scrollTop = box.scrollHeight;
        
        i++;
        if (i >= text.length) {
            clearInterval(blacklistTypeTimer);
            blacklistTypeTimer = null;
        }
    }, 20);

    // Click to skip typing
    box.onclick = () => {
        if (blacklistTypeTimer) {
            clearInterval(blacklistTypeTimer);
            blacklistTypeTimer = null;
            box.textContent = currentBlacklistStory;
            box.scrollTop = box.scrollHeight;
        }
    };
}


/* ============ CTC LOGIC ============ */
function populateCtcList() {
    if (!ctcGrid) return;
    ctcGrid.innerHTML = '';
    
    const storyBox = document.getElementById('ctcStory');
    if (storyBox) storyBox.textContent = 'Chọn một thành viên để xem thông tin đi đánh thuê...';
    
    CTC_DATA.forEach(person => {
        const item = document.createElement('div');
        item.className = 'ctc-item';
        
        const portrait = `assets/img/inspector_npc/portrail/${person.img}`;
        
        item.innerHTML = `
            <div class="ctc-avatar-wrap">
                <img src="${portrait}" class="ctc-avatar">
            </div>
            <div class="ctc-name">${person.name}</div>
        `;
        
        item.onclick = () => {
            document.querySelectorAll('.ctc-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            showCtcStory(person.story);
            playSfx('nierMenu');
        };
        
        ctcGrid.appendChild(item);
    });
}

let ctcTypeTimer = null;
let currentCtcStory = '';

function showCtcStory(text) {
    const box = document.getElementById('ctcStory');
    if (!box) return;
    
    currentCtcStory = text;
    if (ctcTypeTimer) clearInterval(ctcTypeTimer);
    box.textContent = '';
    
    let i = 0;
    ctcTypeTimer = setInterval(() => {
        box.textContent += text.charAt(i);
        box.scrollTop = box.scrollHeight;
        i++;
        if (i >= text.length) {
            clearInterval(ctcTypeTimer);
            ctcTypeTimer = null;
        }
    }, 20);

    box.onclick = () => {
        if (ctcTypeTimer) {
            clearInterval(ctcTypeTimer);
            ctcTypeTimer = null;
            box.textContent = currentCtcStory;
            box.scrollTop = box.scrollHeight;
        }
    };
}
