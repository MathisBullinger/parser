import type { Tree, TokenType } from '../../parser'
import util from './util'

const binaryOp: TokenType[] = ['add', 'subtract', 'multiply', 'divide']
const number: TokenType[] = ['int', 'float']

const operationOrder = (node: Tree): Tree => {
  let _ = util(node)

  if (!_.isType('sequence')) return node

  if (_.hasChildren(number, 'sequence')) {
    const _s = util(node.children[1])
    if (_s.hasChildren(binaryOp, [...number, ...binaryOp])) {
      node = {
        ...node.children[1].children[0],
        children: [node.children[0], node.children[1].children[1]],
      }
      _ = util(node)
    }
  }

  const moveDangling = () => {
    if (
      !_.isType('sequence', 'group') ||
      !_.hasChildren(_.any, ['sequence', 'group'])
    )
      return false

    const findDangling = (node: Tree, ...path: Tree[]): Tree[] | undefined => {
      if (!node.children.length && binaryOp.includes(node.type))
        return [node, ...path]
      if (node.children.length === 2)
        return findDangling(node.children[0], node, ...path)
    }

    const dangling = findDangling(node.children[1], node)

    if (!dangling) return false

    dangling[0].children = [node.children[0], dangling[1].children[1]]
    dangling[2].children[0] = dangling[0]

    if (node === dangling[2]) node = dangling[0]
    else node = node.children[1]
    _ = util(node)
    return true
  }
  while (moveDangling()) {}

  if (!_.hasChildren(number, 'group')) return node
  const _g = util(node.children[1])
  if (
    !_g.childrenHaveType('sequence') ||
    !node.children[1].children.every((s) =>
      util(s).hasChildren(binaryOp, number)
    )
  )
    return node

  const newRoot = node.children[1]
  newRoot.children[0] = {
    ...newRoot.children[0].children[0],
    children: [node.children[0], ...newRoot.children[0].children.slice(1)],
  }

  for (let i = 0; i < newRoot.children.length; i++) {
    const _c = util(newRoot.children[i])
    if (!_c.isType('sequence')) continue
    newRoot.children[i] = {
      ...newRoot.children[i].children[0],
      children: [newRoot.children[i].children[1]],
    }
  }

  while (newRoot.children.length > 1) {
    newRoot.children[1].children.unshift(newRoot.children.shift()!)
  }

  return newRoot.children[0]
}

export default operationOrder
