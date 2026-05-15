const { Jimp } = require('jimp');
const path = require('path');

async function analyzePlayerFrames(fileName) {
    try {
        const filePath = path.join('c:', 'Users', 'nam.nguyentien', 'PhpstormProjects', 'silverhandchatbot', 'assets', 'img', 'defender', fileName);
        const image = await Jimp.read(filePath);
        const { width, height } = image.bitmap;
        console.log(`\n--- Frame Analysis: ${fileName} (${width}x${height}) ---`);

        const cols = 3;
        const rows = 2;
        const fw = width / cols;
        const fh = height / rows;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
                const startX = c * fw;
                const startY = r * fh;

                for (let y = 0; y < fh; y++) {
                    for (let x = 0; x < fw; x++) {
                        const idx = (width * Math.floor(startY + y) + Math.floor(startX + x)) << 2;
                        if (image.bitmap.data[idx+3] > 20) {
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                        }
                    }
                }
                
                if (minX === Infinity) {
                    console.log(`Frame [${c},${r}]: Empty`);
                } else {
                    const contentW = maxX - minX;
                    const contentCenterX = minX + contentW / 2;
                    const offsetX = contentCenterX - fw / 2;
                    console.log(`Frame [${c},${r}]: BBox(${Math.round(minX)}, ${Math.round(minY)}, ${Math.round(contentW)}, ${Math.round(maxY-minY)}) | CenterX: ${Math.round(contentCenterX)} | OffsetX: ${Math.round(offsetX)}px`);
                }
            }
        }

    } catch (err) { console.error(`Error:`, err); }
}

analyzePlayerFrames('player_thaybach.png');
