const { Jimp } = require('jimp');
const path = require('path');

async function removeAggressiveFringe(fileName) {
  try {
    const filePath = path.join(__dirname, 'assets', 'img', 'defender', fileName);
    console.log(`[AGGRESSIVE FRINGE REMOVAL] Reading ${filePath}...`);
    const image = await Jimp.read(filePath);
    const { width, height } = image.bitmap;

    let affectedCount = 0;

    // We scan and check for pixels that are "too bright" and "too desaturated"
    // and significantly reduce their alpha.
    image.scan(0, 0, width, height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      const a = this.bitmap.data[idx + 3];

      if (a === 0) return;

      const luminance = (r + g + b) / 3;
      const maxCh = Math.max(r, g, b);
      const minCh = Math.min(r, g, b);
      const saturation = maxCh > 0 ? (maxCh - minCh) / maxCh : 0;

      // Thresholds: 
      // If it's very bright (>150) and very gray (saturation < 0.25), it's likely a white outline.
      // The brighter it is, the more likely it is part of the "glow/fringe" from the white background.
      
      if (luminance > 150 && saturation < 0.25) {
          // Scale alpha down based on brightness. 
          // At 150, maybe keep 50% alpha. At 255, keep 0% alpha.
          const factor = (luminance - 150) / (255 - 150); // 0 to 1
          const newAlpha = Math.floor(a * Math.pow(1 - factor, 1.5)); // use power to make it more aggressive
          this.bitmap.data[idx + 3] = newAlpha;
          affectedCount++;
          
          // Also darken these pixels to make them blend better if they are still visible
          this.bitmap.data[idx + 0] = Math.floor(r * 0.7);
          this.bitmap.data[idx + 1] = Math.floor(g * 0.7);
          this.bitmap.data[idx + 2] = Math.floor(b * 0.7);
      }
      // Special case for even lower luminance outlines (the "baked in" grayish line)
      else if (luminance > 120 && saturation < 0.15) {
          this.bitmap.data[idx + 3] = Math.floor(a * 0.6);
          affectedCount++;
      }
    });

    await image.write(filePath);
    console.log(`[DONE] Aggressively modified ${affectedCount} pixels to remove white halo.`);
    console.log(`[OK] ${fileName} is now much cleaner!`);

  } catch (err) {
    console.error('Error:', err.message);
  }
}

removeAggressiveFringe('zombie_female.png');
