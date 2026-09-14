import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
const env = await readFile(".env.local", "utf8");
const sensitive = env
  .split(/\r?\n/)
  .filter((line) => /^(SANDBOX_CLIENT_SECRET|SANDBOX_PASSWORD)=/.test(line))
  .map((line) =>
    line
      .slice(line.indexOf("=") + 1)
      .trim()
      .replace(/^['"]|['"]$/g, ""),
  )
  .filter(Boolean);
async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await scan(file);
    else if (/\.(js|json|map)$/.test(file)) {
      const text = await readFile(file, "utf8");
      if (sensitive.some((secret) => text.includes(secret)))
        throw new Error("A credential was found in a client artifact.");
    }
  }
}
await scan(".next/static");
console.log(
  "Client artifact check passed: no configured sandbox secrets found.",
);
