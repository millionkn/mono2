import { CAC } from "cac";
import { getCwdProjectName, getProjectEnv } from "../getProject";
import { execaCommand } from "execa";

export function nxRunWrapper() {
  return (cac: CAC) => cac
    .command('nx-run <task>', `run nx,and find target in cwd`)
    .option('--mode=<mode>', `set configuration as <mode>`)
    .action((taskName: string | undefined, options: {
      mode: string | undefined
    }) => {
      if (!taskName) {
        console.error(`no taskName`)
        process.exit(1)
      }
      const projectName = getCwdProjectName()
      if (!projectName) {
        console.error(`cwd not in project`)
        process.exit(1)
      }
      const mode = options.mode || ``
      const configuration = !mode ? '' : `--configuration=${mode}`
      const child = execaCommand(`pnpm exec nx ${configuration} ${taskName} ${projectName}`, {
        env: getProjectEnv(projectName, mode),
        stdio: 'inherit',
      })
      child.catch(() => { }).finally(() => {
        const exitCode = child.exitCode
        if (exitCode === null) { throw new Error() }
        process.exit(exitCode)
      })
    })
}