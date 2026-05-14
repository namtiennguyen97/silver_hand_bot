const { Jimp } = require('jimp');
const path = require('path');

async function findBoundingBoxes(fileName) {
    try {
        const filePath = path.join(__dirname, 'assets', 'img', 'defender', fileName);
        const image = await Jimp.read(filePath);
        const { width, height } = image.bitmap;
        console.log(`Analyzing ${fileName} (${width}x${height})`);

        // Scan the whole image to find all clusters
        // We'll use a simple flood fill or connected components to find clusters
        const visited = new Uint8Array(width * height);
        const boxes = [];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x);
                if (visited[idx]) continue;

                const pixelIdx = idx << 2;
                const a = image.bitmap.data[pixelIdx + 3];
                
                if (a > 30) {
                    // Start of a new cluster
                    let minX = x, maxX = x, minY = y, maxY = y;
                    const queue = [[x, y]];
                    visited[idx] = 1;

                    while (queue.length > 0) {
                        const [cx, cy] = queue.shift();
                        if (cx < minX) minX = cx;
                        if (cx > maxX) maxX = cx;
                        if (cy < minY) minY = cy;
                        if (cy > maxY) maxY = cy;

                        // Check 8 neighbors
                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                const nx = cx + dx;
                                const ny = cy + dy;
                                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                    const nIdx = ny * width + nx;
                                    if (!visited[nIdx]) {
                                        const nPixelIdx = nIdx << 2;
                                        if (image.bitmap.data[nPixelIdx + 3] > 30) {
                                            visited[nIdx] = 1;
                                            queue.push([nx, ny]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    // Only keep boxes of a certain size to filter out noise
                    if ((maxX - minX > 10) && (maxY - minY > 10)) {
                        boxes.push({minX, maxX, minY, maxY, width: maxX - minX + 1, height: maxY - minY + 1});
                    }
                }
            }
        }

        // Sort boxes by Y then X
        boxes.sort((a, b) => {
            if (Math.abs(a.minY - b.minY) > 20) return a.minY - b.minY;
            return a.minX - b.minX;
        });

        console.log(`Found ${boxes.length} clusters`);
        boxes.forEach((box, i) => {
            if (i < 24) { // Only show first 2 rows worth
                console.log(`Box ${i}: x=${box.minX}-${box.maxX}, y=${box.minY}-${box.maxY} (w=${box.width}, h=${box.height})`);
            }
        });

    } catch (err) { console.error(err); }
}

findBoundingBoxes('frontline.png');
