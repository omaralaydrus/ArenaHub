import { sandboxGet } from "../src/core/http/sandbox.gateway";
import type { SandboxPing } from "../src/shared/models/sandbox.model";

async function main() {
  const ping = await sandboxGet<SandboxPing>("ping");
  console.log(
    JSON.stringify({
      app: ping.app,
      sandbox: ping.sandbox,
      rateLimitRemaining: ping.rateLimitRemaining,
    }),
  );
  for (const path of ["zones", "license-types", "business-activities"]) {
    let count = 0;
    for (let offset = 0; ; offset += 200) {
      const page = await sandboxGet<unknown[]>(
        path,
        `?offset=${offset}&limit=200`,
      );
      if (!Array.isArray(page)) throw new Error(`Invalid ${path} response`);
      count += page.length;
      if (page.length < 200) break;
    }
    console.log(`${path}: ${count} records`);
  }
  const statistics = await sandboxGet<Record<string, unknown>>("statistics");
  console.log(`statistics: ${Object.keys(statistics).join(", ")}`);
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Connection failed");
  process.exitCode = 1;
});
