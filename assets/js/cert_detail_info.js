/* =========================================================
   CERT DETAIL – FULL STANDALONE FILE
   COPY & RUN – NO TOOLTIP – RENDER TO DETAIL PANEL
========================================================= */

(() => {
    /* ==============================
       SKILL DATA
    ============================== */
    const CERT_SKILL_DATA = {
        rifle: [
            {
                name: "Rapid Shot",
                description: "Bắn nhanh, sát thương cao",
                img: "https://picsum.photos/50?1"
            },
            {
                name: "Piercing Bullet",
                description: "Đạn xuyên giáp",
                img: "https://picsum.photos/50?2"
            },
            {
                name: "Headshot",
                description: "Gây sát thương chí mạng",
                img: "https://picsum.photos/50?3"
            }
        ],
        virus: [
            {
                name: "Virus Spread",
                description: "Gây debuff cho kẻ địch",
                img: "https://picsum.photos/50?4"
            },
            {
                name: "Healing Virus",
                description: "Hồi máu cho đồng minh",
                img: "https://picsum.photos/50?5"
            },
            {
                name: "Toxic Cloud",
                description: "Gây sát thương theo thời gian",
                img: "https://picsum.photos/50?6"
            }
        ],
        warrior: [
            {
                name: "Shield Bash",
                description: "Đập khiên vào kẻ địch",
                img: "https://picsum.photos/50?7"
            },
            {
                name: "Power Strike",
                description: "Tấn công mạnh",
                img: "https://picsum.photos/50?8"
            },
            {
                name: "Battle Cry",
                description: "Buff đồng minh xung quanh",
                img: "https://picsum.photos/50?9"
            }
        ]
    };

    /* =========================================================
       OPEN MODAL + INIT (OVERRIDE infoD)
    ========================================================= */
    document.querySelectorAll('.info-card[data-modal="infoD"]').forEach(card => {
        card.addEventListener("click", e => {
            e.stopImmediatePropagation(); // 🔥 chặn script inline

            // dùng modal có sẵn (KHÔNG khai báo lại)
            const modal = document.getElementById("infoModal");
            const modalTitle = document.getElementById("modalTitle");
            const modalContent = document.getElementById("modalContent");

            modalTitle.textContent = "🛠️ Chi tiết về Cert";
            modalContent.innerHTML = "";

            const tpl = document.getElementById("tpl-infoD");
            modalContent.appendChild(tpl.content.cloneNode(true));

            const root = modalContent.querySelector("[data-skill-root]");
            initCertSkill(root, modalContent);

            modal.style.display = "flex";
        });
    });

    /* =========================================================
       INIT CERT SKILL – NO TOOLTIP
    ========================================================= */
    function initCertSkill(root, modalContent) {
        if (!root || !modalContent) return;

        const jobItems = root.querySelectorAll(".job-item");
        const skillList = root.querySelector(".skill-list");
        const detailPanel = modalContent.querySelector(".skill-detail-panel");

        if (!skillList || !detailPanel) return;

        /* ---------- DETAIL ---------- */
        const resetDetail = () => {
            detailPanel.innerHTML = `
                <div class="skill-detail-placeholder">
                    Chọn một skill để xem thông tin
                </div>
            `;
        };

        const renderDetail = skill => {
            detailPanel.innerHTML = `
                <div class="skill-title">${skill.name}</div>
                <div class="skill-desc">${skill.description}</div>
            `;
        };

        resetDetail();

        /* ---------- JOB CLICK ---------- */
        jobItems.forEach(job => {
            job.addEventListener("click", () => {
                jobItems.forEach(j => j.classList.remove("active"));
                job.classList.add("active");

                skillList.innerHTML = "";
                resetDetail();

                const skills = CERT_SKILL_DATA[job.dataset.job] || [];

                skills.forEach(skill => {
                    const el = document.createElement("div");
                    el.className = "skill-item";
                    el.innerHTML = `
                        <img src="${skill.img}">
                        <span>${skill.name}</span>
                    `;

                    el.addEventListener("click", () => {
                        skillList.querySelectorAll(".skill-item")
                            .forEach(s => s.classList.remove("active"));

                        el.classList.add("active");
                        renderDetail(skill);
                    });

                    skillList.appendChild(el);
                });
            });
        });
    }
})();
