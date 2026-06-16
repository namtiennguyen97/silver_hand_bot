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
assert(css.includes("#browseWorkspacesBtn"), "switch workspace button should have highlighted scoped styles");

assert(js.includes("openScoreCalcModal"), "ctc.js should open the score calculator modal");
assert(js.includes("analyzeScoreCalculator"), "ctc.js should render score analysis");
assert(js.includes("clampScoreInput"), "score calculator inputs should clamp values to the max score");
assert(js.includes('input.addEventListener("input", () => clampScoreInput(input))'), "score calculator inputs should clamp while typing");
assert(js.includes("closeScoreCalcBtn.addEventListener(\"click\", closeScoreCalcModal)"), "score calculator should close from its close button");
assert(!js.includes("scoreCalcModal.addEventListener(\"click\""), "score calculator should not close from backdrop clicks");
assert(js.includes("scoreCalcLanguage"), "ctc.js should track score calculator language");
assert(js.includes("SCORE_CALC_I18N"), "ctc.js should render score calculator text from i18n labels");
assert(js.includes("bothCasesWin"), "summary should support the both-cases-win message");
assert(js.includes("bothCasesLose"), "summary should support the both-cases-lose message");
assert(js.includes("caseOneLabel"), "score scenario cards should label the first case");
assert(js.includes("caseTwoLabel"), "score scenario cards should label the second case");
assert(js.includes("score-calc-scenario-safe"), "winning scenario card should get safe styling class");
assert(js.includes("score-calc-scenario-danger"), "losing scenario card should get danger styling class");
assert(js.includes("window.CTCScoreCalculator"), "ctc.js should use the calculator module");

assert(css.includes(".score-calc-scenario-safe"), "safe scenario card should have scoped CSS");
assert(css.includes(".score-calc-scenario-danger"), "danger scenario card should have scoped CSS");
assert(css.includes(".score-calc-summary-success"), "sure-win summary should have success styling");
assert(css.includes(".score-calc-summary-danger"), "sure-lose summary should have danger styling");
assert(css.includes(".score-calc-case-label"), "case labels should have scoped CSS");

console.log("ctc score calculator UI smoke test passed");
