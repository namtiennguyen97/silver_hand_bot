const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function generateAtlas(fileName) {
    try {
        const filePath = path.join(__dirname, 'assets', 'img', 'defender', fileName);
        const image = await Jimp.read(filePath);
        const { width, height } = image.bitmap;
        const data = image.bitmap.data;

        const visited = new Uint8Array(width * height);
        const boxes = [];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x);
                if (visited[idx]) continue;
                if (data[idx << 2 | 3] > 30) {
                    let minX = x, maxX = x, minY = y, maxY = y;
                    const queue = [[x, y]];
                    visited[idx] = 1;

                    while (queue.length > 0) {
                        const [cx, cy] = queue.shift();
                        if (cx < minX) minX = cx; if (cx > maxX) maxX = cx;
                        if (cy < minY) minY = cy; if (cy > maxY) maxY = cy;

                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                const nx = cx + dx;
                                const ny = cy + dy;
                                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                    const nIdx = ny * width + nx;
                                    if (!visited[nIdx] && data[nIdx << 2 | 3] > 30) {
                                        visited[nIdx] = 1;
                                        queue.push([nx, ny]);
                                    }
                                }
                            }
                        }
                    }
                    if ((maxX - minX > 10) && (maxY - minY > 10)) {
                        boxes.push({x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1});
                    }
                }
            }
        }

        // Group into rows
        boxes.sort((a, b) => (a.y + a.h/2) - (b.y + b.h/2));
        
        let rows = [];
        if (boxes.length > 0) {
            let currentRow = [boxes[0]];
            for (let i = 1; i < boxes.length; i++) {
                const prev = currentRow[currentRow.length - 1];
                const curr = boxes[i];
                // If the vertical centers are close, they are in the same row
                if (Math.abs((curr.y + curr.h/2) - (prev.y + prev.h/2)) < 30) {
                    currentRow.push(curr);
                } else {
                    currentRow.sort((a, b) => a.x - b.x);
                    rows.push(currentRow);
                    currentRow = [curr];
                }
            }
            currentRow.sort((a, b) => a.x - b.x);
            rows.push(currentRow);
        }

        const output = {
            fileName,
            width,
            height,
            rows: rows.map(r => r.map(b => ({x: b.x, y: b.y, w: b.w, h: b.h})))
        };

        fs.writeFileSync(path.join(__dirname, 'frontline_atlas.json'), JSON.stringify(output, null, 2));
        console.log(`Generated atlas with ${rows.length} rows and ${boxes.length} frames.`);

    } catch (err) { console.error(err); }
}

generateAtlas('frontline.png');
