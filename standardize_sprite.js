const { Jimp } = require('jimp');
const path = require('path');

async function normalizeSprite(fileName) {
    try {
        const filePath = path.join(__dirname, 'assets', 'img', 'defender', fileName);
        const image = await Jimp.read(filePath);
        const { width, height } = image.bitmap;
        const data = image.bitmap.data;

        // Step 1: Find Row Boundaries
        let rowBounds = [];
        let inRow = false, rowStart = 0;
        for (let y = 0; y < height; y++) {
            let rowHasPixels = false;
            for (let x = 0; x < width; x += 5) { if (data[(y * width + x) << 2 | 3] > 30) { rowHasPixels = true; break; } }
            if (rowHasPixels && !inRow) { inRow = true; rowStart = y; }
            else if (!rowHasPixels && inRow) { inRow = false; rowBounds.push({ start: rowStart, end: y - 1 }); }
        }
        if (inRow) rowBounds.push({ start: rowStart, end: height - 1 });

        // Step 2: Extract and Split Clusters in each row
        const cellS = 128;
        const outImg = new Jimp({ width: 12 * cellS, height: rowBounds.length * cellS, color: 0x000000FF });

        for (let r = 0; r < rowBounds.length; r++) {
            const rb = rowBounds[r];
            let rowClusters = [];
            let inCluster = false, clusterStart = 0;

            for (let x = 0; x < width; x++) {
                let colHasPixels = false;
                for (let y = rb.start; y <= rb.end; y++) { if (data[(y * width + x) << 2 | 3] > 30) { colHasPixels = true; break; } }

                if (colHasPixels && !inCluster) { inCluster = true; clusterStart = x; }
                else if (!colHasPixels && inCluster) {
                    // 10px gap check
                    let isGap = true;
                    for (let k = 1; k < 10; k++) {
                        if (x + k < width) {
                            let fHP = false;
                            for (let y = rb.start; y <= rb.end; y++) { if (data[(y * width + (x+k)) << 2 | 3] > 30) { fHP = true; break; } }
                            if (fHP) { isGap = false; break; }
                        }
                    }
                    if (isGap) {
                        inCluster = false;
                        const clusterEnd = x - 1;
                        const clusterW = clusterEnd - clusterStart + 1;

                        // Split if too wide (Assume approx 100-110px per char)
                        const numChars = Math.max(1, Math.round(clusterW / 105));
                        const subW = clusterW / numChars;

                        for (let i = 0; i < numChars; i++) {
                            const sx = Math.floor(clusterStart + i * subW);
                            const sw = Math.floor(subW);
                            
                            // Find precise vertical bounds for this sub-frame
                            let minY = rb.end, maxY = rb.start;
                            for (let y = rb.start; y <= rb.end; y++) {
                                for (let xSub = sx; xSub < sx + sw; xSub++) {
                                    if (data[(y * width + xSub) << 2 | 3] > 30) {
                                        if (y < minY) minY = y; if (y > maxY) maxY = y;
                                    }
                                }
                            }
                            if (maxY >= minY) {
                                rowClusters.push({ x: sx, y: minY, w: sw, h: maxY - minY + 1 });
                            }
                        }
                    }
                }
            }

            // Draw to standardized sheet
            for (let c = 0; c < rowClusters.length && c < 12; c++) {
                const b = rowClusters[c];
                const frame = image.clone().crop({ x: b.x, y: b.y, w: b.w, h: b.h });
                const posX = c * cellS + (cellS - b.w) / 2;
                const posY = r * cellS + (cellS - b.h) / 2;
                outImg.composite(frame, posX, posY);
            }
        }

        const outPath = path.join(__dirname, 'assets', 'img', 'defender', 'frontline_standard.png');
        await outImg.write(outPath);
        console.log(`Deep-cleaned standardized sprite sheet saved to ${outPath}`);

    } catch (err) { console.error(err); }
}

normalizeSprite('frontline.png');
