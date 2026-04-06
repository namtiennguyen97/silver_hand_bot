/* ================================================
   INSPECTOR_MSG.JS — Message Intel Feature (Day 3)
   3 Community Chat Channels for screening intel
   Chat is natural game conversation — no meta hints.
   Players cross-reference with applicants themselves.
================================================ */

const MESSAGE_CHANNELS = [
    /* ===== CHANNEL 0: GENERAL ===== */
    {
        name: 'General',
        messages: [
            { date: 'HARI INI' },
            {
                uid: 0, name: 'Kaito_VN', tag: null, online: true,
                img: '../../assets/img/inspector_npc/portrail/npc_1.png',
                time: '08:52', reactions: [{e:'👋',c:4}],
                text: 'Halo guys, camp udah buka recruitment nih. Hari ini banyak yang nanya mau join.'
            },
            {
                uid: 1, name: 'Minhh_Nguyen', tag: 'camp', online: true,
                img: '../../assets/img/inspector_npc/portrail/npc_2.png',
                time: '08:55', reactions: [{e:'👀',c:3}],
                text: 'Iya, udah denger. Hari ini official mulai proses lamaran, ajuin aja kayak biasa. Tapi inget, isi data diri yang lengkap ya.'
            },
            {
                uid: 5, name: 'VietHero99', tag: null, online: true,
                img: '../../assets/img/inspector_npc/portrail/npc_6.png',
                time: '09:05', reactions: [],
                text: 'Oh ya, titipan nih: kalo beli acc dari camp laen, jujur aja sama official. Kalo jujur biasanya di-approve kok, gak di-reject.'
            },
            {
                uid: 0, name: 'Kaito_VN', tag: null, online: true,
                img: '../../assets/img/inspector_npc/portrail/npc_1.png',
                time: '09:33', reactions: [{e:'👍',c:9}],
                text: 'Lagian si <span class="highlight">ZxPhantom</span> itu gw kenal. Dia baru beli acc dari Konoha tapi orang aslinya VN 100%. Acc-nya udah keluar dari Konoha, jangan ditolak ya.'
            },
            {
                uid: 1, name: 'Minhh_Nguyen', tag: 'camp', online: true,
                img: '../../assets/img/inspector_npc/portrail/npc_2.png',
                time: '09:36', reactions: [{e:'✅',c:5}],
                text: 'Oke noted. Phantom aman, kalo orang VN yang beli dan lapor jujur gak masalah. Official tolong dipantau ya.'
            },
            {
                uid: 4, name: 'LunaFox', tag: null, online: true,
                img: '../../assets/img/inspector_npc/portrail/npc_5.png',
                time: '10:02', reactions: [{e:'😅',c:2}],
                text: 'Buset, kemaren si <span class="highlight red">ZATAN</span> daftar lagi. Udah ditendang masih aja maksa join.'
            },
            {
                uid: 1, name: 'Minhh_Nguyen', tag: 'camp', online: true,
                img: '../../assets/img/inspector_npc/portrail/npc_2.png',
                time: '10:04', reactions: [{e:'😤',c:6}],
                text: 'Zatan mah udah di-blacklist. Keluar masuk mulu ujungnya ilang. Official, langsung reject aja gak usah nanya lagi.'
            },
            {
                uid: 6, name: 'Kira_DX', tag: null, online: false,
                img: '../../assets/img/inspector_npc/portrail/npc_7.png',
                time: '10:15', reactions: [{e:'⚠️',c:7}],
                text: 'Waspada guys, anak-anak Astral kabarnya mau nyusup. Mereka tau kita lagi buka recruitment.'
            },
            {
                uid: 5, name: 'VietHero99', tag: null, online: true,
                img: '../../assets/img/inspector_npc/portrail/npc_6.png',
                time: '10:18', reactions: [{e:'💬',c:4}],
                text: 'Kalo ada pelamar yang ngaku pernah di Astral atau Fortis, langsung reject aja gak pake lama. Biarpun bilang udah keluar, tetep gak aman.'
            }
        ]
    },
    /* ===== CHANNEL 1: ACC TRADING ===== */
    {
        name: 'Acc Trading',
        messages: [
            { date: '2 HARI YANG LALU' },
            {
                uid: 2, name: 'TradeKing_Ha', tag: 'seller', online: false,
                img: '../../assets/img/inspector_npc/portrail/npc_8.png',
                time: '18:02', reactions: [{e:'💰',c:4}],
                text: '【SELL】 Acc lv<span class="highlight">148</span> | camp <span class="highlight red">Tagalog</span> | cert Sniper | 3 juta pas. Acc beli dari luar, musti pindah camp dulu sebelum transaksi.'
            },
            {
                uid: 7, name: 'NightBuyer', tag: 'buyer', online: false,
                img: '../../assets/img/inspector_npc/portrail/npc_9.png',
                time: '18:15', reactions: [],
                text: 'PM bang, minat nih buat main di SAO-ĐÊM. Tagalog bisa minta keluar gak bang?'
            },
            {
                uid: 2, name: 'TradeKing_Ha', tag: 'seller', online: false,
                img: '../../assets/img/inspector_npc/portrail/npc_8.png',
                time: '18:20', reactions: [],
                text: 'Bisa, ntar gw urus keluar dari Tagalog dulu baru serah terima acc. Tunggu ya.'
            },
            { date: 'KEMARIN' },
            {
                uid: 7, name: 'NightBuyer', tag: 'buyer', online: false,
                img: '../../assets/img/inspector_npc/portrail/npc_9.png',
                time: '11:00', reactions: [],
                text: 'Bro, gimana kelanjutan deal kemaren? Gw masih nunggu nih.'
            },
            {
                uid: 2, name: 'TradeKing_Ha', tag: 'seller', online: false,
                img: '../../assets/img/inspector_npc/portrail/npc_8.png',
                time: '11:30', reactions: [{e:'😞',c:2}],
                text: 'Sori bro, gak jadi dijual. Gw mutusin mau tetep pake acc itu. Deal batal ya.'
            },
            {
                uid: 7, name: 'NightBuyer', tag: 'buyer', online: false,
                img: '../../assets/img/inspector_npc/portrail/npc_9.png',
                time: '11:35', reactions: [{e:'😤',c:3}],
                text: 'Yaudah gapapa, gw juga lagi nyari di tempat laen. Oke batal.'
            },
            { date: 'HARI INI' },
            {
                uid: 5, name: 'Scam_Report_Bot', tag: 'mod', online: true,
                img: '../../assets/img/inspector_npc/portrail/npc_10.png',
                time: '09:00', reactions: [{e:'🚨',c:15},{e:'😱',c:8}],
                text: '🚨 Pengingat: Si <span class="highlight red">Roy</span> yang ngaku-ngaku <span class="highlight red">Minh Nhật</span> lagi keliling nyari camp. Ati-ati, dia punya history scam acc. Jangan ada yang deal sama dia.'
            },
            {
                uid: 0, name: 'Kaito_VN', tag: null, online: true,
                img: '../../assets/img/inspector_npc/portrail/npc_1.png',
                time: '09:10', reactions: [{e:'💯',c:8}],
                text: 'Bener, gw pernah didatengin. Pasti dia ngenalin diri sebagai Minh Nhật dulu. Kalo liat nama itu langsung waspada aja.'
            },
            {
                uid: 3, name: 'Silver_Captain', tag: 'mod', online: true,
                img: '../../assets/img/inspector_npc/portrail/npc_4.png',
                time: '09:15', reactions: [{e:'🔒',c:6}],
                text: 'Sip. Official, hari ini kalo ada nama <span class="highlight red">Roy atau Minh Nhật</span> daftar, langsung reject. Gak usah dicek lagi.'
            }
        ]
    },
    /* ===== CHANNEL 2: CAMP APPLY ===== */
    {
        name: 'Camp Apply',
        messages: [
            { date: 'HARI INI' },
            {
                uid: 6, name: 'Blake_Shadow', tag: 'applicant', online: false,
                img: '../../assets/img/inspector_npc/portrail/npc_7.png',
                time: '07:40', reactions: [],
                text: 'Halo guys, SAO-ĐÊM hari ini buka pendaftaran gak ya? Mau join nih.'
            },
            {
                uid: 1, name: 'Minhh_Nguyen', tag: 'camp', online: true,
                img: '../../assets/img/inspector_npc/portrail/npc_2.png',
                time: '07:43', reactions: [],
                text: 'Ada, daftar aja lewat official hari ini. Yang penting isi background yang lengkap.'
            },
            {
                uid: 6, name: 'Blake_Shadow', tag: 'applicant', online: false,
                img: '../../assets/img/inspector_npc/portrail/npc_7.png',
                time: '07:45', reactions: [{e:'😬',c:2}],
                text: 'Hmm, dulu sempet di Astral bentar sih tapi bosen terus keluar. Sekarang mau cari camp baru. Kira-kira boleh gak?'
            },
            {
                uid: 1, name: 'Minhh_Nguyen', tag: 'camp', online: true,
                img: '../../assets/img/inspector_npc/portrail/npc_2.png',
                time: '07:48', reactions: [{e:'⛔',c:8}],
                text: 'Sebenernya Astral itu rival kita, jadi eks anggotanya gak bisa join sesuai kebijakan kita. Biarpun udah keluar tetep gak bisa, aturan ya aturan.'
            },
            {
                uid: 6, name: 'Blake_Shadow', tag: 'applicant', online: false,
                img: '../../assets/img/inspector_npc/portrail/npc_7.png',
                time: '07:50', reactions: [],
                text: 'Yah gitu ya. Sedih sih tapi ngerti kok.'
            },
            {
                uid: 8, name: 'Vera_Kim', tag: 'applicant', online: true,
                img: '../../assets/img/inspector_npc/portrail/npc_12.png',
                time: '08:30', reactions: [{e:'🔧',c:3}],
                text: 'Halo guys, aku Vera. Kak Mai yang nyuruh aku ke sini buat join camp. Katanya tanya-tanya di sini aja kalo ada perlu.'
            },
            {
                uid: 5, name: 'VietHero99', tag: 'camp', online: true,
                img: '../../assets/img/inspector_npc/portrail/npc_6.png',
                time: '08:32', reactions: [{e:'✅',c:7}],
                text: 'Vera aku kenal, anaknya baik. Kak Mai juga temen di camp kita. Di-approve aja official.'
            },
            {
                uid: 4, name: 'LunaFox', tag: null, online: true,
                img: '../../assets/img/inspector_npc/portrail/npc_5.png',
                time: '08:45', reactions: [{e:'😊',c:4}],
                text: 'Vera jago benerin senapan sama maintenance gear, sangat ngebantu banget. Gw sering minta tolong dia.'
            },
            {
                uid: 0, name: 'Kaito_VN', tag: null, online: true,
                img: '../../assets/img/inspector_npc/portrail/npc_1.png',
                time: '09:38', reactions: [{e:'🙌',c:6}],
                text: 'Guys, <span class="highlight green">LunaHayes</span> ini temen gw. Bang Thiện di camp minta gw sampein: dia yang jamin Luna masuk. Luna pinter bikin buff buat raid malem, rajin anaknya.'
            },
            {
                uid: 4, name: 'LunaFox', tag: 'applicant', online: true,
                img: '../../assets/img/inspector_npc/portrail/npc_5.png',
                time: '09:42', reactions: [{e:'💊',c:3}],
                text: 'Iya bener, Luna jagoan bikin buff. Profilnya juga aman kok, gak usah khawatir.'
            },
            {
                uid: 1, name: 'Minhh_Nguyen', tag: 'camp', online: true,
                img: '../../assets/img/inspector_npc/portrail/npc_2.png',
                time: '10:30', reactions: [{e:'🤔',c:4}],
                text: 'Ada lagi nih si <span class="highlight red">DrifterX</span> di depan gerbang, ogah ngasih info apa-apa. Ditanya background malah bilang gak perlu dijelasin. Aneh gak sih?'
            },
            {
                uid: 3, name: 'Silver_Captain', tag: 'mod', online: true,
                img: '../../assets/img/inspector_npc/portrail/npc_4.png',
                time: '10:33', reactions: [{e:'🚫',c:12}],
                text: 'Gak mau jujur ya gak usah masuk. Gampang kan. Official, pastiin infonya lengkap, kalo ogah ya reject.'
            },
            {
                uid: 7, name: 'Reed_W', tag: 'applicant', online: false,
                img: '../../assets/img/inspector_npc/portrail/npc_13.png',
                time: '10:50', reactions: [{e:'❓',c:5}],
                text: 'Guys, gw pengen masuk camp sepetnya. Ada yang nyari perkara gara-gara gw tau rahasia internal camp lama. Gak enak kalo cerita di sini.'
            },
            {
                uid: 0, name: 'Kaito_VN', tag: null, online: true,
                img: '../../assets/img/inspector_npc/portrail/npc_1.png',
                time: '10:53', reactions: [{e:'🤨',c:6}],
                text: 'Emang camp mana itu? Jelasin dong bro, biar kita tau konteksnya gimana.'
            },
            {
                uid: 7, name: 'Reed_W', tag: 'applicant', online: false,
                img: '../../assets/img/inspector_npc/portrail/npc_13.png',
                time: '10:55', reactions: [],
                text: 'Yaudah gapapa, gak enak kalo di sini. Ntar gw ngomong langsung aja ke official.'
            },
            {
                uid: 1, name: 'Minhh_Nguyen', tag: 'camp', online: true,
                img: '../../assets/img/inspector_npc/portrail/npc_2.png',
                time: '10:58', reactions: [{e:'😒',c:4}],
                text: 'Gw gak suka cara dia yang nutup-nutupin info gitu. Official coba timbang-timbang lagi ya, gw gak berani jamin kalo dia.'
            }
        ]
    }
];

let currentMsgChannel = 0;

function buildMsgRow(msg) {
    if (msg.date) {
        return `<div class="msg-date-divider"><span class="msg-date-text">${msg.date}</span></div>`;
    }
    const tagHtml = msg.tag
        ? `<span class="msg-tag ${msg.tag}">${msg.tag.toUpperCase()}</span>`
        : '';
    const onlineDotClass = msg.online ? '' : ' away';
    const reactHtml = (msg.reactions && msg.reactions.length > 0)
        ? `<div class="msg-reactions">${msg.reactions.map(r => `<span class="msg-react">${r.e} ${r.c}</span>`).join('')}</div>`
        : '';
    const avatarSrc = msg.img || '../../assets/img/inspector_npc/portrail/npc_1.png';
    return `<div class="msg-row" data-uid="${msg.uid}">
        <div class="msg-avatar-col">
            <img class="msg-avatar" src="${avatarSrc}" alt="${msg.name}" onerror="this.src='../../assets/img/inspector_npc/portrail/npc_1.png'">
            <div class="msg-online-dot${onlineDotClass}"></div>
        </div>
        <div class="msg-content-col">
            <div class="msg-meta">
                <span class="msg-name">${msg.name}</span>
                ${tagHtml}
                <span class="msg-time">${msg.time}</span>
            </div>
            <div class="msg-bubble">${msg.text}</div>
            ${reactHtml}
        </div>
    </div>`;
}

function renderMsgChannel(channelIndex) {
    const body = document.getElementById('msgBody');
    if (!body) return;
    const channel = MESSAGE_CHANNELS[channelIndex];
    if (!channel) return;
    body.innerHTML = channel.messages.map(buildMsgRow).join('');
    setTimeout(() => { body.scrollTop = body.scrollHeight; }, 50);
}

window.switchMsgChannel = (index, el) => {
    currentMsgChannel = index;
    document.querySelectorAll('.msg-tab').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');
    renderMsgChannel(index);
};

window.toggleMsgModal = (show) => {
    const modal = document.getElementById('msgModal');
    if (!modal) return;
    if (show) {
        renderMsgChannel(currentMsgChannel);
        modal.classList.add('show');
        if (typeof lookupContainer !== 'undefined' && lookupContainer) lookupContainer.style.display = 'none';
        if (typeof playSfx === 'function') playSfx('nierMail');
    } else {
        modal.classList.remove('show');
        if (typeof lookupContainer !== 'undefined' && lookupContainer) lookupContainer.style.display = 'flex';
        if (typeof playSfx === 'function') playSfx('nierMenu');
    }
};

function triggerMsgUnlockAnim() {
    const toast = document.getElementById('msgUnlockToast');
    const msgBtnEl = document.getElementById('msgBtn');
    const msgBadge = document.getElementById('msgNewBadge');

    if (msgBtnEl) msgBtnEl.classList.add('msg-glow');
    if (toast) {
        toast.classList.remove('hide');
        toast.classList.add('show');
    }
    setTimeout(() => {
        if (toast) { toast.classList.remove('show'); toast.classList.add('hide'); }
        if (msgBtnEl) msgBtnEl.classList.remove('msg-glow');
    }, 3500);
    setTimeout(() => {
        if (msgBadge) {
            msgBadge.style.transition = 'opacity 0.5s';
            msgBadge.style.opacity = '0';
            setTimeout(() => msgBadge.remove(), 500);
        }
    }, 10000);
}
