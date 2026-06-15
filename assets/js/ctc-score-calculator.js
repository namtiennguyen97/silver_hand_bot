(function (root, factory) {
    const api = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    }
    root.CTCScoreCalculator = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
    const MAX_SCORE = 10000;
    const STEAL_RATE = 0.2;

    function normalizeScore(value) {
        const num = Number(value);
        if (!Number.isFinite(num)) return 0;
        return Math.max(0, Math.min(MAX_SCORE, num));
    }

    function roundScore(value) {
        return Math.round(Number(value) || 0);
    }

    function breakBase(attackerScore, defenderScore) {
        const attacker = normalizeScore(attackerScore);
        const defender = normalizeScore(defenderScore);
        const steal = roundScore(defender * STEAL_RATE);

        return {
            attacker: roundScore(attacker + steal),
            defender: roundScore(defender - steal),
            steal,
        };
    }

    function getWinner(ourScore, enemyScore) {
        const ourHitsMax = ourScore >= MAX_SCORE;
        const enemyHitsMax = enemyScore >= MAX_SCORE;

        if (ourHitsMax && enemyHitsMax) return "tie-max";
        if (ourHitsMax) return "our";
        if (enemyHitsMax) return "enemy";
        if (ourScore > enemyScore) return "our";
        if (enemyScore > ourScore) return "enemy";
        return "tie";
    }

    function buildScenario(ourScore, enemyScore, firstBreaker) {
        const initial = {
            our: normalizeScore(ourScore),
            enemy: normalizeScore(enemyScore),
        };

        const first = firstBreaker === "our"
            ? breakBase(initial.our, initial.enemy)
            : breakBase(initial.enemy, initial.our);

        const afterFirst = firstBreaker === "our"
            ? { our: first.attacker, enemy: first.defender, steal: first.steal }
            : { our: first.defender, enemy: first.attacker, steal: first.steal };

        const counter = firstBreaker === "our"
            ? breakBase(afterFirst.enemy, afterFirst.our)
            : breakBase(afterFirst.our, afterFirst.enemy);

        const final = firstBreaker === "our"
            ? { our: counter.defender, enemy: counter.attacker, steal: counter.steal }
            : { our: counter.attacker, enemy: counter.defender, steal: counter.steal };

        return {
            firstBreaker,
            initial,
            afterFirst: {
                our: roundScore(afterFirst.our),
                enemy: roundScore(afterFirst.enemy),
                steal: first.steal,
                winner: getWinner(afterFirst.our, afterFirst.enemy),
            },
            final: {
                our: roundScore(final.our),
                enemy: roundScore(final.enemy),
                steal: counter.steal,
                winner: getWinner(final.our, final.enemy),
            },
        };
    }

    function analyzeBaseBreakStrategy(ourScore, enemyScore) {
        const ourFirst = buildScenario(ourScore, enemyScore, "our");
        const enemyFirst = buildScenario(ourScore, enemyScore, "enemy");
        const breakFirstValue = ourFirst.final.our - ourFirst.initial.our;
        const waitCounterValue = enemyFirst.final.our - enemyFirst.initial.our;

        let recommendation = "neutral";
        if (breakFirstValue > waitCounterValue) recommendation = "break-first";
        if (waitCounterValue > breakFirstValue) recommendation = "wait-counter";

        return {
            maxScore: MAX_SCORE,
            stealRate: STEAL_RATE,
            ourFirst,
            enemyFirst,
            breakFirstValue: roundScore(breakFirstValue),
            waitCounterValue: roundScore(waitCounterValue),
            recommendation,
        };
    }

    function formatScore(value) {
        const rounded = roundScore(value);
        return rounded.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    }

    return {
        MAX_SCORE,
        STEAL_RATE,
        analyzeBaseBreakStrategy,
        breakBase,
        formatScore,
        normalizeScore,
    };
});
