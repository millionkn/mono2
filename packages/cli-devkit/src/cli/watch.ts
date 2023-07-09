import { CAC } from "cac";
import { normalizePath, workspaceRoot } from "../tools";
import { execaCommand } from 'execa'
import { getCwdProjectName, getProjectEnvFileList, getProjectRoot } from "../getProject";
import { Observable, filter, from, startWith, switchMap } from "rxjs";
import ansiEscapes from "ansi-escapes";
import ora from "ora";
import colors from 'picocolors'
import globWatch from "glob-watcher"
import dayjs from "dayjs";

export function watchWrapper(press$: Observable<string>) {
  return (cac: CAC) => cac
    .command('watch [projectName]', `run a esm script`)
    .option(`--debug`, `with '--inspect' flag`)
    .option('--mode <mode>', `if set,will load '.env.[mode]' or '.env.[mode].local'`)
    .action((rawProjectName: string | undefined, options: {
      mode: string | undefined,
      debug: boolean | undefined,
    }) => {
      const projectName = rawProjectName ?? getCwdProjectName()
      if (!projectName) {
        console.error(`cwd not in project,please set a project`)
        process.exit(1)
      }
      const spinner = ora()
      press$
        .pipe(filter((v) => v === 'r'))
        .pipe(startWith(''))
        .pipe(switchMap(() => new Observable<boolean>((subscriber) => {
          console.log(ansiEscapes.clearTerminal)
          spinner.start(colors.dim(`building with nx...`))
          const child = execaCommand(`nx build ${projectName}`, { cwd: workspaceRoot })
          child.then(() => {
            spinner.stop().clear()
            console.log(colors.cyan(`[${dayjs().format('HH:mm:ss')}]`), colors.green(`nx build successed`))
            subscriber.next(true)
          }).catch((res) => {
            spinner.stop().clear()
            console.log(colors.cyan(`[${dayjs().format('HH:mm:ss')}]`), colors.red(`nx build failed`))
            if (res instanceof Error) {
              console.error(res.message)
            } else {
              console.error(res)
            }
            subscriber.next(false)
          })
          return () => {
            spinner.stop().clear()
            child.kill()
          }
        })))
        .pipe(switchMap((err) => !err ? from([]) : new Observable((subscriber) => {
          const srcWatcher = globWatch(normalizePath(getProjectRoot(projectName, `src/**`)))
          const envWatcher = globWatch(getProjectEnvFileList(projectName, options.mode ?? ''))
          srcWatcher.on('change', (fileName) => {
            console.log(
              ansiEscapes.clearTerminal,
              colors.cyan(`[${dayjs().format('HH:mm:ss')}]`),
              colors.dim(`'${fileName}'changed,rebuilding...`)
            )
          })
          envWatcher.on('add', (fileName) => {
            console.log(
              ansiEscapes.clearTerminal,
              colors.cyan(`[${dayjs().format('HH:mm:ss')}]`),
              colors.dim(`add env file '${fileName}',restart...`)
            )
          })
          envWatcher.on('change', (fileName) => {
            console.log(
              ansiEscapes.clearTerminal,
              colors.cyan(`[${dayjs().format('HH:mm:ss')}]`),
              colors.dim(`change env file '${fileName}',restart...`)
            )
          })
          envWatcher.on('unlink', (fileName) => {
            console.log(
              ansiEscapes.clearTerminal,
              colors.cyan(`[${dayjs().format('HH:mm:ss')}]`),
              colors.dim(`remove env file '${fileName}',restart...`)
            )
          })

        })))
        .subscribe((x) => {
        })

    })
}