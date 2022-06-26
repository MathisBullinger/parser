import type { Tree } from '../parser'
import { stages } from './stages'

const chain =
  <T>(...funs: ((v: T) => T)[]) =>
  (v: T): T => {
    for (const fun of funs) v = fun(v)
    return v
  }

const applyStage =
  (steps: ((node: Tree) => Tree)[]) =>
  (node: Tree): Tree =>
    chain(...steps)({
      ...node,
      children: node.children
        .map(applyStage(steps))
        .filter((child) => child.type !== 'empty'),
    })

export default chain(...stages.map((steps) => applyStage(steps)))
