const fs = require("fs");
const path = require("path");
const assert = require("assert");

const cssDir = path.join(__dirname, "..", "assets", "css");
const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith(".css"));

const badRefs = [];

for (const file of cssFiles) {
    const fullPath = path.join(cssDir, file);
    const source = fs.readFileSync(fullPath, "utf8");
    const matches = source.match(/url\((['"]?)assets\/img\//g) || [];
    for (const match of matches) {
        badRefs.push(`${file}: ${match}`);
    }
}

assert.deepStrictEqual(
    badRefs,
    [],
    "CSS files under assets/css must use /assets/img/... or ../img/... so URLs do not resolve under assets/css/"
);

console.log("css asset path tests passed");
