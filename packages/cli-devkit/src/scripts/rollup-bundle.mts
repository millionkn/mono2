import { timer } from "rxjs";
import ansiEscapes from 'ansi-escapes';
import dayjs from 'dayjs';
import { getProjectEnv } from "../getProject.mjs";
import { cwdProjectName } from "../define.mjs";
import signale from "signale";

timer(0, 1000).subscribe((i) => {
  signale.star(`${ansiEscapes.clearTerminal}${dayjs().format('HH:mm:ss')}`)
  signale.success(`projectName:${cwdProjectName}`)
  console.log(getProjectEnv(cwdProjectName))
})