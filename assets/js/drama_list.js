/* =============================================
   DRAMA LIST & RENDERING LOGIC
============================================= */

const DRAMA_DATA = [
  {
    id: "INC-001",
    date: "2026.03.20",
    status: "closed",
    title: "Tranh Chấp Lãnh Thổ Vùng Silent Plain",
    desc: "Camp liên minh Alpha tuyên bố chủ quyền Heart Lock Zone tọa độ [SP-442]. Sau 3 ngày căng thẳng và đàm phán thất bại, camp SAO-ĐÊM triển khai lực lượng phòng thủ. Sự việc kết thúc sau khi phía Alpha rút lui.",
    tags: ["PVP", "TERRITORY", "ALLIANCE"],
    participants: "12 PARTIES"
  },
  {
    id: "INC-002",
    date: "2026.03.25",
    status: "closed",
    title: "Nội Bộ: Vụ Mất Đồ Trong Camp Storage",
    desc: "Báo cáo mất tích 47 stack Denatured Alcohol và 1 bộ giáp tier-4 từ kho chung. Sau điều tra nội bộ, xác định nguyên nhân do lỗi hệ thống phân quyền. Đã patched và bồi thường đầy đủ.",
    tags: ["INTERNAL", "STORAGE", "RESOLVED"],
    participants: "3 PARTIES"
  },
  {
    id: "INC-003",
    date: "2026.03.27",
    status: "ongoing",
    title: "Căng Thẳng Với Camp Beta_7 Tại Border Zone",
    desc: "Camp Beta_7 liên tục kill member đơn lẻ của SAO-ĐÊM tại khu vực farming Mount Gray Bear. Chưa rõ có phải tuyên chiến chính thức hay hành động cá nhân. Đang theo dõi và ghi nhận incident reports.",
    tags: ["PVP", "BORDER", "IN PROGRESS"],
    participants: "8 PARTIES"
  },
  {
    id: "INC-004",
    date: "2026.03.28",
    status: "active",
    title: "Cáo Buộc Gian Lận ShelterLand Season 3",
    desc: "Xuất hiện bằng chứng về việc một camp sử dụng exploit để đạt điểm cao bất thường trong ShelterLand. Đang thu thập evidence. Camp SAO-ĐÊM cùng 2 liên minh đang chuẩn bị báo cáo lên GM.",
    tags: ["CHEATING", "SHELTER LAND", "CRITICAL"],
    participants: "15+ PARTIES"
  },
  {
    id: "INC-005",
    date: "2026.03.15",
    status: "closed",
    title: "Sự Kiện: Rò Rỉ Thông Tin Chiến Lược",
    desc: "Kế hoạch raid của camp bị leak ra ngoài trước khi thực hiện. Cuộc điều tra xác định nguồn leak từ một ex-member vừa rời camp. Đã review lại policy chia sẻ thông tin nội bộ.",
    tags: ["ESPIONAGE", "INTERNAL", "RESOLVED"],
    participants: "5 PARTIES"
  },
  {
    id: "INC-006",
    date: "2026.03.10",
    status: "closed",
    title: "Xung Đột Alliance: SAO-ĐÊM vs Delta Force",
    desc: "Tranh cãi về phân chia tài nguyên sau Patrol chung. Delta Force tuyên bố không nhận đủ phần theo thỏa thuận. Sau hòa giải, hai bên thống nhất lại tỉ lệ chia và ký protocol mới.",
    tags: ["ALLIANCE", "RESOURCES", "RESOLVED"],
    participants: "2 PARTIES"
  }
];

function renderDrama(filter = 'all') {
    const list   = document.getElementById('dramaList');
    const empty  = document.getElementById('dramaEmpty');
    const data   = filter === 'all'
        ? DRAMA_DATA
        : DRAMA_DATA.filter(d => d.status === filter);

    if (!list) return;
    list.innerHTML = '';

    if (!data.length) {
        if (empty) empty.style.display = 'block';
        return;
    }
    if (empty) empty.style.display = 'none';

    const activeItems  = data.filter(d => d.status === 'active');
    const ongoingItems = data.filter(d => d.status === 'ongoing');
    const closedItems  = data.filter(d => d.status === 'closed');

    function makeCard(item, index) {
        const statusLabel = { active:'ACTIVE', ongoing:'ONGOING', closed:'CLOSED' }[item.status];
        const statusClass = `status-${item.status}`;
        const delay = index * 0.07;

        return `
        <div class="drama-card" data-status="${item.status}" data-id="${item.id}"
             style="animation-delay:${delay}s">
            <div class="card-severity-dot"></div>
            <div class="card-top">
                <div class="card-meta">
                    <span class="card-episode">${item.id}</span>
                    <span class="card-date">${item.date}</span>
                </div>
                <span class="card-status ${statusClass}">${statusLabel}</span>
            </div>
            <div class="card-title">${item.title}</div>
            <div class="card-desc">${item.desc}</div>
            <div class="card-footer">
                <div class="card-tags">
                    ${item.tags.map(t => `<span class="card-tag">${t}</span>`).join('')}
                </div>
                <span class="card-participants">👥 ${item.participants}</span>
            </div>
            <div class="card-corner"></div>
        </div>`;
    }

    let html = '';
    let idx  = 0;

    if (filter === 'all') {
        if (activeItems.length) {
            html += `<div class="drama-section-label">CRITICAL – REQUIRES ATTENTION</div>`;
            activeItems.forEach(d  => { html += makeCard(d, idx++); });
        }
        if (ongoingItems.length) {
            html += `<div class="drama-section-label">ONGOING – MONITORING</div>`;
            ongoingItems.forEach(d => { html += makeCard(d, idx++); });
        }
        if (closedItems.length) {
            html += `<div class="drama-section-label">ARCHIVED – CLOSED CASES</div>`;
            closedItems.forEach(d  => { html += makeCard(d, idx++); });
        }
    } else {
        data.forEach(d => { html += makeCard(d, idx++); });
    }

    list.innerHTML = html;
}

function updateStats() {
    const totalEl   = document.getElementById('statTotal');
    const activeEl  = document.getElementById('statActive');
    const ongoingEl = document.getElementById('statOngoing');
    const closedEl  = document.getElementById('statClosed');

    if (totalEl)   totalEl.textContent = DRAMA_DATA.length;
    if (activeEl)  activeEl.textContent = DRAMA_DATA.filter(d=>d.status==='active').length;
    if (ongoingEl) ongoingEl.textContent = DRAMA_DATA.filter(d=>d.status==='ongoing').length;
    if (closedEl)  closedEl.textContent = DRAMA_DATA.filter(d=>d.status==='closed').length;
}

/* --- INIT --- */
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    renderDrama('all');

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderDrama(btn.dataset.filter);
        });
    });
});
