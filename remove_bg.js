const { Jimp } = require('jimp');
const path = require('path');

async function processImage(fileName) {
  try {
    const filePath = path.join(__dirname, 'assets', 'img', 'defender', fileName);
    console.log(`Reading ${filePath}...`);
    const image = await Jimp.read(filePath);
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      // If the pixel is white or very close to white
      if (r > 245 && g > 245 && b > 245) {
        this.bitmap.data[idx + 3] = 0;
      }
    });

    await image.write(filePath);
    console.log(`Successfully processed and saved ${fileName}`);
  } catch (err) {
    console.error(`Error processing ${fileName}:`, err);
  }
}

async function main() {
  await processImage('zombie_tank.png');
  await processImage('zombie.png');
}

main();
