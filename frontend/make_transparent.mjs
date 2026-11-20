import { Jimp } from 'jimp';
import fs from 'fs';

async function removeWhiteBg(inputPath, outputPath) {
  try {
    const image = await Jimp.read(inputPath);
    // Scan every pixel and convert white/near-white to transparent
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
      const r = image.bitmap.data[idx + 0];
      const g = image.bitmap.data[idx + 1];
      const b = image.bitmap.data[idx + 2];
      
      // If near white, turn alpha to 0
      if (r > 240 && g > 240 && b > 240) {
        image.bitmap.data[idx + 3] = 0;
      } else if (r > 220 && g > 220 && b > 220) {
        // Soft edge
        const dist = Math.min(r, g, b) - 220;
        const alpha = Math.max(0, 255 - dist * 12);
        image.bitmap.data[idx + 3] = alpha;
      }
    });

    await image.write(outputPath);
    console.log(`Saved transparent image to ${outputPath}`);
  } catch (err) {
    console.error(`Error processing ${inputPath}:`, err);
  }
}

async function main() {
  const brainDir = "C:/Users/Carlos/.gemini/antigravity/brain/cd5118fe-978a-4ef1-8b3d-69f981b05e74/";
  const files = fs.readdirSync(brainDir);

  const isoCar = files.find(f => f.startsWith('chibi_tuner_car_') && f.endsWith('.jpg'));
  const sideCar = files.find(f => f.startsWith('chibi_car_side_') && f.endsWith('.jpg'));
  const garageBg = files.find(f => f.startsWith('cartown_isometric_garage_') && f.endsWith('.jpg'));
  const dragBg = files.find(f => f.startsWith('cartown_drag_strip_') && f.endsWith('.jpg'));

  if (isoCar) {
    await removeWhiteBg(brainDir + isoCar, './public/assets/car_iso.png');
  }
  if (sideCar) {
    await removeWhiteBg(brainDir + sideCar, './public/assets/car_side.png');
  }
  if (garageBg) {
    fs.copyFileSync(brainDir + garageBg, './public/assets/garage_cartown.jpg');
    console.log('Copied garage_cartown.jpg');
  }
  if (dragBg) {
    fs.copyFileSync(brainDir + dragBg, './public/assets/drag_strip.jpg');
    console.log('Copied drag_strip.jpg');
  }
}

main();
