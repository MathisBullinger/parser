import type { Tree, TokenType } from '../../parser'

export default (node: Tree) => {
  const any = Symbol('any')

  type TypeDescr = TokenType | TokenType[] | symbol

  const testType = (match: TypeDescr, type: TokenType) =>
    match === any
      ? true
      : (Array.isArray(match) ? match : [match]).includes(type)

  return {
    isType: (...type: TokenType[]) => type.includes(node.type),

    hasChildren: (...types: TypeDescr[]) =>
      node.children.length === types.length &&
      node.children.every((child, i) => testType(types[i], child.type)),

    firstChildren: (...types: TypeDescr[]) =>
      types.every((type, i) => testType(type, node.children[i].type)),

    childrenHaveType: (type: TokenType) =>
      node.children.every((child) => child.type === type),

    joinChildren: (): Tree => ({
      ...node,
      data: node.children.map((child) => child.data).join(''),
      children: [],
    }),

    any,
  }
}
