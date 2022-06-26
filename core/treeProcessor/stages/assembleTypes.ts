import type { Tree, TokenType } from '../../parser'
import util from './util'

const assembleTypes = (node: Tree): Tree => {
  const _ = util(node)

  if (_.isType('group') && _.childrenHaveType('int'))
    node = {
      type: 'int',
      data: node.children.map((child) => child.data).join(''),
      children: [],
    }

  if (_.isType('sequence') && _.hasChildren('unary-minus', 'int'))
    node = { ..._.joinChildren(), type: 'int' }

  if (_.isType('sequence') && _.hasChildren('int', 'decimal-dot', 'int'))
    node = { ..._.joinChildren(), type: 'float' }

  return node
}

export default assembleTypes
