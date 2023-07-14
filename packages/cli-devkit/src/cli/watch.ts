import { CAC } from "cac";
import { normalizePath, workspaceRoot } from "../tools";
import { execaCommand } from 'execa'
import { getCwdProjectName, getProjectMonoDeps, getProjectEnv, getProjectEnvFileList, getProjectRoot } from "../getProject";
import { Observable, Subject, buffer, combineLatest, combineLatestAll, debounce, debounceTime, delay, delayWhen, distinctUntilChanged, expand, filter, from, map, merge, mergeMap, of, share, shareReplay, startWith, switchMap, timer, withLatestFrom } from "rxjs";
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
      type WatcherState = | {
        state: 'complate',
      } | {
        state: 'building',
        changeDate: Date,
      } | {
        state: 'error',
        msg: string,
      }
      const getOb$ = Object.lazyInitializer((projectName: string): Observable<WatcherState> => {
        const fileChange$ = new Observable<{ changeDate: Date }>((subscriber) => {
          const srcWatcher = globWatch(['ts', 'tsx', 'js', 'jsx'].map((suffix) => `src/**/*.${suffix}`))
          srcWatcher.on('change', () => subscriber.next({ changeDate: new Date() }))
          return () => srcWatcher.close()
        }).pipe(share())
        const depsState$ = from(getProjectMonoDeps(projectName)).pipe(
          map((p) => getOb$(p)),
          combineLatestAll(),
          map((stateArr): WatcherState => {
            const err = stateArr.find((v) => v.state === 'error')
            if (err?.state === 'error') {
              return err
            }
            const building = stateArr.find((v) => v.state === 'building')
            if (building?.state === 'building') {
              return building
            }
            return { state: 'complate' }
          }),
          shareReplay(1),
        )

        fileChange$.pipe(
          
          debounce(() => depsState$.pipe(filter((v) => v.state === 'complate'))),

        )

      })
    })
}