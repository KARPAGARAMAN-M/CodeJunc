const fs = require('fs');

// Simple PNG chunk reader to verify alpha channel and transparency
function checkPNG(filePath) {
  const buf = fs.readFileSync(filePath);
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (buf.readUInt32BE(0) !== 0x89504E47) {
    console.log(filePath, 'is not a PNG');
    return;
  }
  // IHDR is first chunk
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const bitDepth = buf.readUInt8(24);
  const colorType = buf.readUInt8(25);
  // Color type 6 is RGBA (Truecolor with alpha)
  console.log(`${filePath}: ${width}x${height}, colorType: ${colorType} (${colorType === 6 ? 'RGBA with Alpha' : 'Type ' + colorType})`);
}

checkPNG('assets/brand/brand-mark-transparent.png');
checkPNG('assets/brand/brand-mark-trans.png');
checkPNG('assets/brand/logo-dark-trans.png');
checkPNG('assets/brand/logo-light-trans.png');
checkPNG('assets/brand/brand-mark-blend.png');
checkPNG('assets/brand/logo-dark-blend.png');
