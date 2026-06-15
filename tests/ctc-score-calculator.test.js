const assert = require("assert");

const {
    analyzeBaseBreakStrategy,
    breakBase,
    formatScore,
} = require("../assets/js/ctc-score-calculator.js");

const afterOurBreak = breakBase(5000, 5000);
assert.strictEqual(afterOurBreak.steal, 1000, "base break should steal 20% of defender score");
assert.strictEqual(afterOurBreak.attacker, 6000, "attacker should gain the stolen score");
assert.strictEqual(afterOurBreak.defender, 4000, "defender should lose the stolen score");

const analysis = analyzeBaseBreakStrategy(5000, 5000);
assert.strictEqual(
    analysis.ourFirst.final.our,
    4800,
    "if we break first and enemy breaks second, enemy steals from our boosted score"
);
assert.strictEqual(analysis.ourFirst.final.enemy, 5200);
assert.strictEqual(analysis.enemyFirst.final.our, 5200);
assert.strictEqual(analysis.enemyFirst.final.enemy, 4800);
assert.strictEqual(
    analysis.recommendation,
    "wait-counter",
    "equal scores should recommend waiting to counter-break last"
);

const behindAnalysis = analyzeBaseBreakStrategy(2000, 8000);
assert.strictEqual(behindAnalysis.ourFirst.afterFirst.our, 3600);
assert.strictEqual(behindAnalysis.ourFirst.afterFirst.enemy, 6400);
assert.strictEqual(behindAnalysis.ourFirst.final.our, 2880);
assert.strictEqual(behindAnalysis.ourFirst.final.enemy, 7120);
assert.strictEqual(behindAnalysis.enemyFirst.final.our, 3280);
assert.strictEqual(behindAnalysis.enemyFirst.final.enemy, 6720);
assert.strictEqual(
    behindAnalysis.recommendation,
    "wait-counter",
    "when behind, counter-breaking after the enemy should be less bad than breaking first"
);

assert.strictEqual(formatScore(5200), "5,200");
assert.strictEqual(formatScore(666.666), "667");
assert.strictEqual(formatScore(7300.8), "7,301");

console.log("ctc score calculator tests passed");
