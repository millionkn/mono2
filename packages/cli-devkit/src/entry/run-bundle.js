import process from "process";
import { esmCommand } from "../tools.mjs";
import { execaCommandSync } from 'execa'
import fse from "fs-extra";

const scriptPath = process.argv[2]

if (!fse.statSync(scriptPath).isFile()) {
  throw new Error(`'${scriptPath}' is not file`)
}

const command = esmCommand(scriptPath)

const child = execaCommandSync(command, {
  stdio: 'inherit',
})
process.exit(child.exitCode)

