const { Jimp } = require('jimp');
const path = require('path');

async function analyzeSprite(fileName) {
    try {
        const filePath = path.join(__dirname, 'assets', 'img', 'defender', fileName);
        const image = await Jimp.read(filePath);
        const { width, height } = image.bitmap;
        console.log(`\n--- Deep Analysis: ${fileName} (${width}x${height}) ---`);

        const rows = 8;
        const rowH = height / rows;
        
        for (let r = 0; r < rows; r++) {
            const startY = Math.floor(r * rowH);
            const endY = Math.floor((r + 1) * rowH);
            const midY = Math.floor((startY + endY) / 2);
            
            let line = "";
            for (let x = 0; x < width; x++) {
                const idx = (width * midY + x) << 2;
                const a = image.bitmap.data[idx+3];
                if (a > 20) { line += "X"; } else { line += "."; }
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
                    if (blocks[i].start - currentGroup[currentGroup.length-1].end < 15) {
                        currentGroup.push(blocks[i]);
                    } else {
                        groups.push(currentGroup);
                        currentGroup = [blocks[i]];
                    }
                }
                groups.push(currentGroup);
            }

            console.log(`Row ${r}: Detected ${groups.length} characters`);
            if (groups.length > 0) {
                const firstX = groups[0][0].start;
                const lastX = groups[groups.length-1][groups[groups.length-1].length-1].end;
                const avgWidth = (lastX - firstX) / (groups.length - 1 || 1);
                console.log(`  -> Range: ${firstX}-${lastX}px (Approx spacing: ${Math.round(avgWidth)}px)`);
            }
        }

    } catch (err) { console.error(`Error:`, err); }
}

async function main() {
    await analyzeSprite('frontline.png');
}

main();
