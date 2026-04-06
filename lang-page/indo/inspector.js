/* ===============================================================
   INSPECTOR.JS - Game Manager for Member Approval Mini-game
   Papers Please style camp recruitment inspector
=============================================================== */

/* ================================================
   INSPECTOR AUDIO ENGINE
   BGM + SFX management for the mini-game
================================================ */
const inspectorSfx = (() => {
    // SFX
    const _sfx = (src, vol = 0.55) => {
        const a = new Audio(src);
        a.volume = vol;
        a.play().catch(() => {});
    };

    // BGM — loop
    let bgm = null;
    let bgmStarted = false;

    function startBgm() {
        if (bgmStarted) return;
        bgmStarted = true;
        bgm = new Audio('../../assets/sounds/pgr_lobby_theme.mp3');
        bgm.loop = true;
        bgm.volume = 0.28;
        bgm.play().catch(() => { bgmStarted = false; });
    }

    // Auto-start BGM on first user gesture (needed for browser autoplay policy)
    function _onFirstInteraction() {
        startBgm();
        document.removeEventListener('click', _onFirstInteraction);
        document.removeEventListener('keydown', _onFirstInteraction);
    }
    document.addEventListener('click', _onFirstInteraction, { once: true });
    document.addEventListener('keydown', _onFirstInteraction, { once: true });

    return {
        click:   () => _sfx('../../assets/sounds/item_select.ogg', 0.55),
        approve: () => _sfx('../../assets/sounds/apcept.ogg', 0.7),
        reject:  () => _sfx('../../assets/sounds/alert_warning.ogg', 0.6),
        startBgm,
        stopBgm: () => { if (bgm) { bgm.pause(); bgm.currentTime = 0; } },
        setBgmVol: (v) => { if (bgm) bgm.volume = v; }
    };
})();

// Shim for legacy playSfx() calls within inspector.js (nierMail / nierMenu)
function playSfx(key) {
    inspectorSfx.click();
}

/* ================================================
   DAY DATA - Criteria & Applicants
================================================ */
/* ================================================
   NPC IMAGE POOL
================================================ */
const NPC_IMAGES = [
    '../../assets/img/inspector_npc/npc_1.png',
    '../../assets/img/inspector_npc/npc_2.png',
    '../../assets/img/inspector_npc/npc_3.png',
    '../../assets/img/inspector_npc/npc_4.png',
    '../../assets/img/inspector_npc/npc_5.png',
    '../../assets/img/inspector_npc/npc_6.png',
    '../../assets/img/inspector_npc/npc_7.png',
    '../../assets/img/inspector_npc/npc_8.png',
    '../../assets/img/inspector_npc/npc_9.png',
    '../../assets/img/inspector_npc/npc_10.png',
    '../../assets/img/inspector_npc/npc_11.png',
    '../../assets/img/inspector_npc/npc_12.png',
    '../../assets/img/inspector_npc/npc_13.png',
    '../../assets/img/inspector_npc/npc_14.png',
    '../../assets/img/inspector_npc/npc_15_couple_type.png',
    '../../assets/img/inspector_npc/npc_16_couple_type.png',
    '../../assets/img/inspector_npc/npc_17.png',
    '../../assets/img/inspector_npc/npc_18.png',
    '../../assets/img/inspector_npc/npc_19.png',
    '../../assets/img/inspector_npc/npc_20.png',
    '../../assets/img/inspector_npc/npc_21.png',
    '../../assets/img/inspector_npc/npc_22.png',
    '../../assets/img/inspector_npc/npc_23.png',
    '../../assets/img/inspector_npc/npc_24.png',
    '../../assets/img/inspector_npc/npc_25.png',
];

// Helper to resolve portrait image path from main NPC image path
function resolvePortraitPath(mainPath) {
    if (!mainPath) return "";
    const filename = mainPath.split('/').pop();
    // Filename in portrail folder matches the numeric prefix (e.g., npc_15_couple_type.png -> npc_15.png)
    const match = filename.match(/npc_\d+/);
    if (match) {
        return `../../assets/img/inspector_npc/portrail/${match[0]}.png`;
    }
    return `../../assets/img/inspector_npc/portrail/${filename}`;
}

const STORY_CHARACTER_IMAGES = {
    'FORD': '../../assets/img/inspector_npc/npc_10.png',
    'MEND': '../../assets/img/inspector_npc/npc_11.png',
    'CHIEF_TAG': '../../assets/img/inspector_npc/npc_18.png',
    'MARKET_MAKER': '../../assets/img/inspector_npc/npc_20.png',
    'REBORN': '../../assets/img/inspector_npc/npc_22.png',
    'BẢO': '../../assets/img/inspector_npc/npc_1.png',
    'MAI': '../../assets/img/inspector_npc/npc_14.png',
    'THIỆN': '../../assets/img/inspector_npc/npc_3.png',
    'ZATAN': '../../assets/img/inspector_npc/npc_17.png'
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
    return `../../assets/img/inspector_npc/npc_${idx}.png`;
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
    "Instruksi Hari 3 sedang disusun..."
];

const CTC_DATA = [
    { 
        name: "Kaelith", 
        img: "npc_5.png", 
        story: "Prajurit veteran yang awalnya di camp asing, tapi sudah bergabung dengan Sao Đêm selama 1 tahun."
    },
    { 
        name: "Xero", 
        img: "npc_12.png", 
        story: "Ahli dalam CTC, tahu banyak tips berguna dalam pertempuran."
    },
    { 
        name: "Valkyrie", 
        img: "npc_19.png", 
        story: "Orang misterius tapi sudah mengabdikan diri 100% untuk Sao Đêm sejak lama- sangat terpercaya."
    }
];

const GAME_DAYS = [

    /* ===== DAY 1 ===== */
    {
        day: 1,
        title: "Serious Mode: Phase 01",
        subtitle: "SCREENING DAY 01 — IDENTITY VERIFICATION",
        criteria: [
            { icon: "🇻🇳", cls: "ok",      text: "PRIORITAS: Untuk member VN, jangan terlalu ketat." },
            { icon: "🌐", cls: "warning", text: "GLOBAL: Jika orang asing, minimal harus level 145+" },
            { icon: "⛔", cls: "danger",  text: "DENY: Cek daftar rival camp dan blacklist ya." },
            { icon: "🔍", cls: "ok",      text: "HINT: Pilih check ID untuk memeriksa setiap orang." }
        ],
        applicants: [
            {
                id: "A01", name: "ELYSIUM", img: "../../assets/img/inspector_npc/npc_3.png",
                nationality: "VN", level: 120, cert: "Herb", camp: "Eternal",
                friends: [
                    { name: "MEND", intimacy: 85, camp: "AVALON" },
                    { name: "FORD", intimacy: 70, camp: "VNHouse" }
                ],
                profession: "Dân cày nguyên liệu", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Halo bos, aku liat camp masih banyak slot kosong jadi mau join nih.", next: "l2" },
                    { text: "Ada pak FORD dari VNHouse yang jamin aku ya. Semoga bisa farming bareng temen-temen.", next: null }
                ]
            },
            {
                id: "A-BL-01", name: "ZATAN", img: "../../assets/img/inspector_npc/npc_17.png",
                nationality: "VN", level: 124, cert: "Drifter", camp: "Eternal",
                profession: "Chuyên gia 'off' lâu ngày", criminal: false, enemyCamp: false,
                shouldApprove: false, 
                lines: [
                    { text: "Halo Walikota, boleh join camp lagi gak?", next: "l2" },
                    { text: "Kali ini janji gak bakal off lama lagi kok... Plis, kasih satu kesempatan terakhir ya!", next: null }
                ]
            },
            {
                id: "A02", name: "COBRA", img: "../../assets/img/inspector_npc/npc_21.png",
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
                id: "A03", name: "NIGHTMARE", img: "../../assets/img/inspector_npc/npc_30.png",
                nationality: "VN", level: 144, cert: "Warrior", camp: "AVALON",
                friends: [
                    { name: "ELYSIUM", intimacy: 85, camp: "Eternal" }
                ],
                profession: "Người chơi cũ quay lại", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Halo bos, aku baru main lagi setelah sempet off. Liat camp lagi rekrut jadi mampir mau join.", next: "l2" },
                    { text: "Aku akrab sama ELYSIUM, soal skill bos tenang aja, gak bakal kaku kok.", next: null }
                ]
            },
            {
                id: "A04", name: "STORM", img: "../../assets/img/inspector_npc/npc_12.png",
                nationality: "INDO", level: 148, cert: "Sniper", camp: "Tagalog",
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
                id: "A05", name: "TITAN", img: "../../assets/img/inspector_npc/npc_5.png",
                nationality: "VN", level: 142, cert: "Logger", camp: "VNHouse",
                friends: [
                    { name: "ELYSIUM", intimacy: 70, camp: "Eternal" }
                ],
                profession: "Kiến trúc sư xây Base", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Bos, aku FORD, aku VN dan main santai aja. Elysium pasti udah cerita soal aku kan?", next: "l2" },
                    { text: "Aku mau join camp. Bagi slot dong bos.", next: null }
                ]
            },
            {
                id: "A06", name: "VIPER", img: "../../assets/img/inspector_npc/npc_31.png",
                nationality: "VN", level: 142, cert: "Logger", camp: "Players",
                friends: [
                    { name: "MARKET_MAKER", intimacy: 45, camp: "RedRoom" }
                ],
                profession: "Thương nhân chợ đen", criminal: false, enemyCamp: false,
                shouldApprove: true, // USA and Level < 145
                lines: [
                    { text: "Halo bos, aku spesialis jual beli goldbar. Rate oke nih buat temen-temen.", next: "l2" },
                    { text: "Aku banyak link bisnis sama orang luar, kalo masuk camp aku kasih harga miring buat temen-temen farming.", next: null }
                ]
            },
            {
                id: "A07", name: "WOLFE", img: "../../assets/img/inspector_npc/npc_22.png",
                nationality: "VN", level: 146, cert: "Sniper", camp: "Eternal",
                profession: "Người chơi hệ thám hiểm", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Hi sis- wait- re you girl or boy ? haha. Sao Dem new official?", next: "l2" },
                    { text: "I just want to join and fighting for you guys side. Thats all", next: null }
                ]
            },
            {
                id: "A08", name: "PHANTOM", img: "../../assets/img/inspector_npc/npc_24.png",
                nationality: "JPN", level: 140, cert: "Rifle man", camp: "Konoha",
                friends: [
                    { name: "REBORN", intimacy: 10, camp: "Konoha" }
                ],
                profession: "Chủ mới mua acc", criminal: false, enemyCamp: true,
                shouldApprove: true, // Special Case: Bought Account
                lines: [
                    { text: "Halo bos, acc ini baru gw beli dari orang Konoha.", next: "l2" },
                    { text: "Gw orang VN 100%, baru nyobain game ini jadi beli acc biar cepet. Join-in camp bareng temen-temen ya bos hehe.", next: null }
                ]
            }
        ]
    },

    /* ===== DAY 2 ===== */
    {
        day: 2,
        title: "Day Two",
        subtitle: "SCREENING DAY 02 — TENTARA BAYARAN KEMBALI",
        criteria: [
            { icon: "🇻🇳", cls: "ok",      text: "PRIORITAS: Untuk member VN, jangan terlalu ketat." },
            { icon: "🌐", cls: "warning", text: "GLOBAL: Jika orang asing, minimal harus level 145+" },
            { icon: "⛔", cls: "danger",  text: "DENY: Cek daftar rival camp dan blacklist ya." },
            { icon: "🔍", cls: "ok",      text: "HINT: Pilih check ID untuk memeriksa setiap orang." },
            { icon: "🔍", cls: "ok",      text: "Coba cek daftar CTC returner buat liat siapa aja yang baru balik dari program bayaran." },
        ],
        applicants: [
            {
                id: "B01", name: "Xeno", img: "../../assets/img/inspector_npc/npc_33.png",
                profession: "Play boy", criminal: false, enemyCamp: false,
                nationality: "VN", level: 139, cert: "Miner", camp: "ROS",
                friends: [
                    { name: "Takumi", intimacy: 85, camp: "ROS" },
                    { name: "Soobin", intimacy: 70, camp: "ROS" }
                ],
                shouldApprove: true,
                lines: [
                    { text: "Halo bos", next: "l2" },
                    { text: "Setelah sempet melanglang buana di camp luar, aku mau cobain join camp ini.", next: null }
                ]
            },
            {
                id: "B02", name: "Mangos", img: "../../assets/img/inspector_npc/npc_39.png",
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
                id: "B03", name: "Jmaes", img: "../../assets/img/inspector_npc/npc_40.png",
                profession: "Sniper", criminal: false, enemyCamp: false,
                nationality: "ThaiLand", level: 146, cert: "Rifle man", camp: "AVALON",
                friends: [
                    { name: "Habert", intimacy: 100, camp: "Eternal" },
                    { name: "Cigull", intimacy: 50, camp: "SANTUY" }
                ],
                shouldApprove: false,
                lines: [
                    { text: "Hi--- I m backkk after CTC.", next: "l2" },
                    { text: "I just fought for your camp in CTC. so tired.", next: null }
                ]
            },
            {
                id: "B04", name: "Creep", img: "../../assets/img/inspector_npc/npc_38.png",
                profession: "Virut", criminal: false, enemyCamp: false,
                shouldApprove: false,
                nationality: "VN", level: 145, cert: "Rifle man", camp: "Eternal",
                friends: [
                    { name: "Yaun", intimacy: 50, camp: "Players" },
                    { name: "Bert", intimacy: 50, camp: "SANTUY" }
                ],
                lines: [
                    { text: "Halo bos besar!!!", next: "l2" },
                    { text: "Aku udah balik dari program bayaran CTC nih.", next: null }
                ]
            },
            {
                id: "B05", name: "Foxy", img: '../../assets/img/inspector_npc/npc_15_couple_type.png',
                profession: "Rifle man", criminal: false, enemyCamp: false,
                nationality: "INDO", level: 147, cert: "Rifle man", camp: "SANTUY",
                friends: [
                    { name: "Wolfy", intimacy: 100, camp: "SANTUY" },
                    { name: "Bert", intimacy: 50, camp: "SANTUY" }
                ],
                shouldApprove: true,
                lines: [
                    { text: "Hi- i heard that you guys is recruiting for strong account.", next: "l2" },
                    { text: "Can i and my cohab join you guys?. She is Wolfy.", next: null }
                ]
            },
            {
                id: "B06", name: "Arisas", img: "../../assets/img/inspector_npc/npc_37.png",
                profession: "Rifle man", criminal: false, enemyCamp: false,
                shouldApprove: true,
                nationality: "VN", level: 134, cert: "Rifle man", camp: "Eternal",
                friends: [
                    { name: "Takung", intimacy: 60, camp: "Astral" },
                    { name: "Opas", intimacy: 50, camp: "Eternal" }
                ],
                lines: [
                    { text: "Halo bos, mới mua con acc", next: "l2" },
                    { text: "Acc-nya agak cupu jadi bos maklum ya. Aku cuma main santai aja.", next: null }
                ]
            }
        ]
    },

    /* ===== DAY 3 ===== */
    {
        day: 3,
        title: "Final Day",
        subtitle: "SCREENING DAY 03 — PEMERIKSAAN KHUSUS",
        criteria: [
            { icon: "⛔", cls: "danger",  text: "BANNED: Anggota atau mantan anggota Rival Camps (Astral, Hunter...)" },
            { icon: "⛔", cls: "danger",  text: "BANNED: Acc masih terdaftar di camp rival saat mendaftar" },
            { icon: "✅", cls: "ok",      text: "APPROVE: Orang yang dijamin langsung oleh anggota SAO-ĐÊM" },
            { icon: "✅", cls: "ok",      text: "APPROVE: Orang VN yang beli acc dan sudah lapor dengan jelas" },
            { icon: "⚠️", cls: "warning", text: "Cek channel Message dengan teliti — banyak info berguna di sana." }
        ],
        applicants: [
            {
                id: "C01", 
                name: "ZxPhantom",
                img: "../../assets/img/inspector_npc/npc_36.png",
                nationality: "VN", level: 140, cert: "Rifle man", camp: "Konoha",
                friends: [
                    { name: "Kaito_VN", intimacy: 95, camp: "Eternal" }
                ],
                profession: "Người chơi tự do", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Halo bos, minta join camp dong. Aku ZxPhantom, baru beli acc ini awal minggu.", next: "l2" },
                    { text: "Acc ini dulunya di Konoha tapi udah keluar, sekarang gak ada camp. Aku orang VN 100% kok bos.", next: null }
                ]
            },
            {
                id: "C02",
                name: "Blake_Shadow",
                img: "../../assets/img/inspector_npc/npc_26.png",
                nationality: "VN", level: 145, cert: "Warrior", camp: "Astral",
                friends: [
                    { name: "Kira_DX", intimacy: 40, camp: "Astral" }
                ],
                profession: "Thợ săn đêm", criminal: false, enemyCamp: true,
                shouldApprove: false,
                lines: [
                    { text: "Halo bos, nghe nói SAO-ĐÊM đang tuyển nên mình qua hỏi thăm. Mình hay đi raid đêm, kinh nghiệm khá nhiều.", next: "l2" },
                    { text: "Dulu pernah di Astral bentar tapi gak cocok terus keluar. Sekarang cari camp baru yang lebih stabil.", next: null }
                ]
            },
            {
                id: "C03",
                name: "Vera_Kim",
                img: "../../assets/img/inspector_npc/npc_35.png",
                nationality: "VN", level: 138, cert: "Herb", camp: "VNHouse",
                friends: [
                    { name: "MAI", intimacy: 100, camp: "SAO-ĐÊM" }
                ],
                profession: "Thợ bảo trì vũ khí", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Halo bos, aku Vera. Kak Mai dari camp ini yang nyuruh aku daftar ke mari.", next: "l2" },
                    { text: "Aku spesialis craft senapan sama jual goldbar buat temen-temen, gak ada kaitan sama rival camp manapun ya.", next: null }
                ]
            },
            {
                id: "C04",
                name: "NightBuyer",
                img: "../../assets/img/inspector_npc/npc_27.png",
                nationality: "VN", level: 148, cert: "Sniper", camp: "Tagalog",
                friends: [
                    { name: "TradeKing_Ha", intimacy: 35, camp: "Eternal" }
                ],
                profession: "Người chơi mới", criminal: false, enemyCamp: true,
                shouldApprove: false,
                lines: [
                    { text: "Halo bang, aku mau join camp SAO-ĐÊM. Aku pemilik baru acc ini.", next: "l2" },
                    { text: "Acc Tagalog ini deal-nya agak telat jadi baru beres tadi sore.", next: null }
                ]
            },
            {
                id: "C05",
                name: "Reed_W",
                img: "../../assets/img/inspector_npc/npc_28.png",
                nationality: "VN", level: 142, cert: "Miner", camp: "Konoha",
                friends: [
                    { name: "Shadow", intimacy: 15, camp: "Konoha" }
                ],
                profession: "Người chơi lang thang", criminal: false, enemyCamp: true,
                shouldApprove: false,
                lines: [
                    { text: "Aku harus masuk camp segera, orang-orang di sana lagi nyari perkara karena aku tau rahasia internal mereka.", next: "l2" },
                    { text: "Gak enak cerita di sini bos, tapi percaya deh, aku di pihak SAO-ĐÊM kok. Perlu join cepet.", next: null }
                ]
            },
            {
                id: "C06",
                name: "LunaHayes",
                img: "../../assets/img/inspector_npc/npc_29.png",
                nationality: "VN", level: 135, cert: "Herb", camp: "SANTUY",
                friends: [
                    { name: "THIỆN", intimacy: 98, camp: "SAO-ĐÊM" }
                ],
                profession: "Dân chế Buff", criminal: false, enemyCamp: false,
                shouldApprove: true,
                lines: [
                    { text: "Halo bos! Aku Luna, ahihi. Bang Thiện nitip pesen suruh daftar join camp.", next: "l2" },
                    { text: "Aku spesialis bikin obat buff buat temen-temen raid malem. Gak tau soal perang camp gitu, cuma suka main santai.", next: null }
                ]
            },
            {
                id: "C07",
                name: "DrifterX",
                img: "../../assets/img/inspector_npc/npc_32.png",
                nationality: "USA", level: 150, cert: "Warrior", camp: "Fortis",
                friends: [],
                profession: "Người chơi ẩn danh", criminal: false, enemyCamp: true,
                shouldApprove: false,
                lines: [
                    { text: "Bentuk saya join camp, gak usah banyak nanya. Saya udah syarat kok.", next: "l2" },
                    { text: "Profil saya aman, saya gak mau cerita apa-apa lagi. Langsung approve aja.", next: null }
                ]
            }
        ]
    }
];

// NPC 6 & 8 - Supplemental Blacklist Applicants
const PT_BINH_APP = {
    id: "A-BL-02", name: "pt_bình", img: "../../assets/img/inspector_npc/npc_6.png",
    nationality: "VN", level: 135, cert: "Logger", camp: "Eternal",
    friends: [
        { name: "CHIEF_TAG", intimacy: 45, camp: "Tagalog" }
    ],
    profession: "Cựu thành viên Sao Đêm", criminal: true, enemyCamp: false,
    shouldApprove: false,
    lines: [
        { text: "Bos, kasih aku balik ke camp dong. Aku tau aku salah, janji kali ini rajin dan gak bakal bikin onar lagi.", next: "l2" },
        { text: "Dulu aku emosian banget makanya jadi gitu, tapi sekarang udah beda. Aku cuma mau farming bareng temen-temen lagi.", next: null }
    ]
};

const ROY_APP = {
    id: "A-BL-03", name: "Roy", img: "../../assets/img/inspector_npc/npc_8.png",
    nationality: "VN", level: 148, cert: "Warrior", camp: "Unity",
    friends: [
        { name: "Kaito_VN", intimacy: 10, camp: "Eternal" }
    ],
    profession: "Người chơi tự do", criminal: true, enemyCamp: false,
    shouldApprove: false,
    lines: [
        { text: "Halo kawan, aku Minh Nhật. Lagi cari camp stabil buat gabung. Aku berpengalaman dan sangat terpercaya.", next: "l2" },
        { text: "Udah lama main tapi belum sempet join camp bagus. Semoga official kasih aku kesempatan ya!", next: null }
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
    id: "A-CTC-01", name: randomCTC.name, img: `../../assets/img/inspector_npc/${randomCTC.img}`,
    nationality: "VN", level: 147, cert: "Warrior", camp: "SANTUY",
    profession: "Rifle man", criminal: false, enemyCamp: false,
    friends: [
        { name: "DL", intimacy: 100, camp: "Sao-Đêm" },
        { name: "Grace", intimacy: 50, camp: "Avalon" }
    ],
    shouldApprove: true,
    lines: [
        { text: `Halo bos, tôi là ${randomCTC.name}  nih. Baru aja selese program bayaran CTC internasional dan balik ke camp.`, next: "l2" },
        { text: "Seneng banget bisa balik lagi bareng temen-temen SAO-ĐÊM. Bos coba cek profil CTC aku ya.", next: null }
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
            image: '../../assets/img/mayor_dialogue_1.png',
            text: 'Selamat datang Official baru. Selamat datang di proses kontrol personel pertama Camp SAO-ĐÊM.',
            next: 'd1_2'
        },
        'd1_2': {
            speaker: 'SYSTEM',
            side: 'left',
            image: '../../assets/img/system.png',
            text: 'Peringatan- masih banyak lamaran join camp yang menumpuk!',
            next: 'd1_3'
        },
        'd1_3': {
            speaker: 'Silver-Hand',
            side: 'right',
            image: '../../assets/img/mayor_dialogue_2.png',
            text: 'Ya bener, kerjain ini dulu. Gunain kriteria yang udah gw tentuin hari ini buat seleksi member ya.',
            next: 'd1_4'
        },
        'd1_4': {
            speaker: 'Silver-Hand',
            side: 'right',
            text: 'Semoga berhasil. Gw bakal pantau hasil kerja lo di akhir hari.',
            next: null
        }
    },
    day_2: {
        'start': {
            speaker: 'Silver-Hand',
            side: 'right',
            image: '../../assets/img/mayor_dialogue_5.png',
            effect: 'flash',
            text: 'Selamat, lo udah masuk hari kedua.',
            next: 'd2_2'
        },
        'd2_2': {
            speaker: 'Chy Chy',
            side: 'left',
            image: '../../assets/img/inspector_npc/npc_20.png',
            text: 'Paman- musim CTC udah beres nih, temen-temen yang jadi tentara bayaran di camp sekutu bakal balik, paman tolong pantau buat di-approve ya.',
            next: 'd2_3'
        },
        'd2_3': {
            speaker: 'Silver-Hand',
            side: 'right',
            image: '../../assets/img/mayor_dialogue_3.png',
            text: 'Loh... hari ini udah musim terakhir CTC ya. Oke, biar official baru ini yang urus ya.',
            next: null
        }
    },
    day_3: {
        'start': {
            speaker: 'Silver-Hand',
            side: 'right',
            image: '../../assets/img/mayor_dialogue_1.png',
            effect: 'shake',
            text: 'Selamat udah sampe hari ketiga ya. Ada tugas penting buat kamu nih.',
            next: 'd3_2'
        },
        'd3_2': {
            speaker: 'DL',
            side: 'left',
            image: '../../assets/img/inspector_npc/npc_25.png',
            text: 'Paman Nam, banyak yang beli acc dari camp musuh nih, paman coba cek pesannya ya.',
            next: 'd3_3'
        },
        'd3_3': {
            speaker: 'Chy Chy',
            side: 'left',
            image: '../../assets/img/inspector_npc/npc_20.png',
            text: 'OK. Official baru jangan lupa cek pesan di grup umum buat tau situasi biar pas seleksinya ya.',
            next: 'd3_4'
        },
        'd3_4': {
            speaker: 'Silver-Hand',
            side: 'right',
            image: '../../assets/img/mayor_dialogue_2.png',
            text: 'Ribet juga ya. Semoga beruntung buat official baru. Ntar gw acc lo masuk grup camp.',
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
    day1UnlockShown: false,
    msgUnlockShown: false,
    // [NEW] Enhancements
    stability: 100,
    isScanning: false,
    stabilityTimer: null,
    truthScansAvailable: 1,
    gameOver: false
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
    ctcModal, ctcBtn, ctcGrid,
    // [NEW] Enhancements
    stabilityBar, stabilityValue, scannerOverlay, scanTruthBtn;

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

    // [NEW] Enhancements
    stabilityBar    = $('stabilityBar');
    stabilityValue  = $('stabilityValue');
    scannerOverlay  = $('scannerOverlay');
    scanTruthBtn    = $('scanTruthBtn');

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
            // [NEW] Trigger scanner overlay
            if (scannerOverlay) scannerOverlay.classList.add('active');
        } else {
            idCardModal.classList.remove('show');
            if (lookupContainer) lookupContainer.style.display = 'flex';
            playSfx('nierMenu');
            // [NEW] Hide scanner overlay
            if (scannerOverlay) scannerOverlay.classList.remove('active');
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
                mayorNoteContent.textContent = MAYOR_NOTES[State.day] || "Gak ada instruksi baru.";
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

    // ── Global click SFX via event delegation ──────────────────────
    // Plays item_select.ogg on any interactive element EXCEPT approve/
    // reject buttons (those already trigger via makeDecision).
    document.addEventListener('click', (e) => {
        const el = e.target.closest('button, .lookup-btn, .msg-tab, [onclick]');
        if (!el) return;
        // Use ID string comparison — more reliable than object reference
        const eid = el.id;
        if (eid === 'approveBtn' || eid === 'rejectBtn') return;
        inspectorSfx.click();
    }, true);

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
        const portraitSrc = friendImg ? resolvePortraitPath(friendImg) : "../../assets/img/avatars/generic.png";
        
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

    // [NEW] Start stability logic
    updateStability(0); // init UI
    startStabilityDecay();

    // [NEW] Balanced Truth Scan
    if (dayIndex > 0) {
        State.truthScansAvailable++;
    }
    updateTruthScanUI();

    // Update Mayor Note content for this day
    if (mayorNoteContent) {
        mayorNoteContent.textContent = MAYOR_NOTES[dayIndex] || "Gak ada instruksi baru.";
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
        // Show/Hide MSG button based on day (Day 3+)
        const msgBtnEl = document.getElementById('msgBtn');
        if (msgBtnEl) {
            const isDay3 = (State.day >= 2);
            msgBtnEl.style.display = isDay3 ? 'flex' : 'none';
            // Fire the Message Unlock animation only once, on Day 3 start
            if (State.day === 2 && !State.msgUnlockShown) {
                State.msgUnlockShown = true;
                setTimeout(() => {
                    if (typeof triggerMsgUnlockAnim === 'function') triggerMsgUnlockAnim();
                }, 800);
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
   [NEW] ENHANCEMENTS LOGIC (Indonesian)
================================================ */
function updateStability(amount) {
    State.stability = Math.max(0, Math.min(100, State.stability + amount));
    
    if (stabilityBar) {
        stabilityBar.style.width = `${State.stability}%`;
        // Color transition
        if (State.stability > 60) stabilityBar.style.background = 'linear-gradient(90deg, var(--pink), var(--cyan))';
        else if (State.stability > 30) stabilityBar.style.background = 'var(--amber)';
        else stabilityBar.style.background = 'var(--pink)';
    }
    
    if (stabilityValue) {
        stabilityValue.textContent = `${Math.floor(State.stability)}%`;
        stabilityValue.style.color = (State.stability < 30) ? 'var(--pink)' : 'var(--cyan)';
    }
    if (State.stability <= 0) {
        endGameByInstability();
    }
}

let alertTimer = null;
function showSystemAlert(msg, isWarning = true) {
    const el = $('systemAlert');
    if (!el) return;
    
    if (alertTimer) clearTimeout(alertTimer);
    
    el.textContent = msg;
    el.className = isWarning ? 'system-alert show warning' : 'system-alert show';
    playSfx('nierMenu');
    
    alertTimer = setTimeout(() => {
        el.classList.remove('show');
        alertTimer = null;
    }, 2500);
}

function updateTruthScanUI() {
    const btn = $('scanTruthBtn');
    if (btn) {
        const label = btn.querySelector('.term-label');
        if (label) {
            label.textContent = `TRUTH SCAN [${State.truthScansAvailable}]`;
        }
        const badge = $('truthScanBadge');
        if (badge) {
            badge.textContent = State.truthScansAvailable;
            // Always show badge if Truth Scan is unlocked, but style it "empty" if 0
            badge.style.display = 'flex';
            if (State.truthScansAvailable <= 0) {
                badge.classList.add('empty');
            } else {
                badge.classList.remove('empty');
            }
        }
    }
}

function startStabilityDecay() {
    if (State.stabilityTimer) clearInterval(State.stabilityTimer);
    State.stabilityTimer = setInterval(() => {
        if (!State.processing && !State.dialogueDone) {
            updateStability(-0.2); // Slow decay while reading
        } else if (State.dialogueDone) {
            updateStability(-0.8); // Pressure to decide
        }
    }, 1000);
}

function triggerTruthScan() {
    if (State.truthScansAvailable <= 0) {
        showSystemAlert("TIDAK ADA TRUTH SCAN TERSISA UNTUK HARI INI.");
        return;
    }

    if (State.stability < 15) {
        showSystemAlert("STABILITAS TERLALU RENDAH UNTUK TRUTH SCAN.");
        return;
    }
    
    if (State.isScanning) return;
    State.isScanning = true;
    
    State.truthScansAvailable--;
    updateTruthScanUI();
    
    updateStability(-15);
    if (scanTruthBtn) scanTruthBtn.classList.add('scanning');
    playSfx('nierMail');
    
    // Reveal Scanner Overlay briefly on portrait
    if (scannerOverlay) scannerOverlay.classList.add('active');
    
    const applicant = GAME_DAYS[State.day].applicants[State.applicantIndex];
    
    setTimeout(() => {
        State.isScanning = false;
        if (scanTruthBtn) scanTruthBtn.classList.remove('scanning');
        if (scannerOverlay && !idCardModal.classList.contains('show')) {
            scannerOverlay.classList.remove('active');
        }
        
        let hint = "";
        // Logic for specialized hints
        if (applicant.id === "A08") { // Phantom
            hint = "[ANALISIS]: Pembelian akun Pemilik Baru terverifikasi. Etnis: VN.";
        } else if (applicant.enemyCamp && !applicant.shouldApprove) {
            hint = "[ANALISIS]: Potensi Infiltrator. Loyalitas luar terdeteksi.";
        } else if (applicant.criminal) {
            hint = "[ANALISIS]: Sesuai daftar Blacklist. Masa lalu ilegal terkonfirmasi.";
        } else if (applicant.shouldApprove) {
            hint = "[ANALISIS]: Tidak ditemukan ancaman luar. Profil konsisten.";
        } else {
            hint = "[ANALISIS]: Data ambigu. Verifikasi terhadap kriteria.";
        }
        
        showDialogueHint(hint);
    }, 2000);
}

function showDialogueHint(hint) {
    if (!dlgText) return;
    const originalText = dlgText.innerHTML;
    dlgText.innerHTML = `<span style="color:var(--amber); font-weight:bold;">${hint}</span><br>${originalText}`;
    playSfx('nierMenu');
}

function endGameByInstability() {
    if (State.processing || State.gameOver) return;
    State.processing = true;
    State.gameOver = true;

    if (State.stabilityTimer) clearInterval(State.stabilityTimer);
    
    // Dim background & hide buttons
    if (lookupContainer) lookupContainer.style.display = 'none';
    if (approveBtn) approveBtn.classList.remove('active');
    if (rejectBtn) rejectBtn.classList.remove('active');
    if (idCardBtn) idCardBtn.style.display = 'none';

    // Play "Instability" VN sequence
    const script = END_SCRIPTS.instability;
    if (vnEngine && script) {
        setTimeout(() => {
            vnEngine.start(script, 'start', () => {
                showGameOver(true); // Param true means "Failed" context
            });
        }, 500);
    } else {
        showGameOver(true);
    }
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

    // [NEW] Hide Scan button for next applicant
    if (scanTruthBtn) scanTruthBtn.style.display = 'none';
    if (scannerOverlay) scannerOverlay.classList.remove('active');

    // Update counter
    if (applicantCounter) {
        applicantCounter.innerHTML = `Lamaran ke-<span>${applicantIndex + 1}</span> / ${applicants.length}`;
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
                    // [NEW] Show Truth Scan button
                    if (scanTruthBtn) scanTruthBtn.style.display = 'flex';
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
                // [NEW] Show Truth Scan button
                if (scanTruthBtn) scanTruthBtn.style.display = 'flex';
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
    
    // [NEW] Stability reward/penalty
    updateStability(isCorrect ? 8 : -20);

    // Play decision SFX
    if (isApprove) {
        inspectorSfx.approve();
    } else {
        inspectorSfx.reject();
    }

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

    // [NEW] Stop stability decay
    if (State.stabilityTimer) clearInterval(State.stabilityTimer);

    const accuracy = Math.round((State.correct / (State.correct + State.wrong)) * 100) || 0;
    const msg = accuracy >= 80
        ? "Bagus! Keputusan tepat. SAO-ĐÊM nerima orang yang emang perlu."
        : accuracy >= 50
        ? "Lumbayan lah. Ada beberapa bagian yang masih ragu. Coba baca kriteria lebih teliti lagi ya."
        : "Kurang bagus. Banyak kesalahan fatal. Camp ada risiko disusupin.";

    const screen = resultsScreen;
    screen.querySelector('.results-title').textContent = `// HASIL HARI ${dayIndex + 1} //`;
    screen.querySelector('#rs-correct').textContent    = State.correct;
    screen.querySelector('#rs-wrong').textContent      = State.wrong;
    screen.querySelector('#rs-approved').textContent   = State.approved;
    screen.querySelector('#rs-rejected').textContent   = State.rejected;
    screen.querySelector('#rs-accuracy').textContent   = `${accuracy}%`;
    screen.querySelector('#rs-msg').textContent        = msg;

    const nextDayIndex = dayIndex + 1;
    const isLast = nextDayIndex >= GAME_DAYS.length;
    const nextBtn = screen.querySelector('.results-next-btn');
    nextBtn.textContent = isLast ? '// LIHAT HASIL TOTAL //' : `// HARI ${nextDayIndex + 1} //`;
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
   END EPILOGUE SCRIPTS (fires before Game Over screen)
================================================ */
const END_SCRIPTS = {
    perfect: {
        'start': {
            speaker: 'Silver-Hand',
            side: 'right',
            image: '../../assets/img/mayor_dialogue_5.png',
            effect: 'flash',
            text: 'Luar biasa!',
            next: 'e1_2'
        },
        'e1_2': {
            speaker: 'Silver-Hand',
            side: 'right',
            image: '../../assets/img/mayor_dialogue_1.png',
            text: 'Mulai sekarang Walikota bisa tenang istirahat sambil pedekate nih hehe. Official ini beneran bakat langka!',
            next: null
        }
    },
    good: {
        'start': {
            speaker: 'Silver-Hand',
            side: 'right',
            image: '../../assets/img/mayor_dialogue_3.png',
            text: 'Official ini kelihatannya agak kurang mantep...',
            next: 'e2_2'
        },
        'e2_2': {
            speaker: 'Silver-Hand',
            side: 'right',
            image: '../../assets/img/mayor_dialogue_2.png',
            text: 'Tapi kayaknya masih bisa diajarin kok. Terus bareng kita ya.',
            next: null
        }
    },
    bad: {
        'start': {
            speaker: 'Silver-Hand',
            side: 'right',
            image: '../../assets/img/mayor_dialogue_1.png',
            effect: 'shake',
            text: 'Buruk- sangat buruk...',
            next: 'e3_2'
        },
        'e3_2': {
            speaker: 'Silver-Hand',
            side: 'right',
            image: '../../assets/img/mayor_dialogue_2.png',
            text: 'Jadi pada akhirnya aku masih harus melakukan segalanya sendiri ya. Maaf, kita berhenti bekerja sama di sini.',
            next: null
        }
    },
    instability: {
        'start': {
            speaker: 'Silver-Hand',
            side: 'right',
            image: '../../assets/img/mayor_dialogue_4.png',
            effect: 'shake',
            text: 'Aduh! Camp hancur!',
            next: 'i2'
        },
        'i2': {
            speaker: 'Silver-Hand',
            side: 'right',
            image: '../../assets/img/mayor_dialogue_2.png',
            text: 'Camp sedang mengalami masalah stabilitas yang serius. Kita harus berhenti merekrut anggota di sini!',
            next: null
        }
    }
};

/* ================================================
   SHOW GAME OVER
================================================ */
function showGameOver(wasInstability = false) {
    const totalCorrect  = State.dayScores.reduce((a, d) => a + d.correct, 0) + (wasInstability ? State.correct : 0);
    const totalWrong    = State.dayScores.reduce((a, d) => a + d.wrong, 0) + (wasInstability ? State.wrong : 0);
    const totalApps     = GAME_DAYS.reduce((a, d) => a + d.applicants.length, 0);
    const overallPct    = Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) || 0;
    
    const rank = wasInstability ? 'E — COMPROMISED'
               : overallPct >= 90 ? 'S — GRANDMASTER INSPECTOR'
               : overallPct >= 75 ? 'A — SENIOR INSPECTOR'
               : overallPct >= 60 ? 'B — INSPECTOR'
               : overallPct >= 40 ? 'C — JUNIOR ANALYST'
               : 'D — DISMISSED';

    // Prepare game over screen content
    gameOverScreen.querySelector('.go-rank').textContent  = rank;
    gameOverScreen.querySelector('.go-title').textContent = wasInstability ? '// MISI GAGAL //' : '// MISI SELESAI //';
    gameOverScreen.querySelector('.go-title').style.color = wasInstability ? 'var(--pink)' : 'var(--cyan)';
    gameOverScreen.querySelector('.go-score').innerHTML   = `${State.totalScore}<span> PTS</span>`;
    gameOverScreen.querySelector('#go-pct').textContent   = `Benar: ${totalCorrect}  |  Salah: ${totalWrong}  |  Akurasi: ${overallPct}%`;

    gameOverScreen.querySelector('#goReplay').onclick = () => {
        window.location.reload(); // Hard reset for stability
    };
    gameOverScreen.querySelector('#goHome').onclick = () => {
        window.location.href = 'drama.html';
    };

    // Pick epilogue script based on accuracy
    const epilogueKey = overallPct === 100 ? 'perfect'
                      : overallPct >= 80   ? 'good'
                      : 'bad';
    const epilogueScript = END_SCRIPTS[epilogueKey];

    // Play VN epilogue, THEN show game over screen
    if (vnEngine && epilogueScript) {
        setTimeout(() => {
            vnEngine.start(epilogueScript, 'start', () => {
                setTimeout(() => gameOverScreen.classList.add('show'), 400);
            });
        }, 300);
    } else {
        setTimeout(() => gameOverScreen.classList.add('show'), 600);
    }
}
/* ============ BLACKLIST LOGIC ============ */
const BLACKLIST_DATA = [
    { 
        name: "ZATAN", 
        img: "npc_17.png", 
        story: "Pernah di SAO ĐÊM, tapi orang ini sering bgt offline menghilang dan gonta-ganti camp, waktu mainnya gak stabil, spesialis gonta-ganti acc terus langsung dijual lagi dengan harga lebih mahal buat cari untung.. Terlebih lagi banyak yang lapor soal gaya hidupnya yang gak bener di masa lalu. Setelah bolak-balik join camp terus offline sampe 6-7 kali, camp mutusin buat gak terima dia lagi."
    },
    { 
        name: "pt_bình", 
        img: "npc_6.png", 
        story: "Ada dendam pribadi sama manajemen Sao Đêm jaman dulu. Setelah ditendang, orang ini terus-terusan jelek-jelekin camp dan nge-brainwash orang VN laen di luar sana, tapi lucunya dia masih coba-coba nyusup balik lewat berbagai cara. Bahkan sempet usaha pengen balik ke camp tapi gak berhasil."
    },
    { 
        name: "Roy", 
        img: "npc_8.png", 
        story: "Penipu profesional. Sering pake nama 'Minh Nhật' buat deketin pemula, nawarin jual-beli dan minta dikirim kode- terus modus scammer ini selalu tempel email recovery buat ambil alih aset. Mereka ada 2 orang, 1 cowok dan 1 cewek gantian nge-scam. Kalo ngobrol sering manggil 'Ní ơi' dan sok-sokan akrab banget sampe geli- sering sumpah-sumpah dan bual, mereka sempet hampir sukses bajak akun Silver-Hand akhir 2023 tapi gagal total."
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
    
    if (storyBox) storyBox.textContent = "Pilih seseorang buat liat laporan pelanggaran...";
    
    BLACKLIST_DATA.forEach(person => {
        const item = document.createElement('div');
        item.className = 'blacklist-item';
        
        const portrait = `../../assets/img/inspector_npc/portrail/${person.img}`;
        
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
    if (storyBox) storyBox.textContent = 'Pilih satu member buat liat info program bayaran...';
    
    CTC_DATA.forEach(person => {
        const item = document.createElement('div');
        item.className = 'ctc-item';
        
        const portrait = `../../assets/img/inspector_npc/portrail/${person.img}`;
        
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
