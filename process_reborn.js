const { Jimp } = require('jimp');
const path = require('path');

async function processRebornSprite(inputPath) {
    try {
        const image = await Jimp.read(inputPath);
        const { width, height } = image.bitmap;
        const data = image.bitmap.data;

        // Smart pixel detection (ignore white background and black grid lines/text)
        function isPixel(x, y) {
            const idx = (y * width + x) << 2;
            const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
            // If NOT white AND NOT black (grid lines) AND alpha > 30
            // Actually, just ignore white (> 240) and pure black grid lines (< 30)
            const isWhite = r > 240 && g > 240 && b > 240;
            const isBlackGrid = r < 50 && g < 50 && b < 50; 
            return a > 30 && !isWhite && !isBlackGrid;
        }

        const visited = new Uint8Array(width * height);
        const boxes = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x);
                if (visited[idx]) continue;
                if (isPixel(x, y)) {
                    let minX = x, maxX = x, minY = y, maxY = y;
                    const queue = [[x, y]];
                    visited[idx] = 1;
                    while (queue.length > 0) {
                        const [cx, cy] = queue.shift();
                        if (cx < minX) minX = cx; if (cx > maxX) maxX = cx;
                        if (cy < minY) minY = cy; if (cy > maxY) maxY = cy;
                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                const nx = cx + dx, ny = cy + dy;
                                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                    const nIdx = ny * width + nx;
                                    if (!visited[nIdx] && isPixel(nx, ny)) {
                                        visited[nIdx] = 1; queue.push([nx, ny]);
                                    }
                                }
                            }
                        }
                    }
                    // Filter out small artifacts or text labels
                    if ((maxX - minX > 20) && (maxY - minY > 20)) {
                        boxes.push({x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1});
                    }
                }
            }
        }

        // Group into 10 rows
        boxes.sort((a, b) => (a.y + a.h/2) - (b.y + b.h/2));
        let rows = [];
        if (boxes.length > 0) {
            let currentRow = [boxes[0]];
            for (let i = 1; i < boxes.length; i++) {
                if (Math.abs((boxes[i].y + boxes[i].h/2) - (currentRow[currentRow.length-1].y + currentRow[currentRow.length-1].h/2)) < 60) {
                    currentRow.push(boxes[i]);
                } else {
                    currentRow.sort((a, b) => a.x - b.x);
                    rows.push(currentRow);
                    currentRow = [boxes[i]];
                }
            }
            currentRow.sort((a, b) => a.x - b.x);
            rows.push(currentRow);
        }

        console.log(`Detected ${rows.length} rows.`);

        const cellS = 128;
        const outCols = 8;
        const outRows = 10;
        const outImg = new Jimp({ width: outCols * cellS, height: outRows * cellS, color: 0x000000FF }); // Solid Black

        for (let r = 0; r < rows.length && r < outRows; r++) {
            for (let c = 0; c < rows[r].length && c < outCols; c++) {
                const b = rows[r][c];
                const frame = image.clone().crop({ x: b.x, y: b.y, w: b.w, h: b.h });
                const posX = c * cellS + (cellS - b.w) / 2;
                const posY = r * cellS + (cellS - b.h) / 2;
                outImg.composite(frame, posX, posY);
            }
        }

        const outPath = path.join(__dirname, 'assets', 'img', 'defender', 'frontline_reborn.png');
        await outImg.write(outPath);
        console.log(`Reborn standardized sprite sheet saved to ${outPath}`);

    } catch (err) { console.error(err); }
}

const input = 'C:\\Users\\nam.nguyentien\\.gemini\\antigravity\\brain\\ca2f9f05-74f2-4165-a7d3-92e76b434017\\frontline_reborn_sprite_1778745686973.png';
processRebornSprite(input);
