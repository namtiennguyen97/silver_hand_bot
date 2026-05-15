const { Jimp } = require('jimp');
const path = require('path');

async function processImage(fileName, backgroundType = 'white') {
  try {
    const filePath = path.join(__dirname, 'assets', 'img', 'defender', fileName);
    console.log(`Processing ${filePath} - TARGETING ${backgroundType.toUpperCase()} BACKGROUND (SOLID MODE)...`);
    const image = await Jimp.read(filePath);
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      if (backgroundType === 'white') {
        // Strict WHITE background removal (Hard Threshold)
        const avg = (r + g + b) / 3;
        const diff = Math.max(r, g, b) - Math.min(r, g, b);
        
        // Hard threshold: Only remove if very bright AND neutral (pure white/grey)
        // This prevents semi-transparency on character pixels
        if (avg > 248 && diff < 10) {
          this.bitmap.data[idx + 3] = 0;
        }
      } else if (backgroundType === 'black') {
        // Strict BLACK background removal
        const avg = (r + g + b) / 3;
        const diff = Math.max(r, g, b) - Math.min(r, g, b);

        if (avg < 8 && diff < 8) {
          this.bitmap.data[idx + 3] = 0;
        }
      }
    });

    await image.write(filePath);
    console.log(`Successfully processed ${fileName} with SOLID mode.`);
  } catch (err) {
    console.error(`Error processing ${fileName}:`, err);
  }
}

async function main() {
  // Processing all hero and zombie types with the new SOLID logic
  await processImage('zombie.png', 'white');
  await processImage('zombie_female.png', 'white');
  await processImage('zombie_tank.png', 'white');
  await processImage('zombie_boss.png', 'white');
  await processImage('player_thaybach.png', 'white');
}

main();
