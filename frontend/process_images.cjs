const Jimp = require('jimp');
const fs = require('fs');

async function processImage(inputPath, outputPath) {
  try {
    const image = await Jimp.read(inputPath);
    // Convert black pixels to transparent
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // If color is very dark, make it transparent
      if (red < 20 && green < 20 && blue < 20) {
        this.bitmap.data[idx + 3] = 0; // alpha
      }
    });
    
    await image.writeAsync(outputPath);
    console.log('Processed', outputPath);
  } catch (err) {
    console.error(err);
  }
}

async function main() {
  const dir = "C:/Users/Carlos/.gemini/antigravity/brain/cd5118fe-978a-4ef1-8b3d-69f981b05e74/";
  
  const files = fs.readdirSync(dir);
  
  const carFile = files.find(f => f.startsWith('white_car_') && f.endsWith('.jpg'));
  const liftFile = files.find(f => f.startsWith('car_lift_') && f.endsWith('.jpg'));
  
  if (carFile) await processImage(dir + carFile, './public/assets/car.png');
  if (liftFile) await processImage(dir + liftFile, './public/assets/lift.png');
}

main();
