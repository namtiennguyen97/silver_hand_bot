const fs = require("fs");
const path = require("path");
const assert = require("assert");

const js = fs.readFileSync(path.join(__dirname, "..", "assets", "js", "ctc-tutorial.js"), "utf8");

assert(js.includes('getElementById("startTutorialBtn")'), "tutorial button should still be wired");
assert(js.includes("function startTutorial()"), "manual tutorial start helper should exist");
assert(!js.includes("tryStartAutoTutorial"), "CTC tutorial should not auto-start on first visit");
assert(!js.includes('addEventListener("app:loaded"'), "loading completion should not start the CTC tutorial");
assert(!js.includes('localStorage.getItem("sao-dem-ctc-tutorial-done")'), "first-visit storage check should be removed");

console.log("ctc tutorial manual-start test passed");
