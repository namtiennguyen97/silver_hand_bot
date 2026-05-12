const { Jimp } = require('jimp');
const path = require('path');

async function analyzeSprite(fileName) {
    try {
        const filePath = path.join(__dirname, 'assets', 'img', 'defender', fileName);
        const image = await Jimp.read(filePath);
        const { width, height } = image.bitmap;
        console.log(`\n--- Analyzing ${fileName} (${width}x${height}) ---`);
        
        // Scan middle of first row (assume first row has characters)
        const scanY = Math.floor(height / 16); // roughly center of first row
        let line = "";
        for (let x = 0; x < width; x++) {
            const idx = (width * scanY + x) << 2;
            const a = image.bitmap.data[idx+3];
            
            // Check for non-transparent pixels (after remove_bg.js)
            if (a > 30) { line += "X"; } else { line += "."; }
        }
        
        let blocks = [];
        let inBlock = false;
        let startX = 0;
        for (let x = 0; x < width; x++) {
            if (line[x] === "X" && !inBlock) { inBlock = true; startX = x; }
            else if (line[x] === "." && inBlock) { inBlock = false; blocks.push({start:startX, end:x-1}); }
        }
        
        // Group close blocks
        let groups = [];
        if (blocks.length > 0) {
            let currentGroup = [blocks[0]];
            for (let i = 1; i < blocks.length; i++) {
                if (blocks[i].start - currentGroup[currentGroup.length-1].end < 20) {
                    currentGroup.push(blocks[i]);
                } else {
                    groups.push(currentGroup);
                    currentGroup = [blocks[i]];
                }
            }
            groups.push(currentGroup);
        }
        
        console.log(`ACTUAL CHARACTER COLUMNS: ${groups.length}`);
        groups.forEach((g, i) => {
            const start = g[0].start;
            const end = g[g.length-1].end;
            console.log(`Char ${i}: x=${start}-${end} (center=${Math.floor((start+end)/2)})`);
        });

    } catch (err) { console.error(`Error analyzing ${fileName}:`, err); }
}

async function main() {
    await analyzeSprite('zombie_tank.png');
    await analyzeSprite('zombie_female.png');
}

main();
