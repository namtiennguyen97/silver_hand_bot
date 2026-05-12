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
        // Target WHITE background (RGB all very high)
        if (r > 230 && g > 230 && b > 230) {
          const avg = (r + g + b) / 3;
          this.bitmap.data[idx + 3] = Math.max(0, (255 - avg) * (255 / 25));
        }
      } else if (backgroundType === 'black') {
        // Target BLACK background (RGB all very low)
        if (r < 25 && g < 25 && b < 25) {
          const avg = (r + g + b) / 3;
          // Smooth alpha: pixels between 0-25 will fade in
          this.bitmap.data[idx + 3] = Math.max(0, avg * (255 / 25));
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
}

main();
