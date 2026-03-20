import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();

const targets = [
  { file: "Fried Rice & Beef Stew.jpg", maxWidth: 1400, quality: 72 },
  { file: "Jollof Rice & Grilled Chicken.jpg", maxWidth: 1400, quality: 76 },
  { file: "Egusi Soup & Pounded Yam.jpg", maxWidth: 1400, quality: 76 },
  { file: "Pepper Soup (Goat Meat).jpg", maxWidth: 1400, quality: 76 },
  { file: "Ogbono Soup & Eba.jpg", maxWidth: 1400, quality: 76 },
  { file: "Delicious Okro soup.jpg", maxWidth: 1400, quality: 76 },
  { file: "Delicious Ukwa.jpg", maxWidth: 1400, quality: 76 },
  { file: "Spaghetti Bolognese.jpg", maxWidth: 1400, quality: 76 },
  { file: "logo.jpg.jpeg", maxWidth: 1000, quality: 80 },
];

async function optimizeImage({ file, maxWidth, quality }) {
  const filePath = path.join(root, file);
  const tempPath = path.join(root, `${file}.tmp`);
  const before = (await fs.stat(filePath)).size;

  const buffer = await sharp(filePath)
    .rotate()
    .resize({
      width: maxWidth,
      withoutEnlargement: true,
      fit: "inside",
    })
    .jpeg({
      quality,
      mozjpeg: true,
      progressive: true,
    })
    .toBuffer();

  await fs.writeFile(tempPath, buffer);
  await fs.rename(tempPath, filePath);

  const after = (await fs.stat(filePath)).size;
  return {
    file,
    before,
    after,
    saved: before - after,
  };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const results = [];

for (const target of targets) {
  results.push(await optimizeImage(target));
}

const totalSaved = results.reduce((sum, item) => sum + item.saved, 0);

for (const result of results) {
  console.log(
    `${result.file}: ${formatBytes(result.before)} -> ${formatBytes(result.after)} (saved ${formatBytes(result.saved)})`,
  );
}

console.log(`Total saved: ${formatBytes(totalSaved)}`);
