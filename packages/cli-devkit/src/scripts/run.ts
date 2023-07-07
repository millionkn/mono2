import process from "process";
import { esmCommand } from "../tools";
import { execaCommand } from 'execa'
import fse from "fs-extra";

const [scriptPath, ...args] = process.argv.slice(2)

if (!fse.statSync(scriptPath).isFile()) {
  throw new Error(`'${scriptPath}' is not file`)
}

const command = esmCommand(scriptPath)

const child = execaCommand([command, ...args].join(' '), {
  stdio: 'inherit',
})

await child.catch(() => { })
const exitCode = child.exitCode
if (exitCode === null) { throw new Error() }
process.exit(exitCode)

