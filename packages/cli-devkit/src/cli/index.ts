import '@mono/libs-polyfill';
import { cac } from 'cac';
import { buildWrapper } from './build';
import { runWrapper } from './run';
import { watchWrapper } from './watch';
import { fromEvent, map, tap } from 'rxjs';

const press$ = Object.pipeLineFrom(process.stdin)
  .pipeTap((stdin) => stdin.setRawMode(true))
  .pipeTap((stdin) => stdin.setEncoding('utf-8'))
  .unpack((stdin) => fromEvent(stdin, 'data'))
  .pipe(map((buffer) => String(buffer)))
  .pipe(tap((raw) => ['\x03', '\x04'].includes(raw) && process.exit(1)))

Object
  .pipeLineFrom(cac('mono'))
  .pipeTap(buildWrapper())
  .pipeTap(runWrapper())
  .pipeTap(watchWrapper(press$))
  .unpack((cli) => cli.help().parse())