import type { Tree } from './parser'

export const evaluate = (node: Tree) => {
  const values = node.children.map(evaluate)

  const child = <T extends keyof TypeName>(
    index: number,
    type: T
  ): TypeName[T] => {
    if (values.length <= index)
      throw Error(`[${node.type}]: operand with index ${index} does not exist`)
    if (typeof values[index] !== type)
      throw Error(
        `[${node.type}]: operand with index ${index} has type ${typeof values[
          index
        ]} but ${type} was expected`
      )
    return values[index] as TypeName[T]
  }

  switch (node.type) {
    case 'int':
    case 'float':
      return parseInt(node.data!)
    case 'add':
      return child(0, 'number') + child(1, 'number')
    case 'subtract':
      return child(0, 'number') - child(1, 'number')
    case 'multiply':
      return child(0, 'number') * child(1, 'number')
    case 'divide':
      return child(0, 'number') / child(1, 'number')
    default:
      throw Error(`no evaluator for ${node.type}`)
  }
}

type TypeName = {
  string: string
  number: number
}
