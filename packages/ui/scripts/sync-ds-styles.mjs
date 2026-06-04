import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const vendorDir = join(root, "vendor");
const dest = join(vendorDir, "tokonoma-ui.css");

mkdirSync(vendorDir, { recursive: true });
cpSync(require.resolve("tokonoma-ui/styles.css"), dest);
