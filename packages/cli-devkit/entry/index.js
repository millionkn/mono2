import { env } from "process";

await Promise.resolve()
  .then(() => {
    if ('Mono_Cli_Devkit' in env) { return Promise.resolve() }
    return import('./buildSelf.js')
  })
  .then(() => import('../dist/cli/index.js'))