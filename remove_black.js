const { Jimp } = require('jimp');
const path = require('path');

async function removeBlack(fileName) {
    try {
        const filePath = path.join(__dirname, 'assets', 'img', 'defender', fileName);
        const image = await Jimp.read(filePath);
        const { width, height } = image.bitmap;
        const data = image.bitmap.data;

        // ONLY REMOVE BLACK (#000)
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];
            
            // Threshold for deep black (based on README section 6.3)
            if (r < 30 && g < 30 && b < 30) {
                data[i+3] = 0; // Transparent
            }
        }

        const outPath = path.join(__dirname, 'assets', 'img', 'defender', 'frontline_no_black.png');
        await image.write(outPath);
        console.log(`Black background removed. Saved to ${outPath}`);

    } catch (err) { console.error(err); }
}

removeBlack('frontline_ultimate.png');
