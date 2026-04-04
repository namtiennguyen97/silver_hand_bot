/* ================================================
   INSPECTOR_MSG.JS — Message Intel Feature (Day 3)
   3 Community Chat Channels for screening intel
================================================ */

const MESSAGE_CHANNELS = [
    /* ===== CHANNEL 0: GENERAL ===== */
    {
        name: 'General',
        messages: [
            { date: 'HÔM NAY' },
            {
                uid: 0, name: 'Kaito_VN', tag: null, online: true,
                img: 'assets/img/inspector_npc/portrail/npc_1.png',
                time: '09:14', reactions: [{e:'👋',c:5}],
                text: 'Ae ơi camp <span class="highlight cyan">SAO-ĐÊM</span> hôm nay tuyển không vậy? Thấy bảng tuyển thành viên đỏ đèn rồi'
            },
            {
                uid: 1, name: 'Minhh_Nguyen', tag: 'camp', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_2.png',
                time: '09:16', reactions: [{e:'✅',c:3}],
                text: 'Ừ đang có mở hòm thư đó, nhưng nghe đâu hôm nay <span class="highlight red">siết rất chặt</span>, cần check kỹ lắm'
            },
            {
                uid: 2, name: 'ZX_Phantom', tag: null, online: false,
                img: 'assets/img/inspector_npc/portrail/npc_3.png',
                time: '09:18', reactions: [],
                text: 'mình có thằng bạn acc bên <span class="highlight red">Konoha</span> muốn vào, nhưng camp mình với Konoha không deal được nhỉ'
            },
            {
                uid: 3, name: 'Silver_Captain', tag: 'mod', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_4.png',
                time: '09:20', reactions: [{e:'⚠️',c:8},{e:'🔍',c:4}],
                text: '⚠️ Nhắc lại một lần: <span class="highlight red">KONOHA là rival camp</span>. Bất kỳ ai biết người từ Konoha xin vào mà không report thì cũng bị xử lý nhé ae'
            },
            {
                uid: 4, name: 'LunaFox', tag: null, online: true,
                img: 'assets/img/inspector_npc/portrail/npc_5.png',
                time: '09:23', reactions: [{e:'😅',c:2}],
                text: 'Trời ơi, hôm qua thấy mấy tên <span class="highlight red">ZATAN</span> lại đăng tuyển camp rồi... người này bị blacklist rồi mà còn cố hả?'
            },
            {
                uid: 1, name: 'Minhh_Nguyen', tag: 'camp', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_2.png',
                time: '09:25', reactions: [{e:'😤',c:6}],
                text: 'ZATAN thì thôi rồi. Mình biết ông này offline mất tăm liên tục, ra vào 7-8 lần rồi mà. Camp mình tống cổ luôn rồi đặt vào blacklist'
            },
            {
                uid: 5, name: 'VietHero99', tag: null, online: true,
                img: 'assets/img/inspector_npc/portrail/npc_6.png',
                time: '09:31', reactions: [{e:'💬',c:3}],
                text: 'Ờ, ae nhớ check kỹ ID card trước khi duyệt nghen. Nhiều trường hợp thẻ bài ghi nước ngoài nhưng thực ra người VN mua acc lại đó'
            },
            {
                uid: 0, name: 'Kaito_VN', tag: null, online: true,
                img: 'assets/img/inspector_npc/portrail/npc_1.png',
                time: '09:33', reactions: [{e:'👍',c:9}],
                text: 'À đúng rồi, thằng <span class="highlight">PHANTOM</span> tui biết, nó mua acc bên Konoha đó. Người thật là VN 100% nha, đừng từ chối nó'
            },
            {
                uid: 6, name: 'Kira_DX', tag: null, online: false,
                img: 'assets/img/inspector_npc/portrail/npc_7.png',
                time: '09:40', reactions: [{e:'🚨',c:12}],
                text: '❗ Cẩn thận! Nghe tin <span class="highlight red">Delta-9</span> đang cố cài người vào SAO-ĐÊM ngày hôm nay. Tụi nó rành giả dạng lắm'
            },
            {
                uid: 3, name: 'Silver_Captain', tag: 'mod', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_4.png',
                time: '09:42', reactions: [{e:'🔒',c:7}],
                text: 'Đã được báo cáo. Official hôm nay cần <span class="highlight red">kiểm tra KỸ</span> từng người. Đặc biệt check huy hiệu và hình xăm. Ai nghi vấn → từ chối ngay'
            }
        ]
    },
    /* ===== CHANNEL 1: ACC TRADING ===== */
    {
        name: 'Acc Trading',
        messages: [
            { date: '2 NGÀY TRƯỚC' },
            {
                uid: 2, name: 'TradeKing_Ha', tag: 'seller', online: false,
                img: 'assets/img/inspector_npc/portrail/npc_8.png',
                time: '18:02', reactions: [{e:'💰',c:4}],
                text: '【SELL】 Acc lv<span class="highlight">148</span> | cert <span class="highlight">Sniper</span> | camp <span class="highlight red">Tagalog</span> (mua lại từ nước ngoài, có thể chuyển camp) | 3 triệu vnđ firm'
            },
            {
                uid: 7, name: 'NightBuyer', tag: 'buyer', online: false,
                img: 'assets/img/inspector_npc/portrail/npc_9.png',
                time: '18:10', reactions: [],
                text: 'Acc Tagalog không dùng được ở SAO-ĐÊM đó ông. <span class="highlight red">Rival camp</span> à'
            },
            {
                uid: 2, name: 'TradeKing_Ha', tag: 'seller', online: false,
                img: 'assets/img/inspector_npc/portrail/npc_8.png',
                time: '18:13', reactions: [],
                text: 'Biết rồi nên mới note là SẼ chuyển camp trước khi bán. Ae mua xong tự nộp đơn xin vào SAO-ĐÊM bình thường là được, chỉ cần nói là người VN mua acc lại thôi'
            },
            { date: 'HÔM QUA' },
            {
                uid: 5, name: 'Scam_Report_Bot', tag: 'mod', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_10.png',
                time: '11:30', reactions: [{e:'🚨',c:15},{e:'😱',c:8}],
                text: '🚨 CẢNH BÁO SCAMMER: Tên <span class="highlight red">Roy</span> (alias: Minh Nhật) đang tiếp cận nhiều người. Hắn gạ mua bán acc rồi xin gửi code → chiếm đoạt tài khoản. Đã từng nhắm vào <span class="highlight">Silver-Hand</span> cuối 2023. ĐỪNG DEAL!'
            },
            {
                uid: 0, name: 'Kaito_VN', tag: null, online: true,
                img: 'assets/img/inspector_npc/portrail/npc_1.png',
                time: '11:45', reactions: [{e:'💯',c:11}],
                text: 'Nhận ra tụi scammer này dễ lắm: hay xưng <span class="highlight red">"ní ơi"</span>, thề thốt rất nhiều, hỏi số điện thoại và email. <span class="highlight red">BLOCK NGAY</span> khi thấy dấu hiệu này'
            },
            {
                uid: 8, name: 'AccHunter_VN', tag: 'buyer', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_11.png',
                time: '14:22', reactions: [{e:'🤔',c:3}],
                text: 'Hỏi chút: mình mua acc bên camp <span class="highlight red">Hunter</span>, lv 147, giờ muốn xin vào SAO-ĐÊM có được không? Hay bị từ chối vì Hunter là rival?'
            },
            {
                uid: 3, name: 'Silver_Captain', tag: 'mod', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_4.png',
                time: '14:28', reactions: [{e:'✅',c:6}],
                text: 'Nguyên tắc là: bạn phải <span class="highlight green">tự khai</span> với official là đã mua lại acc. Nếu official thấy acc từ rival camp nhưng bạn nói rõ là người VN mua lại → <span class="highlight green">được duyệt</span>. Nên thành thật!'
            },
            { date: 'HÔM NAY' },
            {
                uid: 4, name: 'LunaFox', tag: null, online: true,
                img: 'assets/img/inspector_npc/portrail/npc_5.png',
                time: '08:50', reactions: [{e:'👀',c:7}],
                text: 'Ae ơi có bán acc lv <span class="highlight">134</span> luôn không? Mình đang tìm acc tầm level này để cho đứa em chơi, không cần cert gì sang hết'
            },
            {
                uid: 4, name: 'LunaFox', tag: null, online: true,
                img: 'assets/img/inspector_npc/portrail/npc_5.png',
                time: '09:05', reactions: [{e:'😅',c:4}],
                text: 'Mình đang cần MUA không phải bán. Main mình bên SANTUY đây, ai có ib mình nhé'
            }
        ]
    },
    /* ===== CHANNEL 2: CAMP APPLY ===== */
    {
        name: 'Camp Apply',
        messages: [
            { date: 'HÔM NAY' },
            {
                uid: 6, name: 'Blake_Shadow', tag: 'applicant', online: false,
                img: 'assets/img/inspector_npc/portrail/npc_7.png',
                time: '07:55', reactions: [{e:'🏕️',c:2}],
                text: 'Xin chào ae SAO-ĐÊM! Mình là <span class="highlight">BLAKE</span>, chuyên đi raid đêm, kinh nghiệm PK nhiều. Ai bảo lãnh cho mình vào camp với?'
            },
            {
                uid: 3, name: 'Silver_Captain', tag: 'mod', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_4.png',
                time: '07:58', reactions: [],
                text: 'Bạn có thể nộp đơn qua official nhé. Nhưng lưu ý cần khai rõ background camp cũ'
            },
            {
                uid: 6, name: 'Blake_Shadow', tag: 'applicant', online: false,
                img: 'assets/img/inspector_npc/portrail/npc_7.png',
                time: '08:01', reactions: [{e:'😐',c:3}],
                text: 'À thì... mình từng ở <span class="highlight red">Delta-9</span> nhưng đã rời rất lâu rồi. Bây giờ muốn tìm camp mới nghiêm túc hơn...'
            },
            {
                uid: 1, name: 'Minhh_Nguyen', tag: 'camp', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_2.png',
                time: '08:04', reactions: [{e:'⛔',c:9}],
                text: '⛔ <span class="highlight red">DELTA-9</span> là kẻ thù của SAO-ĐÊM. Cựu thành viên Delta-9 cũng không được vào theo chính sách mới. Official nên <span class="highlight red">TỪ CHỐI</span> trường hợp này'
            },
            {
                uid: 8, name: 'Vera_Wrench', tag: 'applicant', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_12.png',
                time: '08:45', reactions: [{e:'🔧',c:5}],
                text: 'Xin chào! Mình là <span class="highlight green">VERA</span>, chuyên bảo trì vũ khí. Chị <span class="highlight">Mai</span> giới thiệu mình qua đây. Lý lịch trong sạch, không hình xăm, không liên quan gì Delta-9 hết ạ'
            },
            {
                uid: 5, name: 'VietHero99', tag: 'camp', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_6.png',
                time: '08:50', reactions: [{e:'✅',c:7}],
                text: 'Vera thì mình biết, người tốt lắm. Chị Mai cũng là face trong camp mình. <span class="highlight green">Đáng tin cậy 100%</span>. Official cứ duyệt đi nhé'
            },
            {
                uid: 7, name: 'Reed_Whisper', tag: 'applicant', online: false,
                img: 'assets/img/inspector_npc/portrail/npc_13.png',
                time: '09:10', reactions: [{e:'❓',c:4},{e:'🤥',c:6}],
                text: 'Mình đang bị <span class="highlight red">Delta-9</span> truy đuổi vì biết quá nhiều bí mật của tụi nó. Cần SAO-ĐÊM cho mình trú ẩn gấp! Thật sự không có thời gian giải thích nhiều...'
            },
            {
                uid: 3, name: 'Silver_Captain', tag: 'mod', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_4.png',
                time: '09:13', reactions: [{e:'🕵️',c:8}],
                text: '⚠️ Trường hợp <span class="highlight red">Reed</span>: Bộ phận phân tích hành vi nhận thấy <span class="highlight red">không có dấu hiệu sợ hãi thật sự</span> trong giọng nói. Có khả năng đây là nội gián Delta-9. Official → <span class="highlight red">TỪ CHỐI</span>'
            },
            {
                uid: 0, name: 'Kaito_VN', tag: null, online: true,
                img: 'assets/img/inspector_npc/portrail/npc_1.png',
                time: '09:35', reactions: [{e:'🙌',c:5}],
                text: 'Ae ơi <span class="highlight green">LUNA HAYES</span> này mình quen. Anh Thiện bảo lãnh cho cổ rồi, làm đồ buff rất chăm, không có vấn đề gì hết. Duyệt đi ông official!'
            },
            {
                uid: 4, name: 'LunaFox', tag: 'applicant', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_5.png',
                time: '09:38', reactions: [{e:'💊',c:3}],
                text: 'Xác nhận luôn! Luna chuyên chế <span class="highlight green">buff tăng lực raid đêm</span> rất xịn. Lý lịch sạch hoàn toàn'
            },
            {
                uid: 2, name: 'TradeKing_Ha', tag: null, online: false,
                img: 'assets/img/inspector_npc/portrail/npc_8.png',
                time: '09:55', reactions: [{e:'🤔',c:2}],
                text: 'Còn vụ <span class="highlight red">UNKNOWN DRIFTER</span> nào đó đang đứng ngoài cổng camp kìa ae. Không chịu khai background, chỉ nói "không có thời gian giải thích". Hệ thống còn phát hiện <span class="highlight red">thiết bị GPS lạ</span> trong balo...'
            },
            {
                uid: 3, name: 'Silver_Captain', tag: 'mod', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_4.png',
                time: '10:00', reactions: [{e:'🚫',c:14}],
                text: '🚫 <span class="highlight red">TỪ CHỐI NGAY</span> trường hợp đó. Thiết bị định vị Delta-9 → gián điệp 100%. Official nào xử lý ca này thì đừng thương xót nhé!'
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
    const avatarSrc = msg.img || 'assets/img/inspector_npc/portrail/npc_1.png';
    return `<div class="msg-row" data-uid="${msg.uid}">
        <div class="msg-avatar-col">
            <img class="msg-avatar" src="${avatarSrc}" alt="${msg.name}" onerror="this.src='assets/img/inspector_npc/portrail/npc_1.png'">
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
