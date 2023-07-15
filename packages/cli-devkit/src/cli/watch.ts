import { CAC } from "cac";
import { execaCommand } from 'execa'
import { getCwdProjectName, getProjectMonoDeps, getProjectEnv, getProjectEnvFileList, getProjectRoot } from "../getProject";
import { Observable, combineLatest, combineLatestAll, distinctUntilChanged, from, map, of, shareReplay, startWith, switchMap, timer } from "rxjs";
import ansiEscapes from "ansi-escapes";
import ora from "ora";
import colors from 'picocolors'
import globWatch from "glob-watcher"
import dayjs from "dayjs";
import { rollupProject } from "../rollupProject";

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
      const inspect = options.debug === true ? `--inspect` : ``
      type WatcherState = {
        state: 'complate',
      } | {
        state: 'building',
        projectName: string,
        changeDate: Date,
      } | {
        state: 'error',
        msg: string,
      }
      const format = (str: string, clear = true) => `${!clear ? '' : ansiEscapes.clearScreen}${colors.green(`[${dayjs().format('HH:mm:ss')}]`)} ${str}`
      const getOb$ = Object.lazyInitializer((projectName: string): Observable<WatcherState> => {
        const fileChange$ = new Observable<{ changeDate: Date }>((subscriber) => {
          const srcWatcher = globWatch(['ts', 'tsx', 'js', 'jsx'].map((suffix) => getProjectRoot(projectName, `src/**/*.${suffix}`)))
          srcWatcher.on('change', () => subscriber.next({ changeDate: new Date() }))
          return () => srcWatcher.close()
        })
        const depsState$ = from(getProjectMonoDeps(projectName)).pipe(
          map((p) => getOb$(p)),
          combineLatestAll(),
          map((stateArr): WatcherState => {
            const err = stateArr.find((v) => v.state === 'error')
            if (err?.state === 'error') { return err }
            const building = stateArr.find((v) => v.state === 'building')
            if (building?.state === 'building') { return building }
            return { state: 'complate' }
          }),
        )
        let lastBuild = new Date()
        return combineLatest([depsState$, fileChange$]).pipe(
          switchMap(([deps, { changeDate }]) => {
            if (deps.state !== 'complate') { return of(deps) }
            if (changeDate.valueOf() <= lastBuild.valueOf()) {
              return of<WatcherState>({ state: 'complate' })
            }
            return timer(200).pipe(
              switchMap(() => rollupProject(projectName)
                .then((): WatcherState => ({ state: 'complate' }))
                .catch((e): WatcherState => ({
                  state: 'error',
                  msg: e instanceof Error ? e.message : String(e),
                }))
                .finally(() => lastBuild = changeDate)
              ),
              startWith<WatcherState>({ state: 'building', changeDate, projectName })
            )
          }),
          startWith<WatcherState>({ state: 'complate' }),
          shareReplay(1),
        )
      })
      let spanier = ora()
      getOb$(projectName).pipe(
        distinctUntilChanged((pre, cur) => {
          if (cur.state === 'complate') { return pre.state === cur.state }
          if (cur.state === 'error') {
            if (pre.state !== 'error') { return false }
            return pre.msg === cur.msg
          }
          if (pre.state !== 'building') { return false }
          return pre.projectName === cur.projectName
        }),
        switchMap((e) => {
          if (e.state === 'error') {
            spanier.stop().clear()
            console.error(format(colors.red(`build failed`)))
            console.error(e.msg)
            return of(false)
          } else if (e.state === 'building') {
            spanier.start(format(`building project ${colors.cyan(e.projectName)}`, false))
            return of(false)
          } else {
            spanier.stop().clear()
            console.log(format(`${colors.green(`build complated,starting app and check types...`)}`))
            return new Observable<null | string>((subscriber) => {
              subscriber.next(null)
              const child = execaCommand(`nx run ${projectName}:tsc-check`)
              child.catch((e) => subscriber.next(e instanceof Error ? e.message : String(e)))
              return () => child.kill()
            }).pipe(
              map((errMsg) => {
                if (!errMsg) { return true }
                console.error(format(colors.red(`tsc-check failed`)))
                console.error(errMsg)
                return false
              }),
            )
          }
        }),
        switchMap((v) => {
          if (!v) { return from([]) }
          return new Observable<null>((subscriber) => {
            subscriber.next(null)
            const srcWatcher = globWatch(getProjectEnvFileList(projectName, options.mode ?? ''))
            srcWatcher.on(`change`, (fileName) => {
              console.log(format(`env file ${colors.gray(fileName)} change,restart...`))
              subscriber.next(null)
            })
            srcWatcher.on(`add`, (fileName) => {
              console.log(format(`new env file ${colors.gray(fileName)},restart...`))
              subscriber.next(null)
            })
            srcWatcher.on(`unlink`, (fileName) => {
              console.log(format(`env file ${colors.gray(fileName)} removed,restart...`))
              subscriber.next(null)
            })
            return () => srcWatcher.close()
          }).pipe(
            switchMap(() => new Observable(() => {
              const child = execaCommand(`node ${inspect} ${getProjectRoot(projectName, `dist`, `index.js`)}`, {
                stdio: 'inherit',
                env: getProjectEnv(projectName, options.mode ?? ''),
              })
              let exitCb = () => {
                console.log(format(`progrem has exit with code ${child.exitCode}`, false))
              }
              child.catch(() => { }).finally(() => exitCb())
              return () => {
                exitCb = () => { }
                child.kill()
              }
            }))
          )
        }),
      ).subscribe()
    })
}