import process from "process";
import { esmCommand } from "../tools.mjs";
import { execaCommandSync } from 'execa'
import path from "path";
import { fileURLToPath } from "url";

const command = import.meta.url
  .pipe((str) => fileURLToPath(str))
  .pipe((str) => path.resolve(str, `../../scripts/rollup-bundle.mts`))
  .pipe((str) => esmCommand(str))

const child = execaCommandSync(command, {
  stdio: 'inherit',
})
process.exit(child.exitCode)
