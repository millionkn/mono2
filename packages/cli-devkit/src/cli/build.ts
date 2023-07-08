import { CAC } from "cac";
import { getCwdProjectName } from "../getProject";
import { buildProject } from "../buildProject";

export function buildWrapper(cac: CAC) {
  cac
    .command('build [project]', `build project with rollup,default find project in current cwd`)
    .option(`--entry [...files]`, 'entry file,you can set it multiple times', {
      default: ['src/index.ts'],
    })
    .option('--mode <mode>', `if set,will load '.env.[mode]' or '.env.[mode].local'`)
    .action((rawProjectName: string | undefined, options: {
      mode: string | undefined,
      entry: string[]
    }) => {
      const projectName = rawProjectName ?? getCwdProjectName()
      if (!projectName) {
        console.error(`cwd not in project,please set a project`)
        process.exit(1)
      }
      buildProject({
        projectName,
        inputFile: options.entry,
        mode: options.mode || '',
      })
    })
}