const fs = require("fs");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "..", "ctc-planer.html"), "utf8");
const css = fs.readFileSync(path.join(__dirname, "..", "assets", "css", "ctc.css"), "utf8");
const js = fs.readFileSync(path.join(__dirname, "..", "assets", "js", "ctc.js"), "utf8");

assert(html.includes('id="scoreCalcBtn"'), "toolbar should include Score Calc button");
assert(html.includes('id="scoreCalcModal"'), "page should include score calculator modal");
assert(html.includes('id="ourScoreInput"'), "modal should include our score input");
assert(html.includes('id="enemyScoreInput"'), "modal should include enemy score input");
assert(html.includes('data-score-lang="vi"'), "modal should include Vietnamese language switch");
assert(html.includes('data-score-lang="en"'), "modal should include English language switch");
assert(
    html.indexOf("assets/js/ctc-score-calculator.js") < html.indexOf("assets/js/ctc.js"),
    "score calculator module should load before ctc.js"
);

assert(css.includes(".score-calc-panel"), "score calculator modal should have scoped styles");
assert(css.includes(".btn-score-calc"), "score calculator toolbar button should have scoped styles");

assert(js.includes("openScoreCalcModal"), "ctc.js should open the score calculator modal");
assert(js.includes("analyzeScoreCalculator"), "ctc.js should render score analysis");
assert(js.includes("scoreCalcLanguage"), "ctc.js should track score calculator language");
assert(js.includes("SCORE_CALC_I18N"), "ctc.js should render score calculator text from i18n labels");
assert(js.includes("score-calc-scenario-safe"), "winning scenario card should get safe styling class");
assert(js.includes("score-calc-scenario-danger"), "losing scenario card should get danger styling class");
assert(js.includes("window.CTCScoreCalculator"), "ctc.js should use the calculator module");

assert(css.includes(".score-calc-scenario-safe"), "safe scenario card should have scoped CSS");
assert(css.includes(".score-calc-scenario-danger"), "danger scenario card should have scoped CSS");

console.log("ctc score calculator UI smoke test passed");
