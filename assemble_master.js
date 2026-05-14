const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

async function assembleMaster() {
    const baseDir = 'c:\\Users\\nam.nguyentien\\PhpstormProjects\\silverhandchatbot\\assets\\sprite\\frontline';
    const actions = [
        { name: 'running', label: 'RUN' },
        { name: 'idle', label: 'IDLE' },
        { name: 'holding_aim', label: 'SHOOT' },
        { name: 'shooting_in_the_air', label: 'JUMP_SHOOT' },
        { name: 'jumping', label: 'JUMP' }
    ];

    const cellS = 256; // High res cell size
    const outCols = 8;
    const outRows = actions.length;
    const outImg = new Jimp({ width: outCols * cellS, height: outRows * cellS, color: 0x00000000 }); // Transparent background

    console.log("Starting assembly...");

    for (let r = 0; r < actions.length; r++) {
        const action = actions[r];
        const actionDir = path.join(baseDir, action.name);
        const jsonPath = path.join(actionDir, 'sprite-max-px-frames-36-rows-6-cols-6.json');
        const pngPath = path.join(actionDir, 'sprite-max-px-frames-36-rows-6-cols-6.png');

        if (!fs.existsSync(jsonPath) || !fs.existsSync(pngPath)) {
            console.error(`Missing files in ${actionDir}`);
            continue;
        }

        const metadata = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const spriteSheet = await Jimp.read(pngPath);
        const frameKeys = Object.keys(metadata.frames);
        
        // Pick 8 frames evenly (0, 5, 10, 15, 20, 25, 30, 35)
        const selectedIndices = [0, 5, 10, 15, 20, 25, 30, 35];

        for (let c = 0; c < selectedIndices.length; c++) {
            const idx = selectedIndices[c];
            const frameKey = frameKeys[idx];
            const f = metadata.frames[frameKey].frame;

            console.log(`Processing ${action.name} - Frame ${idx}`);

            // Crop frame
            const frame = spriteSheet.clone().crop({ x: f.x, y: f.y, w: f.w, h: f.h });

            // Background Removal (Smart)
            const data = frame.bitmap.data;
            for (let i = 0; i < data.length; i += 4) {
                const rVal = data[i], gVal = data[i+1], bVal = data[i+2];
                const avg = (rVal + gVal + bVal) / 3;
                const isNeutral = Math.max(rVal, gVal, bVal) - Math.min(rVal, gVal, bVal) < 20;
                
                // Remove black and white
                if ((avg < 30) || (avg > 230 && isNeutral)) {
                    data[i+3] = 0;
                }
            }

            // Resize and Center
            // We want to keep aspect ratio. The frames are 610x430.
            // We'll resize so the largest dimension is 240px (to leave some padding in 256x256 cell)
            frame.scaleToFit({ w: cellS - 16, h: cellS - 16 });
            
            const posX = c * cellS + (cellS - frame.bitmap.width) / 2;
            const posY = r * cellS + (cellS - frame.bitmap.height) / 2;
            
            outImg.composite(frame, posX, posY);
        }
    }

    const outPath = 'c:\\Users\\nam.nguyentien\\PhpstormProjects\\silverhandchatbot\\assets\\img\\defender\\frontline_master.png';
    await outImg.write(outPath);
    console.log(`MASTER PIECE CREATED: ${outPath}`);
}

assembleMaster();
