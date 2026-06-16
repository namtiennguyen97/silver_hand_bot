const { Jimp } = require('jimp');

async function check() {
    try {
        const image = await Jimp.read('assets/img/defender/player_thaybach.png');
        console.log(`WIDTH:${image.bitmap.width} HEIGHT:${image.bitmap.height}`);
    } catch (err) {
        console.error(err);
    }
}

check();
