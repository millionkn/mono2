import { env } from "process";

const taskProject = env['NX_TASK_TARGET_PROJECT']
if (!taskProject) {
  throw new Error(`no env,without nx?`)
}
export const TaskProject = taskProject

export const TaskMode = env['NX_TASK_TARGET_CONFIGURATION'] || null

const taskName = env['NX_TASK_TARGET_TARGET']
if (!taskName) {
  throw new Error(`no env,without nx?`)
}
export const TaskName = taskName