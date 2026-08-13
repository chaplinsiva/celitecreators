const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SVG_PATH = path.join(process.cwd(), 'public/bimi/favicon.svg');

async function generate() {
  if (!fs.existsSync(SVG_PATH)) {
    console.error('SVG source file not found:', SVG_PATH);
    process.exit(1);
  }

  console.log('Reading SVG source from:', SVG_PATH);

  // Buffer from SVG
  const svgBuffer = fs.readFileSync(SVG_PATH);

  // Targets to generate
  const targets = [
    { file: 'public/favicon.png', size: 48 },
    { file: 'public/favicon-48x48.png', size: 48 },
    { file: 'public/favicon-96x96.png', size: 96 },
    { file: 'public/favicon/fav.png', size: 192 },
    { file: 'public/apple-touch-icon.png', size: 180 },
    { file: 'public/icon-192.png', size: 192 },
    { file: 'public/icon-512.png', size: 512 },
    { file: 'app/icon.png', size: 512 },
    { file: 'public/logo/favicon.png', size: 192 },
    { file: 'public/PNG1.png', size: 512 },
    { file: 'public/logo.png', size: 512 },
    { file: 'public/Logo.png', size: 512 },
    { file: 'public/logo/logo.png', size: 512 },
    { file: 'public/celite.png', size: 512 },
    { file: 'public/celiteprologo23.png', size: 512 }
  ];

  for (const t of targets) {
    const fullPath = path.join(process.cwd(), t.file);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await sharp(svgBuffer)
      .resize(t.size, t.size)
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(fullPath);

    const stat = fs.statSync(fullPath);
    console.log(`Generated ${t.file} (${t.size}x${t.size}): ${(stat.size / 1024).toFixed(2)} KB`);
  }

  // Copy favicon.svg directly to public/favicon.svg and public/favicon/favicon.svg
  fs.copyFileSync(SVG_PATH, path.join(process.cwd(), 'public/favicon.svg'));
  fs.copyFileSync(SVG_PATH, path.join(process.cwd(), 'public/favicon/favicon.svg'));
  console.log('Copied SVG to public/favicon.svg and public/favicon/favicon.svg');

  // Generate standard ICO file at public/favicon.ico and app/favicon.ico
  // A 32x32 PNG inside ICO container or 48x48 PNG written as ICO
  const ico32Buffer = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const ico48Buffer = await sharp(svgBuffer).resize(48, 48).png().toBuffer();

  // Simple raw ICO header for PNG embedded icons:
  // ICONDIR: Reserved(2B=0), Type(2B=1), Count(2B=2)
  // Entry 1: 32x32, Entry 2: 48x48
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // image type 1 = icon
  header.writeUInt16LE(2, 4); // 2 images

  const offsetImage1 = 6 + (16 * 2); // 38
  const offsetImage2 = offsetImage1 + ico32Buffer.length;

  const entry1 = Buffer.alloc(16);
  entry1.writeUInt8(32, 0); // width
  entry1.writeUInt8(32, 1); // height
  entry1.writeUInt8(0, 2);  // color palette
  entry1.writeUInt8(0, 3);  // reserved
  entry1.writeUInt16LE(1, 4); // color planes
  entry1.writeUInt16LE(32, 6); // bpp
  entry1.writeUInt32LE(ico32Buffer.length, 8); // size
  entry1.writeUInt32LE(offsetImage1, 12); // offset

  const entry2 = Buffer.alloc(16);
  entry2.writeUInt8(48, 0); // width
  entry2.writeUInt8(48, 1); // height
  entry2.writeUInt8(0, 2);  // color palette
  entry2.writeUInt8(0, 3);  // reserved
  entry2.writeUInt16LE(1, 4); // color planes
  entry2.writeUInt16LE(32, 6); // bpp
  entry2.writeUInt32LE(ico48Buffer.length, 8); // size
  entry2.writeUInt32LE(offsetImage2, 12); // offset

  const icoBuffer = Buffer.concat([header, entry1, entry2, ico32Buffer, ico48Buffer]);

  fs.writeFileSync(path.join(process.cwd(), 'public/favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(process.cwd(), 'app/favicon.ico'), icoBuffer);
  console.log(`Generated public/favicon.ico and app/favicon.ico: ${(icoBuffer.length / 1024).toFixed(2)} KB`);

  console.log('All favicons successfully generated!');
}

generate().catch(err => {
  console.error('Favicon generation failed:', err);
  process.exit(1);
});
