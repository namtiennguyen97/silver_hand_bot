const fs = require("fs");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "..", "ctc-planer.html"), "utf8");
const css = fs.readFileSync(path.join(__dirname, "..", "assets", "css", "ctc.css"), "utf8");
const js = fs.readFileSync(path.join(__dirname, "..", "assets", "js", "ctc.js"), "utf8");

const menuMatch = html.match(/<div class="more-options-menu" id="moreOptionsMenu">([\s\S]*?)<\/div>\s*<\/div>/);
assert(menuMatch, "toolbar should include a More Options dropdown menu");

const menuHtml = menuMatch[1];
["smartSplitBtn", "randomSplitBtn", "sortPowerBtn", "sortNameBtn"].forEach((id) => {
    assert(menuHtml.includes(`id="${id}"`), `${id} should live inside the More Options menu`);
});

assert(
    !html.includes('id="mobileSmartSplitBtn"'),
    "toolbar should not keep duplicate mobile-only smart split button IDs"
);

assert(
    css.includes(".more-options-wrap {\n    position: relative;\n    display: inline-flex;"),
    "More Options should be visible by default on desktop"
);

assert(
    css.includes(".mobile-menu-only"),
    "mobile-only dropdown items should be scoped separately"
);

assert(
    js.includes("bindMoreOption"),
    "menu actions should close the dropdown after running"
);

console.log("ctc toolbar more menu smoke test passed");
