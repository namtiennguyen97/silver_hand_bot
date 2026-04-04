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
            { date: 'HÔM NAY' },
            {
                uid: 0, name: 'Kaito_VN', tag: null, online: true,
                img: 'assets/img/inspector_npc/portrail/npc_1.png',
                time: '08:52', reactions: [{e:'👋',c:4}],
                text: 'Ae ơi camp mở cổng rồi kìa, hôm nay có mấy đứa nhắn mình hỏi xin vào đó'
            },
            {
                uid: 1, name: 'Minhh_Nguyen', tag: 'camp', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_2.png',
                time: '08:55', reactions: [{e:'👀',c:3}],
                text: 'Ừ nghe rồi. Hôm nay official mới xử lý đơn, ae cứ nộp bình thường nhé. Nhưng mà nhớ khai đầy đủ vào nha'
            },
            {
                uid: 5, name: 'VietHero99', tag: null, online: true,
                img: 'assets/img/inspector_npc/portrail/npc_6.png',
                time: '09:05', reactions: [],
                text: 'À mà nhắc ae nhớ: acc từ camp khác mà mua lại thì phải nói thật với official nhé. Khai trung thực thì người ta duyệt chứ không reject đâu'
            },
            {
                uid: 0, name: 'Kaito_VN', tag: null, online: true,
                img: 'assets/img/inspector_npc/portrail/npc_1.png',
                time: '09:33', reactions: [{e:'👍',c:9}],
                text: 'À mà thằng <span class="highlight">ZxPhantom</span> tui biết, nó mới mua acc bên Konoha đó nhưng người thật là VN 100% nha. Acc xin rời Konoha rồi, đừng từ chối nó'
            },
            {
                uid: 1, name: 'Minhh_Nguyen', tag: 'camp', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_2.png',
                time: '09:36', reactions: [{e:'✅',c:5}],
                text: 'Ok noted. Phantom thì ok, người VN mua lại mà khai rõ là được. Official chú ý nhé'
            },
            {
                uid: 4, name: 'LunaFox', tag: null, online: true,
                img: 'assets/img/inspector_npc/portrail/npc_5.png',
                time: '10:02', reactions: [{e:'😅',c:2}],
                text: 'Trời ơi hôm qua thấy tên <span class="highlight red">ZATAN</span> xin vào lại nữa. Người này bị đuổi ra rồi còn cố hả'
            },
            {
                uid: 1, name: 'Minhh_Nguyen', tag: 'camp', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_2.png',
                time: '10:04', reactions: [{e:'😤',c:6}],
                text: 'Zatan bị blacklist rồi, ra vào mấy lần mà lần nào cũng biến mất. Official reject thẳng đi khỏi cần hỏi'
            },
            {
                uid: 6, name: 'Kira_DX', tag: null, online: false,
                img: 'assets/img/inspector_npc/portrail/npc_7.png',
                time: '10:15', reactions: [{e:'⚠️',c:7}],
                text: 'Ae coi chừng mấy tên Astral đang muốn trà trộn vào đó. Tụi nó biết hôm nay mình mở đơn rồi'
            },
            {
                uid: 5, name: 'VietHero99', tag: null, online: true,
                img: 'assets/img/inspector_npc/portrail/npc_6.png',
                time: '10:18', reactions: [{e:'💬',c:4}],
                text: 'Nếu ai hỏi vào mà tự bảo từng ở Astral hay Fortis thì reject thẳng đi khỏi cần suy nghĩ nhiều. Dù bảo rời rồi cũng không ok'
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
                text: '【SELL】 Acc lv<span class="highlight">148</span> | camp <span class="highlight red">Tagalog</span> | cert Sniper | 3 triệu firm. Acc mua lại từ nước ngoài, cần chuyển camp trước khi giao'
            },
            {
                uid: 7, name: 'NightBuyer', tag: 'buyer', online: false,
                img: 'assets/img/inspector_npc/portrail/npc_9.png',
                time: '18:15', reactions: [],
                text: 'ib mình với ông, mình đang tính mua để vào SAO-ĐÊM chơi. Tagalog xin rời được không ông?'
            },
            {
                uid: 2, name: 'TradeKing_Ha', tag: 'seller', online: false,
                img: 'assets/img/inspector_npc/portrail/npc_8.png',
                time: '18:20', reactions: [],
                text: 'Được, mình sẽ xin rời Tagalog trước rồi mới giao acc. Đợi mình xử lý nha'
            },
            { date: 'HÔM QUA' },
            {
                uid: 7, name: 'NightBuyer', tag: 'buyer', online: false,
                img: 'assets/img/inspector_npc/portrail/npc_9.png',
                time: '11:00', reactions: [],
                text: 'Ông ơi deal hôm đó tính sao rồi? Mình đang chờ đó'
            },
            {
                uid: 2, name: 'TradeKing_Ha', tag: 'seller', online: false,
                img: 'assets/img/inspector_npc/portrail/npc_8.png',
                time: '11:30', reactions: [{e:'😞',c:2}],
                text: 'Xin lỗi bro, mình không bán nữa rồi. Mình quyết định giữ lại acc đó chơi tiếp. Deal hủy nha'
            },
            {
                uid: 7, name: 'NightBuyer', tag: 'buyer', online: false,
                img: 'assets/img/inspector_npc/portrail/npc_9.png',
                time: '11:35', reactions: [{e:'😤',c:3}],
                text: 'Vậy thì thôi, mình cũng đang tính chỗ khác rồi. Oke huỷ'
            },
            { date: 'HÔM NAY' },
            {
                uid: 5, name: 'Scam_Report_Bot', tag: 'mod', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_10.png',
                time: '09:00', reactions: [{e:'🚨',c:15},{e:'😱',c:8}],
                text: '🚨 Nhắc lại: Tên <span class="highlight red">Roy</span> hay xưng là <span class="highlight red">Minh Nhật</span> đang lân la hỏi xin vào nhiều camp. Ae cẩn thận, hắn có tiền sử scam acc. Đừng deal gì với hắn hết'
            },
            {
                uid: 0, name: 'Kaito_VN', tag: null, online: true,
                img: 'assets/img/inspector_npc/portrail/npc_1.png',
                time: '09:10', reactions: [{e:'💯',c:8}],
                text: 'Xác nhận, mình từng bị hắn tiếp cận. Kiểu gì cũng tự giới thiệu là Minh Nhật rồi mới nói chuyện. Cứ thấy tên đó là cẩn thận ngay'
            },
            {
                uid: 3, name: 'Silver_Captain', tag: 'mod', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_4.png',
                time: '09:15', reactions: [{e:'🔒',c:6}],
                text: 'Đã ghi nhận. Official hôm nay nếu thấy ai tên <span class="highlight red">Roy hoặc Minh Nhật</span> nộp đơn thì reject ngay nhé. Không cần xem xét thêm'
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
                time: '07:40', reactions: [],
                text: 'Hỏi thăm ae, camp SAO-ĐÊM hôm nay có mở nhận đơn không? Mình muốn xin vào'
            },
            {
                uid: 1, name: 'Minhh_Nguyen', tag: 'camp', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_2.png',
                time: '07:43', reactions: [],
                text: 'Có, nộp đơn qua official hôm nay. Bạn khai đầy đủ background là được'
            },
            {
                uid: 6, name: 'Blake_Shadow', tag: 'applicant', online: false,
                img: 'assets/img/inspector_npc/portrail/npc_7.png',
                time: '07:45', reactions: [{e:'😬',c:2}],
                text: 'Ah thì mình trước có chơi bên Astral một thời gian nhưng thấy không hợp nên bỏ rồi. Giờ muốn tìm camp mới. Vậy có ok không?'
            },
            {
                uid: 1, name: 'Minhh_Nguyen', tag: 'camp', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_2.png',
                time: '07:48', reactions: [{e:'⛔',c:8}],
                text: 'Thật ra Astral là rival của mình nên cựu thành viên bên đó không được vào theo chính sách ae ơi. Dù rời rồi cũng vậy, quy định là quy định'
            },
            {
                uid: 6, name: 'Blake_Shadow', tag: 'applicant', online: false,
                img: 'assets/img/inspector_npc/portrail/npc_7.png',
                time: '07:50', reactions: [],
                text: 'Ờ thôi vậy. Thấy buồn nhưng hiểu rồi'
            },
            {
                uid: 8, name: 'Vera_Kim', tag: 'applicant', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_12.png',
                time: '08:30', reactions: [{e:'🔧',c:3}],
                text: 'Hi ae, mình là Vera. Chị Mai giới thiệu mình qua đây xin vào camp. Chị nói cứ nhắn đây hỏi thêm nếu cần'
            },
            {
                uid: 5, name: 'VietHero99', tag: 'camp', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_6.png',
                time: '08:32', reactions: [{e:'✅',c:7}],
                text: 'Vera thì mình biết nhé, người tốt lắm. Chị Mai cũng là người trong camp mình quen. Cứ duyệt đi official ơi'
            },
            {
                uid: 4, name: 'LunaFox', tag: null, online: true,
                img: 'assets/img/inspector_npc/portrail/npc_5.png',
                time: '08:45', reactions: [{e:'😊',c:4}],
                text: 'Vera chuyên sửa súng và bảo trì thiết bị cho anh em, cực kỳ hữu ích đó. Mình từng nhờ cổ fix đồ nhiều lần rồi'
            },
            {
                uid: 0, name: 'Kaito_VN', tag: null, online: true,
                img: 'assets/img/inspector_npc/portrail/npc_1.png',
                time: '09:38', reactions: [{e:'🙌',c:6}],
                text: 'Ae ơi <span class="highlight green">LunaHayes</span> này mình quen. Anh Thiện bên camp nhờ mình nhắn giúp: ảnh bảo lãnh cho cổ vào nhé. Cổ chuyên pha buff raid đêm, siêng lắm'
            },
            {
                uid: 4, name: 'LunaFox', tag: 'applicant', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_5.png',
                time: '09:42', reactions: [{e:'💊',c:3}],
                text: 'Mình xác nhận Luna đó nha, cổ làm buff xịn lắm. Lý lịch không có gì đáng ngại, cứ yên tâm'
            },
            {
                uid: 1, name: 'Minhh_Nguyen', tag: 'camp', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_2.png',
                time: '10:30', reactions: [{e:'🤔',c:4}],
                text: 'Còn có tên <span class="highlight red">DrifterX</span> đang đứng ngoài cổng, không chịu khai gì hết. Hỏi background thì nói không cần phải giải thích. Ae thấy lạ không?'
            },
            {
                uid: 3, name: 'Silver_Captain', tag: 'mod', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_4.png',
                time: '10:33', reactions: [{e:'🚫',c:12}],
                text: 'Không khai thì không vào. Đơn giản vậy thôi. Official cứ yêu cầu khai đủ, ai không khai thì reject'
            },
            {
                uid: 7, name: 'Reed_W', tag: 'applicant', online: false,
                img: 'assets/img/inspector_npc/portrail/npc_13.png',
                time: '10:50', reactions: [{e:'❓',c:5}],
                text: 'Ae ơi mình cần vào camp gấp, mình bị người ta kiếm chuyện vì mình biết chuyện nội bộ của bên đó. Không tiện nói nhiều ở đây'
            },
            {
                uid: 0, name: 'Kaito_VN', tag: null, online: true,
                img: 'assets/img/inspector_npc/portrail/npc_1.png',
                time: '10:53', reactions: [{e:'🤨',c:6}],
                text: 'Ủa mà bên đó là camp nào vậy? Nói rõ đi ông, mình cũng cần biết context chứ'
            },
            {
                uid: 7, name: 'Reed_W', tag: 'applicant', online: false,
                img: 'assets/img/inspector_npc/portrail/npc_13.png',
                time: '10:55', reactions: [],
                text: 'Thôi kệ, ở đây nói không tiện. Mình lên gặp official trực tiếp vậy'
            },
            {
                uid: 1, name: 'Minhh_Nguyen', tag: 'camp', online: true,
                img: 'assets/img/inspector_npc/portrail/npc_2.png',
                time: '10:58', reactions: [{e:'😒',c:4}],
                text: 'Cái kiểu giấu thông tin mà đòi vào camp này mình không thích. Official tự cân nhắc nha, mình không bảo lãnh cho trường hợp này đâu'
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
