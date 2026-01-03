/* =========================================================
   CERT DETAIL – MAIN + TRAIT – FULL FILE (FIX LABEL LOSS)
========================================================= */

(() => {

    /* ==============================
       DATA
    ============================== */

    const CERT_SKILL_DATA = {
        rifle: {
            main: [
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
            traits: [
                {
                    name: "Steady Aim",
                    description: "Tăng độ chính xác vĩnh viễn",
                    img: "https://picsum.photos/40?11"
                },
                {
                    name: "Bullet Control",
                    description: "Giảm độ giật khi bắn",
                    img: "https://picsum.photos/40?12"
                }
            ]
        },

        virus: {
            main: [
                {
                    name: "Virus Spread",
                    description: "Gây debuff cho kẻ địch",
                    img: "https://picsum.photos/50?4"
                },
                {
                    name: "Healing Virus",
                    description: "Hồi máu cho đồng minh",
                    img: "https://picsum.photos/50?5"
                }
            ],
            traits: [
                {
                    name: "Bio Adapt",
                    description: "Tăng hiệu quả virus",
                    img: "https://picsum.photos/40?13"
                }
            ]
        },

        warrior: {
            main: [
                {
                    name: "Shield Bash",
                    description: "Đập khiên vào kẻ địch",
                    img: "https://picsum.photos/50?7"
                }
            ],
            traits: [
                {
                    name: "Iron Body",
                    description: "Tăng phòng thủ vĩnh viễn",
                    img: "https://picsum.photos/40?14"
                }
            ]
        }
    };

    /* ==============================
       OPEN MODAL
    ============================== */

    document.querySelectorAll('.info-card[data-modal="infoD"]').forEach(card => {
        card.addEventListener("click", e => {
            e.stopImmediatePropagation();

            const modal = document.getElementById("infoModal");
            const modalTitle = document.getElementById("modalTitle");
            const modalContent = document.getElementById("modalContent");

            modalTitle.textContent = "🛠️ Chi tiết về Cert";
            modalContent.innerHTML = "";

            const tpl = document.getElementById("tpl-infoD");
            modalContent.appendChild(tpl.content.cloneNode(true));

            initCertSkill(modalContent);

            modal.style.display = "flex";
        });
    });

    /* ==============================
       INIT
    ============================== */

    function initCertSkill(modalContent) {
        const root = modalContent.querySelector("[data-skill-root]");
        if (!root) return;

        const jobItems = root.querySelectorAll(".job-item");
        const skillList = root.querySelector(".skill-list");

        const traitBox = root.querySelector(".skill-trait");
        const traitContent = traitBox.querySelector(".skill-trait-content");

        const detailPanel = modalContent.querySelector(".skill-detail-panel");

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

        /* ---------- TRAIT ---------- */

        const resetTrait = () => {
            traitContent.innerHTML = `
                <div class="skill-trait-placeholder">
                    Skill phụ sẽ hiển thị ở đây
                </div>
            `;
        };

        const renderTraitList = traits => {
            traitContent.innerHTML = "";

            if (!traits || !traits.length) {
                traitContent.innerHTML = `
                    <div class="skill-trait-placeholder">
                        Nghề này không có skill phụ
                    </div>
                `;
                return;
            }

            const list = document.createElement("div");
            list.className = "skill-trait-list";

            traits.forEach(trait => {
                const el = document.createElement("div");
                el.className = "skill-trait-item";
                el.innerHTML = `
                    <img src="${trait.img}">
                    <span>${trait.name}</span>
                `;

                el.addEventListener("click", () => {
                    root.querySelectorAll(".skill-item,.skill-trait-item")
                        .forEach(s => s.classList.remove("active"));
                    el.classList.add("active");
                    renderDetail(trait);
                });

                list.appendChild(el);
            });

            traitContent.appendChild(list);
        };

        resetDetail();
        resetTrait();

        /* ---------- JOB CLICK ---------- */

        jobItems.forEach(job => {
            job.addEventListener("click", () => {
                jobItems.forEach(j => j.classList.remove("active"));
                job.classList.add("active");

                skillList.innerHTML = "";
                resetDetail();
                resetTrait();

                const data = CERT_SKILL_DATA[job.dataset.job];
                if (!data) return;

                /* MAIN SKILL */
                data.main.forEach(skill => {
                    const el = document.createElement("div");
                    el.className = "skill-item";
                    el.innerHTML = `
                        <img src="${skill.img}">
                        <span>${skill.name}</span>
                    `;

                    el.addEventListener("click", () => {
                        root.querySelectorAll(".skill-item,.skill-trait-item")
                            .forEach(s => s.classList.remove("active"));
                        el.classList.add("active");
                        renderDetail(skill);
                    });

                    skillList.appendChild(el);
                });

                /* TRAIT */
                renderTraitList(data.traits);
            });
        });
    }

})();
