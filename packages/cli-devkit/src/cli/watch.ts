import { CAC } from "cac";
import { normalizePath, workspaceRoot } from "../tools";
import { execaCommand } from 'execa'
import { getCwdProjectName, getProjectEnv, getProjectEnvFileList, getProjectRoot } from "../getProject";
import { Observable, Subject, debounceTime, switchMap } from "rxjs";
import ansiEscapes from "ansi-escapes";
import ora from "ora";
import colors from 'picocolors'
import globWatch from "glob-watcher"
import dayjs from "dayjs";

export function watchWrapper() {
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
      new Observable<string | null>((subscriber) => {
        const srcWatcher = globWatch(normalizePath(getProjectRoot(projectName, `src/**`)))
        subscriber.next(null)
        srcWatcher.on('change', (fileName) => subscriber.next(fileName))
      }).pipe(
        debounceTime(400),
        switchMap((changeFile) => new Observable<boolean>((subscriber) => {
          if (changeFile) {
            console.log(
              ansiEscapes.clearTerminal,
              colors.cyan(`[${dayjs().format('HH:mm:ss')}]`),
              colors.dim(`'${changeFile}'changed,rebuilding...`)
            )
          } else {
            console.log(
              ansiEscapes.clearTerminal,
              colors.cyan(`[${dayjs().format('HH:mm:ss')}]`),
              colors.dim(`start watcher...`)
            )
          }
          subscriber.next(false)
          const spinner = ora().start(colors.dim(`run npm script ${colors.green('pre-build')} with pnpm...`))
          const child = execaCommand(`pnpm run pre-build`, {
            stdio: 'pipe',
            cwd: getProjectRoot(projectName),
          })
          child.then(() => {
            spinner.stop().clear()
            console.log(colors.cyan(`[${dayjs().format('HH:mm:ss')}]`), colors.green(`pre-build successed,start server...`))
            subscriber.next(true)
          }).catch((res) => {
            spinner.stop().clear()
            console.log(colors.cyan(`[${dayjs().format('HH:mm:ss')}]`), colors.red(`nx pre-build failed`))
            if (res instanceof Error) {
              console.error(res.message)
            } else {
              console.error(res)
            }
          })
          return () => {
            spinner.stop().clear()
            child.kill()
          }
        })),
        switchMap((value) => {
          const envWatcher = globWatch(getProjectEnvFileList(projectName, options.mode ?? ''))
          const envChangeLog$ = new Subject<string>()
          envWatcher.on('add', (fileName) => {
            envChangeLog$.next([
              colors.cyan(`[${dayjs().format('HH:mm:ss')}]`),
              colors.dim(`add env file '${fileName}',restart...`)
            ].join(' '))
          })
          envWatcher.on('change', (fileName) => {
            envChangeLog$.next([
              colors.cyan(`[${dayjs().format('HH:mm:ss')}]`),
              colors.dim(`change env file '${fileName}',restart...`)
            ].join(' '))
          })
          envWatcher.on('unlink', (fileName) => {
            envChangeLog$.next([
              colors.cyan(`[${dayjs().format('HH:mm:ss')}]`),
              colors.dim(`remove env file '${fileName}',restart...`)
            ].join(' '))
          })
          return new Observable<boolean>((subscriber) => {
            if (!value) {
              subscriber.next(false)
              return
            }
            const subscribtion = envChangeLog$.pipe(debounceTime(400)).subscribe((str) => {
              console.log(str)
              subscriber.next(true)
            })
            subscriber.next(true)
            return () => subscribtion.unsubscribe()
          })
        }),
        switchMap((value) => new Observable(() => {
          if (!value) { return }
          const inspect = options.debug ? '--inspect' : ''
          const nodeIndexFile = getProjectRoot(projectName, 'dist', 'index.js')
          const child = execaCommand(`node ${inspect} ${nodeIndexFile}`, {
            stdio: 'inherit',
            env: getProjectEnv(projectName, options.mode ?? '')
          })
          let exitCb = () => {
            console.log(
              colors.cyan(`[${dayjs().format('HH:mm:ss')}]`),
              colors.dim(`progrem has exit with code ${child.exitCode}`)
            )
          }
          child.catch(() => { }).finally(() => exitCb())
          return () => {
            exitCb = () => { }
            child.kill()
          }
        }))
      ).subscribe()
    })
}