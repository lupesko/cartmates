// Rebuild matching PNG exports after editing SVG source assets.
// Requires Node.js and `npm install sharp` in this directory or an ancestor.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
async function main() {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'asset-manifest.json')));
  for (const asset of manifest.assets) {
    const input = path.join(root, asset.svg);
    asset.png = [];
    for (const scale of [1, 2]) {
      const output = input.replace(/\.svg$/, scale === 1 ? '.png' : '@2x.png');
      await sharp(input).resize(asset.width * scale, asset.height * scale).png().toFile(output);
      asset.png.push({path:path.relative(root,output),width:asset.width*scale,height:asset.height*scale});
    }
  }
  for (const [name, sizes] of Object.entries({'app-icon':[192,180],'app-icon-maskable':[192],'favicon':[16,32,48]})) {
    for (const size of sizes) await sharp(path.join(root,`public/assets/app/${name}.svg`)).resize(size,size).png().toFile(path.join(root,`public/assets/app/${name}-${size}.png`));
  }
  fs.writeFileSync(path.join(root,'asset-manifest.json'), JSON.stringify(manifest,null,2)+'\n');
  console.log(`Exported ${manifest.assets.length*2+6} PNGs from ${manifest.assets.length} SVG sources.`);
}
main().catch(e=>{console.error(e);process.exit(1)});
