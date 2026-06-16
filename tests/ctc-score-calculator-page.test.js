const fs = require("fs");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "..", "ctc-score-calculator.html"), "utf8");
const pageJs = fs.readFileSync(path.join(__dirname, "..", "assets", "js", "ctc-score-calculator-page.js"), "utf8");

assert(html.includes("CTC Score Calculator"), "standalone score calculator page should exist");
assert(html.includes("Back to CTC Plan"), "standalone page should have a back-to-planner button");
assert(html.includes("window.location.href='ctc-planer.html'"), "back button should return to CTC planner");
assert(!html.includes("window.location.href='index.html'"), "standalone page should not show the home navigation button");
assert(html.includes('id="ourScoreInput"'), "standalone page should include our score input");
assert(html.includes('id="enemyScoreInput"'), "standalone page should include enemy score input");
assert(html.includes('id="scoreCalcResult"'), "standalone page should include result container");
assert(html.includes('data-score-lang="vi"'), "standalone page should include Vietnamese language switch");
assert(html.includes('data-score-lang="en"'), "standalone page should include English language switch");
assert(!html.includes('id="scoreCalcModal"'), "standalone page should not render the calculator as a modal");
assert(
    html.indexOf("assets/js/ctc-score-calculator.js") < html.indexOf("assets/js/ctc-score-calculator-page.js"),
    "calculator module should load before standalone page controller"
);

assert(pageJs.includes("window.CTCScoreCalculator"), "standalone page should use shared score calculator logic");
assert(pageJs.includes("clampScoreInput"), "standalone page inputs should clamp values to the max score");
assert(pageJs.includes('input.addEventListener("input", () => clampScoreInput(input))'), "standalone page inputs should clamp while typing");
assert(pageJs.includes("bothCasesWin"), "standalone page should keep both-cases-win summary");
assert(pageJs.includes("bothCasesLose"), "standalone page should keep both-cases-lose summary");
assert(pageJs.includes("score-calc-case-label"), "standalone page should render scenario case labels");
assert(!pageJs.includes("scoreCalcModal"), "standalone page controller should not depend on modal behavior");

console.log("ctc score calculator standalone page test passed");
