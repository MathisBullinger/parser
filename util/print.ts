import type { Tree, Result } from '../parser'

export const printTree = (tree: Tree, indent = 0) => {
  console.log(`${' '.repeat(indent)}[${tree.type}] ${tree.value}`)
  tree.children.forEach((v) => printTree(v, indent + 2))
}

export const printResult = (result: Result) => {
  if (result.ok) printTree(result.result)
  else console.log(result)
}
