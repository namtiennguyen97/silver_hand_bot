(function () {
    const calculator = window.CTCScoreCalculator;
    if (!calculator) return;

    const els = {
        title: document.getElementById("scoreCalcTitle"),
        subtitle: document.getElementById("scoreCalcSubtitle"),
        ourScoreLabel: document.getElementById("ourScoreLabel"),
        enemyScoreLabel: document.getElementById("enemyScoreLabel"),
        ourScoreInput: document.getElementById("ourScoreInput"),
        enemyScoreInput: document.getElementById("enemyScoreInput"),
        analyzeBtn: document.getElementById("analyzeScoreBtn"),
        analyzeText: document.getElementById("analyzeScoreText"),
        emptyText: document.getElementById("scoreCalcEmptyText"),
        result: document.getElementById("scoreCalcResult"),
        langButtons: Array.from(document.querySelectorAll("[data-score-lang]")),
    };

    let scoreCalcLanguage = "vi";
    let lastScoreAnalysis = null;

    const SCORE_CALC_I18N = {
        vi: {
            title: "PHÂN TÍCH ĐIỂM BASE",
            subtitle: "Tool tính nhanh phút 20 offensive / defending. Mốc thắng: 10,000. Phá base sẽ ăn cắp 20% điểm hiện tại của đối thủ.",
            ourScore: "Điểm bên mình",
            enemyScore: "Điểm đối thủ",
            analyze: "Phân tích",
            empty: "Nhập điểm hai đội, rồi phân tích xem nên phá trước hay thủ chờ phản phá sau.",
            missing: "Hãy nhập điểm của cả hai đội trước khi phân tích.",
            recBreakFirst: "Nên cân nhắc phá base trước",
            recWaitCounter: "Nên thủ và chờ phản phá sau",
            recNeutral: "Hai lựa chọn gần như ngang nhau",
            waitBetter: "Chờ phản phá sau tốt hơn khoảng <strong>{score}</strong> điểm cho bên mình.",
            breakBetter: "Phá trước tốt hơn khoảng <strong>{score}</strong> điểm cho bên mình.",
            sameValue: "Hai hướng cho bên mình cùng mức lợi điểm.",
            bothCasesWin: "Bên mình hoàn toàn có thể thắng dù phá trước hay phản phá sau.",
            bothCasesLose: "Bên mình sẽ thua trong cả hai trường hợp phá trước hoặc phản phá sau.",
            caseOneLabel: "Trường hợp 1",
            caseTwoLabel: "Trường hợp 2",
            ourFirstTitle: "Mình phá trước, địch phá sau",
            enemyFirstTitle: "Địch phá trước, mình phá sau",
            firstSteal: "Phá lần 1 lấy cắp <b>{score}</b> điểm.",
            afterFirst: "Sau phá lần 1: mình <b>{our}</b> / địch <b>{enemy}</b>.",
            counterSteal: "Đội phản phá sau lấy cắp <b>{score}</b> điểm.",
            finalOur: "Final mình",
            finalEnemy: "Final địch",
            winnerOur: "Bên mình thắng",
            winnerEnemy: "Đối thủ thắng",
            winnerOurMax: "Bên mình thắng vì đã đạt 10k.",
            winnerEnemyMax: "Đối thủ thắng vì đã đạt 10k.",
            winnerTieMaxReason: "Cả hai đội đã đạt 10k.",
            winnerTieMax: "Cả hai chạm mốc 10k",
            winnerTie: "Đang cân bằng",
        },
        en: {
            title: "BASE SCORE ANALYZER",
            subtitle: "Minute 20 offensive / defending quick calculator. Win target: 10,000. Base break steals 20% of opponent current score.",
            ourScore: "Our score",
            enemyScore: "Enemy score",
            analyze: "Analyze",
            empty: "Enter both scores, then analyze whether we should break first or wait to counter-break.",
            missing: "Please enter both scores before analyzing.",
            recBreakFirst: "Consider breaking base first",
            recWaitCounter: "Defend and wait to counter-break",
            recNeutral: "Both choices are nearly equal",
            waitBetter: "Waiting to counter-break is better for us by about <strong>{score}</strong> points.",
            breakBetter: "Breaking first is better for us by about <strong>{score}</strong> points.",
            sameValue: "Both options give us the same point value.",
            bothCasesWin: "We can win whether we break first or counter-break later.",
            bothCasesLose: "We lose in both cases, whether breaking first or counter-breaking later.",
            caseOneLabel: "Case 1",
            caseTwoLabel: "Case 2",
            ourFirstTitle: "We break first, enemy breaks second",
            enemyFirstTitle: "Enemy breaks first, we break second",
            firstSteal: "First break steals <b>{score}</b> points.",
            afterFirst: "After first break: us <b>{our}</b> / enemy <b>{enemy}</b>.",
            counterSteal: "The counter-break steals <b>{score}</b> points.",
            finalOur: "Final us",
            finalEnemy: "Final enemy",
            winnerOur: "We are win",
            winnerEnemy: "Enemy win",
            winnerOurMax: "We win because we reached 10k.",
            winnerEnemyMax: "Enemy wins because they reached 10k.",
            winnerTieMaxReason: "Both teams reached 10k.",
            winnerTieMax: "Both teams hit 10k",
            winnerTie: "Still tied",
        },
    };

    function scoreText(key, values = {}) {
        const dict = SCORE_CALC_I18N[scoreCalcLanguage] || SCORE_CALC_I18N.vi;
        return (dict[key] || "").replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
    }

    function clampScoreInput(input) {
        const maxScore = calculator.MAX_SCORE || 10000;
        const rawValue = String(input.value || "").trim();
        if (rawValue === "") return;

        const value = Number(rawValue);
        if (!Number.isFinite(value)) {
            input.value = "";
            return;
        }

        if (value > maxScore) input.value = String(maxScore);
        if (value < 0) input.value = "0";
    }

    function scoreWinnerLabel(winner, scoreState = null, maxScore = 10000) {
        if (scoreState) {
            if (winner === "our" && scoreState.our >= maxScore) return scoreText("winnerOurMax");
            if (winner === "enemy" && scoreState.enemy >= maxScore) return scoreText("winnerEnemyMax");
            if (winner === "tie-max") return scoreText("winnerTieMaxReason");
        }
        if (winner === "our") return scoreText("winnerOur");
        if (winner === "enemy") return scoreText("winnerEnemy");
        if (winner === "tie-max") return scoreText("winnerTieMax");
        return scoreText("winnerTie");
    }

    function scenarioToneClass(winner) {
        if (winner === "our") return "score-calc-scenario-safe";
        if (winner === "enemy") return "score-calc-scenario-danger";
        return "score-calc-scenario-neutral";
    }

    function recommendationText(recommendation, analysis = null) {
        const maxScore = calculator.MAX_SCORE || 10000;
        const recommendedScenario = analysis && recommendation === "break-first"
            ? analysis.ourFirst
            : analysis && recommendation === "wait-counter"
                ? analysis.enemyFirst
                : null;

        if (recommendedScenario) {
            const maxWinnerLabel = scoreWinnerLabel(recommendedScenario.final.winner, recommendedScenario.final, maxScore);
            if (maxWinnerLabel !== scoreWinnerLabel(recommendedScenario.final.winner)) return maxWinnerLabel;
        }

        if (recommendation === "break-first") return scoreText("recBreakFirst");
        if (recommendation === "wait-counter") return scoreText("recWaitCounter");
        return scoreText("recNeutral");
    }

    function bothScenariosOurWin(analysis) {
        return analysis
            && analysis.ourFirst.final.winner === "our"
            && analysis.enemyFirst.final.winner === "our";
    }

    function bothScenariosEnemyWin(analysis) {
        return analysis
            && analysis.ourFirst.final.winner === "enemy"
            && analysis.enemyFirst.final.winner === "enemy";
    }

    function buildScenarioHtml(caseLabel, title, scenario, formatter) {
        const maxScore = calculator.MAX_SCORE || 10000;
        const counterLine = scenario.resolvedAt === "after-first"
            ? ""
            : `<div>${scoreText("counterSteal", { score: formatter(scenario.final.steal) })}</div>`;

        return `
            <div class="score-calc-scenario ${scenarioToneClass(scenario.final.winner)}">
                <div class="score-calc-scenario-head">
                    <span class="score-calc-case-label">${caseLabel}</span>
                    <h4>${title}</h4>
                </div>
                <div class="score-calc-lines">
                    <div>${scoreText("firstSteal", { score: formatter(scenario.afterFirst.steal) })}</div>
                    <div>${scoreText("afterFirst", { our: formatter(scenario.afterFirst.our), enemy: formatter(scenario.afterFirst.enemy) })}</div>
                    ${counterLine}
                    <div class="score-calc-score">
                        <span>${scoreText("finalOur")}: ${formatter(scenario.final.our)}</span>
                        <span>${scoreText("finalEnemy")}: ${formatter(scenario.final.enemy)}</span>
                    </div>
                    <div>${scoreWinnerLabel(scenario.final.winner, scenario.final, maxScore)}</div>
                </div>
            </div>
        `;
    }

    function renderScoreAnalysis(analysis) {
        if (!els.result || !analysis) return;

        const format = calculator.formatScore;
        const valueDiff = analysis.waitCounterValue - analysis.breakFirstValue;
        const diffLine = valueDiff > 0
            ? scoreText("waitBetter", { score: format(valueDiff) })
            : valueDiff < 0
                ? scoreText("breakBetter", { score: format(Math.abs(valueDiff)) })
                : scoreText("sameValue");
        const isBothWin = bothScenariosOurWin(analysis);
        const isBothLose = bothScenariosEnemyWin(analysis);
        const summaryToneClass = isBothWin
            ? "score-calc-summary-success"
            : isBothLose
                ? "score-calc-summary-danger"
                : "";
        const summaryHtml = isBothWin
            ? `<div><strong>${scoreText("bothCasesWin")}</strong></div>`
            : isBothLose
                ? `<div><strong>${scoreText("bothCasesLose")}</strong></div>`
                : `
                    <div><strong>${recommendationText(analysis.recommendation, analysis)}</strong></div>
                    <div>${diffLine}</div>
                `;

        els.result.innerHTML = `
            <div class="score-calc-summary ${summaryToneClass}">
                ${summaryHtml}
            </div>
            <div class="score-calc-grid">
                ${buildScenarioHtml(scoreText("caseOneLabel"), scoreText("ourFirstTitle"), analysis.ourFirst, format)}
                ${buildScenarioHtml(scoreText("caseTwoLabel"), scoreText("enemyFirstTitle"), analysis.enemyFirst, format)}
            </div>
        `;
    }

    function analyzeScoreCalculator() {
        [els.ourScoreInput, els.enemyScoreInput].forEach(input => {
            if (input) clampScoreInput(input);
        });

        const ourScore = els.ourScoreInput ? els.ourScoreInput.value : "";
        const enemyScore = els.enemyScoreInput ? els.enemyScoreInput.value : "";
        const hasOurScore = String(ourScore).trim() !== "";
        const hasEnemyScore = String(enemyScore).trim() !== "";

        if (!hasOurScore || !hasEnemyScore) {
            lastScoreAnalysis = null;
            els.result.innerHTML = `<div class="score-calc-warning">${scoreText("missing")}</div>`;
            return;
        }

        lastScoreAnalysis = calculator.analyzeBaseBreakStrategy(ourScore, enemyScore);
        renderScoreAnalysis(lastScoreAnalysis);
    }

    function updateScoreCalcLanguage() {
        if (els.title) {
            els.title.innerHTML = `<i class="fa-solid fa-calculator" style="margin-right:8px;"></i>${scoreText("title")}`;
        }
        if (els.subtitle) els.subtitle.textContent = scoreText("subtitle");
        if (els.ourScoreLabel) els.ourScoreLabel.textContent = scoreText("ourScore");
        if (els.enemyScoreLabel) els.enemyScoreLabel.textContent = scoreText("enemyScore");
        if (els.analyzeText) els.analyzeText.textContent = scoreText("analyze");
        if (els.emptyText && !lastScoreAnalysis) els.emptyText.textContent = scoreText("empty");

        els.langButtons.forEach(btn => {
            btn.classList.toggle("active", btn.dataset.scoreLang === scoreCalcLanguage);
        });

        if (lastScoreAnalysis) renderScoreAnalysis(lastScoreAnalysis);
    }

    if (els.analyzeBtn) {
        els.analyzeBtn.addEventListener("click", analyzeScoreCalculator);
    }

    [els.ourScoreInput, els.enemyScoreInput].forEach(input => {
        if (!input) return;
        input.addEventListener("input", () => clampScoreInput(input));
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") analyzeScoreCalculator();
        });
    });

    els.langButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            scoreCalcLanguage = btn.dataset.scoreLang || "vi";
            updateScoreCalcLanguage();
        });
    });

    updateScoreCalcLanguage();
    if (els.ourScoreInput) els.ourScoreInput.focus();
})();
