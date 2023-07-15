import { CAC } from "cac";
import { execaCommand } from "execa";
import { env } from "process";
import { getProjectRoot } from "../getProject";
import { Env_SkipBuild } from "../tools";

export function nxCwdWrapper() {
  return (cac: CAC) => cac
    .command('nx-cwd [command]', `run command in cwd:'packages/[NX_TASK_TARGET_PROJECT]'`)
    .action((command) => {
      const projectName = env['NX_TASK_TARGET_PROJECT']
      if (!projectName) {
        console.error(`not found env 'NX_TASK_TARGET_PROJECT',without nx?`)
        process.exit(1)
      }
      const child = execaCommand(command, {
        cwd: getProjectRoot(projectName),
        stdio: 'inherit',
        env: {
          [Env_SkipBuild]: 'true',
        }
      })
      child.catch(() => { }).finally(() => {
        const exitCode = child.exitCode
        if (exitCode === null) { throw new Error() }
        process.exit(exitCode)
      })
    })
}