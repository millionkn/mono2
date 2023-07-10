import '@mono/libs-polyfill';
import { cac } from 'cac';
import { rollupWrapper } from './rollup';
import { runWrapper } from './run';
import { watchWrapper } from './watch';
import { nxRunWrapper } from './nx-run';
import { nxCwdWrapper } from './nx-cwd';

Object
  .pipeLineFrom(cac('mono'))
  .pipeTap(rollupWrapper())
  .pipeTap(nxRunWrapper())
  .pipeTap(nxCwdWrapper())
  .pipeTap(runWrapper())
  .pipeTap(watchWrapper())
  .unpack((cli) => cli.help().parse())