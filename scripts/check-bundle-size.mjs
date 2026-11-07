import { readdir, readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const limit = 150 * 1024;
const directory = new URL("../dist/assets/", import.meta.url);
const files = (await readdir(directory)).filter((name) => name.endsWith(".js"));
const sizes = await Promise.all(files.map(async (name) => gzipSync(await readFile(new URL(name, directory))).byteLength));
const total = sizes.reduce((sum, size) => sum + size, 0);
if (total > limit) {
  console.error(`Initial JavaScript is ${total} bytes gzip; the CartMates limit is ${limit} bytes.`);
  process.exit(1);
}
console.log(`Initial JavaScript: ${total} / ${limit} bytes gzip.`);
