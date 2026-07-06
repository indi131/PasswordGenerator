const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const sizes = [16, 32, 48, 128];

const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" stroke="#7c3aed" stroke-width="2" stroke-linejoin="round"/>
  <path d="m9 12 2 2 4-4" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const activeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" stroke="#7c3aed" stroke-width="2" stroke-linejoin="round"/>
  <path d="m9 12 2 2 4-4" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const iconsDir = path.join(__dirname, "icons");

async function generate(name, svg) {
  for (const size of sizes) {
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `${name}${size}.png`));
    console.log(`  ${name}${size}.png OK`);
  }
}

(async () => {
  console.log("Generating default icons (purple shield, grey checkmark)...");
  await generate("icon", defaultSvg);
  console.log("Generating active icons (purple shield, green checkmark)...");
  await generate("icon-active", activeSvg);
  console.log("Done!");
})();
