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
                    name: "Weapon Mastery",
                    description: "Tăng Damage cơ bản cho bản thân. (Damage Bonus)",
                    img: "assets/img/guide/cert_skills/rifle/weapon_mastery.png"
                },
                {
                    name: "Swift Assault",
                    description: "Thay thế skill nhào lộn mặc định bằng cú lướt xa hơn, mỗi cú lướt hồi phục % số lượng đạn.",
                    img: "assets/img/guide/cert_skills/rifle/swift_assault.png"
                },
                {
                    name: "Infected Hunt",
                    description: "Tăng sát thương mạnh đối với Zombies",
                    img: "assets/img/guide/cert_skills/rifle/infected_hunt.png"
                },
                {
                    name: "Practice Makes Perfect",
                    description: "Tăng chỉ số chuẩn xác (Accuracy) và (Misdirection) khi cầm vũ khí.",
                    img: "assets/img/guide/cert_skills/rifle/practice_makes_perfect.png"
                },
                {
                    name: "Break the Surface",
                    description: "Tăng Damage khi cầm vũ khí, và sẽ tăng dần nếu bắn liên tục.",
                    img: "assets/img/guide/cert_skills/rifle/break_the_surface.png"
                },
                {
                    name: "Suppressive Fire",
                    description: "Tăng tỉ lệ crit khi dùng vũ khí, và tỷ lệ tăng gấp đôi nếu dùng AR.",
                    img: "assets/img/guide/cert_skills/rifle/supressive_fire.png"
                },
                {
                    name: "Simple Loadout",
                    description: "Tăng tốc độ nạp đạn, và tăng tốc độ di chuyển khi bắn.",
                    img: "assets/img/guide/cert_skills/rifle/simple_loadout.png"
                },
                {
                    name: "Crippling Shoot",
                    description: "Tăng damage khi bắn đối phương nhảy/ ngăn không cho Lướt và giảm tốc độ di chuyển của đối phương.",
                    img: "assets/img/guide/cert_skills/rifle/crippling_shoot.png"
                },
                {
                    name: "Quick Hemostasis",
                    description: "Tăng khả năng hồi phục khi sử dụng thuốc hoặc Spore, và giảm thời gian bị trọng thương.",
                    img: "assets/img/guide/cert_skills/rifle/quick_hemostasis.png"
                },
                {
                    name: "Armor-piering Missile",
                    description: "Khi bắn có khả năng loại bỏ chỉ số giáp của đối phương.",
                    img: "assets/img/guide/cert_skills/rifle/armor_piering_missile.png"
                },
                {
                    name: "Special effect shooting",
                    description: "Tăng sát thương của Special Bullet, và giảm thời gian hồi Special Bullet.",
                    img: "assets/img/guide/cert_skills/rifle/special_effect_shooting.png"
                },
                {
                    name: "Headshot Expert",
                    description: "Tăng sát thương headshot khi dùng AR, và tăng sát thương nếu đối phương ở vị trí thấp hơn.",
                    img: "assets/img/guide/cert_skills/rifle/headshot_expert.png"
                },
                {
                    name: "Head-on strike",
                    description: "Giảm chỉ số chuẩn xác (Accuracy) và damage của đối phương nếu bạn gây headshot vào họ.",
                    img: "assets/img/guide/cert_skills/rifle/headshot_expert.png"
                },
                {
                    name: "Reaper",
                    description: "Tăng damage khi bắn Zombies.",
                    img: "assets/img/guide/cert_skills/rifle/reaper.png"
                },
                {
                    name: "Preparedness averts peril",
                    description: "Tăng số lượng đạn tối đa của vũ khí hạng nhẹ và trung.",
                    img: "assets/img/guide/cert_skills/rifle/prepareness_averts_peril.png"
                },
                {
                    name: "Agile hare",
                    description: "Sau khi dùng Lướt- có tỷ lệ reset thời gian hồi chiêu Lướt.",
                    img: "assets/img/guide/cert_skills/rifle/agile_hare.png"
                },
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
