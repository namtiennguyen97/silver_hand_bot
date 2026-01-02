document.addEventListener("DOMContentLoaded", () => {

    /* ===============================
       DATA SKILL – BẠN TÙY Ý MỞ RỘNG
    =============================== */
    const CERT_SKILLS = {
        rifle: [
            {
                name: "Rapid Fire",
                desc: "Tăng tốc độ bắn của súng trường."
            },
            {
                name: "Headshot Boost",
                desc: "Tăng sát thương headshot."
            }
        ],

        virus: [
            {
                name: "Virus Injection",
                desc: "Gây sát thương theo thời gian."
            },
            {
                name: "Healing Mist",
                desc: "Hồi máu cho đồng đội."
            }
        ],

        warrior: [
            {
                name: "Iron Defense",
                desc: "Tăng giáp và HP."
            },
            {
                name: "Heavy Slash",
                desc: "Đòn cận chiến mạnh."
            }
        ]
    };

    /* ===================================
       INIT – GỌI SAU KHI TEMPLATE ĐƯỢC GẮN
    =================================== */
    function initCertDetail(root) {
        if (!root) return;

        const certView   = root.querySelector(".cert-view");
        const skillView  = root.querySelector(".skill-view");
        const jobItems   = root.querySelectorAll(".job-item");
        const backBtn    = root.querySelector(".btn-back");
        const skillList  = root.querySelector(".skill-list");
        const skillDetail= root.querySelector(".skill-detail");

        /* ========= CLICK NGHỀ ========= */
        jobItems.forEach(item => {
            item.addEventListener("click", () => {
                const jobKey = item.dataset.job;
                if (!CERT_SKILLS[jobKey]) return;

                certView.classList.add("hidden");
                skillView.classList.remove("hidden");

                renderSkillList(jobKey);
            });
        });

        /* ========= BACK ========= */
        backBtn.addEventListener("click", () => {
            skillView.classList.add("hidden");
            certView.classList.remove("hidden");

            skillList.innerHTML = "";
            skillDetail.innerHTML =
                `<p class="skill-placeholder">
          👈 Chọn 1 skill để xem chi tiết
        </p>`;
        });

        /* ========= RENDER SKILL ========= */
        function renderSkillList(jobKey) {
            skillList.innerHTML = "";
            skillDetail.innerHTML =
                `<p class="skill-placeholder">
          👈 Chọn 1 skill để xem chi tiết
        </p>`;

            CERT_SKILLS[jobKey].forEach(skill => {
                const el = document.createElement("div");
                el.className = "skill-item";
                el.textContent = skill.name;

                el.addEventListener("click", () => {
                    root.querySelectorAll(".skill-item")
                        .forEach(i => i.classList.remove("active"));
                    el.classList.add("active");

                    skillDetail.innerHTML = `
            <h4 class="skill-name">${skill.name}</h4>
            <p class="skill-desc">${skill.desc}</p>
          `;
                });

                skillList.appendChild(el);
            });
        }
    }

    /* =====================================
       EXPOSE GLOBAL – GỌI SAU KHI INSERT HTML
    ===================================== */
    window.initCertDetail = initCertDetail;

});
