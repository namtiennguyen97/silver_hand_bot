const { Jimp } = require('jimp');
const path = require('path');

async function removeWhite(fileName) {
    try {
        const filePath = path.join(__dirname, 'assets', 'img', 'defender', fileName);
        const image = await Jimp.read(filePath);
        const { width, height } = image.bitmap;
        const data = image.bitmap.data;

        // REMOVE WHITE (based on frontline_no_black.png)
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];
            const avg = (r + g + b) / 3;

            // Threshold for white (based on README section 6.3)
            // We check for "neutral" white to avoid making the character's white hair/suit transparent
            const isNeutral = Math.max(r, g, b) - Math.min(r, g, b) < 15;
            
            if (avg > 230 && isNeutral) {
                data[i+3] = 0; // Fully Transparent
            }
            // Optional: Soften edges for pixels close to white
            else if (avg > 210 && isNeutral) {
                const alpha = (255 - avg) * (255 / 45);
                data[i+3] = Math.min(data[i+3], alpha);
            }
        }

        const outPath = path.join(__dirname, 'assets', 'img', 'defender', 'frontline_final.png');
        await image.write(outPath);
        console.log(`White background removed. Final sprite saved to ${outPath}`);

    } catch (err) { console.error(err); }
}

removeWhite('frontline_no_black.png');
