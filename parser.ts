import processTree from './treeProcessor'
import { evaluate } from './evaluator'

export type Tree = { type: TokenType; data?: string; children: Tree[] }
export type TokenType =
  | 'group'
  | 'sequence'
  | 'empty'
  | 'unary-minus'
  | 'decimal-dot'
  | 'int'
  | 'float'
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'group-start'
  | 'group-end'

type Parser = (text: string) => Result

type Result = Success | Failure
type Failure = { ok: false }
type Success = { ok: true; result: Tree; text: string }

const some =
  (parser: Parser): Parser =>
  (text) => {
    const results = [parser(text)]

    while (results.at(-1)!.ok) {
      results.push(parser((results.at(-1) as Success).text))
    }

    results.pop()
    if (results.length === 0) return { ok: false }

    return {
      ok: true,
      text: (results.at(-1) as Success).text,
      result: {
        type: 'group',
        children: results.map((v) => (v as Success).result),
      },
    }
  }

const any =
  (parser: Parser): Parser =>
  (text) => {
    const results: Success[] = []
    while (true) {
      const result = parser(results.at(-1)?.text ?? text)
      if (!result.ok)
        return {
          ok: true,
          text: results.at(-1)?.text ?? text,
          result: { type: 'group', children: results.map((v) => v.result) },
        }
      results.push(result)
    }
  }

const or =
  (...parsers: Parser[]): Parser =>
  (text) => {
    for (const parser of parsers) {
      const result = parser(text)
      if (result.ok) return result
    }
    return { ok: false }
  }

const sequence =
  (...parsers: Parser[]): Parser =>
  (text) => {
    const results: Success[] = []
    for (const parser of parsers) {
      const result = parser(results.at(-1)?.text ?? text)
      if (!result.ok) return { ok: false }
      results.push(result)
    }
    return {
      ok: true,
      text: results.at(-1)!.text,
      result: { type: 'sequence', children: results.map((v) => v.result) },
    }
  }

const charParser =
  (match: string | RegExp) =>
  (type: TokenType): Parser =>
  (text) =>
    (typeof match === 'string' ? match === text[0] : match.test(text[0]))
      ? {
          ok: true,
          result: { type, data: text[0], children: [] },
          text: text.slice(1),
        }
      : { ok: false }

const digit = charParser(/[0-9]/)
const plus = charParser('+')
const minus = charParser('-')
const times = charParser('*')
const divide = charParser('/')
const dot = charParser('.')
const leftParen = charParser('(')
const rightParen = charParser(')')

const integer = some(digit('int'))
const natural = or(sequence(minus('unary-minus'), integer), integer)
const rational = or(sequence(natural, dot('decimal-dot'), integer), natural)

// term ::= factor ([*/] factor)*
const term = sequence(
  factor,
  any(sequence(or(times('multiply'), divide('divide')), factor))
)

// expr ::= term ([+-] term)*
const expr = sequence(
  term,
  any(sequence(or(plus('add'), minus('subtract')), term))
)

// factor ::= (expr) | rational
function factor(text: string): Result {
  return or(
    sequence(leftParen('group-start'), expr, rightParen('group-end')),
    rational
  )(text)
}

const raw = expr('1+2/(3-4)*5')
printTree(raw)
if (raw.ok) {
  const ast = processTree(raw.result)
  printTree(ast)
  console.log(evaluate(ast))
}

function printTree(result: Result | Tree) {
  if (!(result as any).ok && !(result as any).children) return

  const print = (node: Tree, indent = 0) => {
    console.log(
      ' '.repeat(indent) + `(${node.type ?? 'none'}) ${node.data ?? ''}`
    )
    node.children.forEach((v) => print(v, indent + 2))
  }

  print((result as any).result ?? result)
}
