const fs = require("fs");
const path = require("path");
const assert = require("assert");

const source = fs.readFileSync(
    path.join(__dirname, "..", "assets", "js", "ctc.js"),
    "utf8"
);

assert(
    source.includes("let activeRosterGroup"),
    "roster modal should keep an active group filter state"
);

assert(
    source.includes("data-roster-group"),
    "roster stat cards should expose their group filter through data-roster-group"
);

assert(
    source.includes("applyRosterGroupFilter"),
    "roster modal should filter players by stat-card group"
);

assert(
    source.includes("rosterStats.addEventListener(\"click\""),
    "roster stats strip should handle clicks on stat cards"
);

console.log("ctc roster filter smoke test passed");
