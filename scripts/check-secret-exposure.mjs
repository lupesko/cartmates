import { readdir, readFile, stat } from "node:fs/promises";

const root = new URL("../dist/", import.meta.url);
const forbiddenNames = new Set([".dev.vars", ".env", ".env.local"]);
const forbiddenContent = [
  /GOCSPX-[A-Za-z0-9_-]{20,}/u,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u,
  /(?:access_token|refresh_token)\s*[=:]\s*["'][A-Za-z0-9._-]{20,}/iu,
];

async function walk(directory) {
  const found = [];
  for (const name of await readdir(directory)) {
    if (forbiddenNames.has(name) || name.endsWith(".map")) throw new Error(`Unsafe build artifact: ${name}`);
    const url = new URL(`${name}${(await stat(new URL(name, directory))).isDirectory() ? "/" : ""}`, directory);
    if ((await stat(url)).isDirectory()) found.push(...await walk(url));
    else found.push(url);
  }
  return found;
}

for (const file of await walk(root)) {
  const content = await readFile(file, "utf8").catch(() => "");
  for (const pattern of forbiddenContent) if (pattern.test(content)) throw new Error(`Potential secret in ${file.pathname}`);
}
console.log("Build output contains no recognized secret material or source maps.");
