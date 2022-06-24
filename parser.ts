import { printResult } from './util/print'
import {
  some,
  or,
  chain,
  createParser,
  joinChildren,
  infix,
} from './util/combinator'

export type Parser<T = Record<never, never>> = ((input: string) => Result) & T

export type Result = Success | Failure
export type Success = { ok: true; result: Tree; text: string }
export type Failure = { ok: false }

export type Tree = { type: string; value: string; children: Tree[] }

const integer = some(createParser('integer', /[0-9]/))

const natural = or(
  integer,
  chain('natural', createParser('minus', '-'), integer).process(joinChildren)
)

const rational = or(
  chain('rational', natural, createParser('dot', '.'), integer).process(
    joinChildren
  ),
  natural
)

// grammar

// expr ::= term + expr | term
function expr(input: string): Result {
  return or(
    chain('', term, createParser('plus', '+'), expr).process(infix),
    term
  )(input)
}

// term ::= factor * term | factor
function term(input: string): Result {
  return or(
    chain('', factor, createParser('times', '*'), term).process(infix),
    factor
  )(input)
}

// factor ::= (expr) | rational
function factor(input: string): Result {
  return or(
    chain('', createParser('', '('), expr, createParser('', ')')).process(
      ({ children: [, expr] }) => expr
    ),
    rational
  )(input)
}

printResult(expr('2+3*4'))
printResult(expr('(2+3)*4'))
