import { CAC } from "cac";
import { normalizePath, workspaceRoot } from "../tools";
import { execaCommand } from 'execa'
import { getCwdProjectName, getProjectMonoDeepDeps, getProjectEnv, getProjectEnvFileList, getProjectRoot } from "../getProject";
import { Observable, Subject, combineLatestAll, debounceTime, from, map, mergeMap, startWith, switchMap } from "rxjs";
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
      from(getProjectMonoDeepDeps(projectName).concat(projectName)).pipe(
        map((projectName) => new Observable<string>((subscriber) => {
          const srcWatcher = globWatch(`src/**`, {
            cwd: getProjectRoot(projectName),
          })
          srcWatcher.on('change', (fileName) => subscriber.next(fileName))
        }).pipe(
          debounceTime(400),
          switchMap(() => new Observable<null | {
            state: 'building',
            projectName: string,
          } | {
            state: 'error',
            projectName: string,
            errMessage: string,
          }>((subscriber) => {
            const child = execaCommand(`pnpm exec mono rollup`, {
              stdio: 'pipe',
              cwd: getProjectRoot(projectName),
            })
            subscriber.next({
              state: 'building',
              projectName,
            })
            child.then(() => subscriber.next(null)).catch((e) => {
              const errMessage = e instanceof Error ? e.message : String(e)
              subscriber.next({
                state: 'error',
                projectName,
                errMessage,
              })
            }).finally(() => subscriber.complete())
            return () => child.kill()
          })),
          startWith(null),
        )),
        combineLatestAll(),
        (ob$) => {
          const spinner = ora()
          return ob$.pipe(
            switchMap((buildingStateArr) => {
              const err = buildingStateArr.find((e) => e?.state === 'error')
              if (err?.state === 'error') {
                spinner.stop().clear()
                console.log(ansiEscapes.clearTerminal)
                console.log(
                  colors.cyan(`[${dayjs().format('HH:mm:ss')}]`),
                  `project ${colors.green(err.projectName)} build failed:\n`,
                  err.errMessage,
                )
                return from([])
              }
              const building = buildingStateArr.filter((e) => e?.state === 'building')
              if (building.length !== 0) {
                spinner.start(`building project ${building.map((e) => colors.green(e!.projectName)).join(',')}`)
                return from([])
              }
              return new Observable(() => {
                spinner.stop().clear()
                console.log(
                  colors.cyan(`[${dayjs().format('HH:mm:ss')}]`),
                  `starting...`
                )
                
              })
            }),
          )
        }
      )
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