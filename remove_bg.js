const { Jimp } = require('jimp');
const path = require('path');

async function processImage(fileName, backgroundType = 'white') {
  try {
    const filePath = path.join(__dirname, 'assets', 'img', 'defender', fileName);
    console.log(`Processing ${filePath} - TARGETING ${backgroundType.toUpperCase()} BACKGROUND...`);
    const image = await Jimp.read(filePath);
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      if (backgroundType === 'white') {
        // Target WHITE background (using average luminance)
        const avg = (r + g + b) / 3;
        if (avg > 210) {
          const diff = Math.max(r, g, b) - Math.min(r, g, b);
          if (diff < 15) { // Only target neutral grey/white (the halo)
            // Pixels from 210 to 255 will fade out
            const alpha = Math.max(0, (255 - avg) * (255 / 45));
            this.bitmap.data[idx + 3] = Math.min(this.bitmap.data[idx + 3], alpha);
          }
        }
      } else if (backgroundType === 'black') {
        // Target BLACK background (using average luminance)
        const avg = (r + g + b) / 3;
        if (avg < 15) { // Very conservative threshold to only remove pure black
          // Sharp transition to transparency
          const newAlpha = Math.max(0, avg * (255 / 15));
          this.bitmap.data[idx + 3] = Math.min(this.bitmap.data[idx + 3], newAlpha);
        }
      }
    });

    await image.write(filePath);
    console.log(`Successfully removed ${backgroundType.toUpperCase()} background from ${fileName}`);
  } catch (err) {
    console.error(`Error processing ${fileName}:`, err);
  }
}

async function main() {
  await processImage('zombie.png', 'black');
  await processImage('zombie_tank.png', 'black');
  await processImage('zombie_female.png', 'black');
  await processImage('zombie_boss.png', 'white');
}

main();
