const { Jimp } = require('jimp');
const path = require('path');

async function removeBackground(fileName) {
    try {
        const filePath = path.join(__dirname, 'assets', 'img', 'defender', fileName);
        const image = await Jimp.read(filePath);
        const { width, height } = image.bitmap;
        const data = image.bitmap.data;

        // Process every pixel
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];
            const avg = (r + g + b) / 3;

            // 1. Remove White (Threshold avg > 240)
            if (avg > 240) {
                data[i+3] = 0;
            }
            // 2. Remove Black (Threshold avg < 20)
            else if (avg < 20) {
                data[i+3] = 0;
            }
            // 3. Remove Neutral Grey Halo (Section 6.3 in README)
            else if (Math.max(r, g, b) - Math.min(r, g, b) < 10 && avg > 200) {
                data[i+3] = 0;
            }
        }

        const outPath = path.join(__dirname, 'assets', 'img', 'defender', 'frontline_transparent.png');
        await image.write(outPath);
        console.log(`Background removed. Saved to ${outPath}`);

    } catch (err) { console.error(err); }
}

removeBackground('frontline_ultimate.png');
