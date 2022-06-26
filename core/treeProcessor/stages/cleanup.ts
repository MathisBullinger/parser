import type { Tree, TokenType } from '../../parser'
import util from './util'

const cleanup = (node: Tree): Tree => {
  const _ = util(node)

  node.children = node.children.filter(
    (child) =>
      child.children.length || !['sequence', 'group'].includes(child.type)
  )

  if (_.hasChildren('group-start', _.any, 'group-end')) return node.children[1]

  if (node.children.length === 1) return node.children[0]

  if (!node.data && !node.children.length)
    return { type: 'empty', children: [] }

  return node
}

export default cleanup
