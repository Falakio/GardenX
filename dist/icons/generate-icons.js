import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [192, 512];
const iconPath = join(__dirname, 'icon-template.png');

async function generateIcons() {
  for (const size of sizes) {
    await sharp(iconPath)
      .resize(size, size)
      .toFile(join(__dirname, `icon-${size}x${size}.png`));
  }
}

generateIcons().catch(console.error);
