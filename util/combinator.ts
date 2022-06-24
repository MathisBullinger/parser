import type { Parser, Tree, Success } from '../parser'

export const some =
  (parser: Parser): Parser =>
  (text) => {
    const result = parser(text)
    if (!result.ok) return result

    while (true) {
      const res = parser(result.text)
      if (!res.ok) break
      result.result.value += res.result.value
      result.text = res.text
    }

    return result
  }

export const or =
  (...parsers: Parser[]): Parser =>
  (text) => {
    for (const parser of parsers) {
      const result = parser(text)
      if (result.ok) return result
    }
    return { ok: false }
  }

export const chain = (
  type: string,
  ...parsers: Parser[]
): Parser<{ process(f: (tree: Tree) => Tree): Parser }> => {
  let process: ((tree: Tree) => Tree) | null = null

  const parser = (text: string) => {
    const result: Success = {
      ok: true,
      result: { type, value: '', children: [] },
      text,
    }

    for (const parser of parsers) {
      const res = parser(result.text)
      if (!res.ok) return { ok: false }
      result.text = res.text
      result.result.children?.push(res.result)
    }

    if (process) result.result = process(result.result)
    return result
  }

  return Object.assign(parser, {
    process(f: any) {
      process = f
      return parser
    },
  }) as any
}

export const createParser =
  (type: string, test: RegExp | string): Parser =>
  (text) =>
    (typeof test === 'string' ? text[0] === test : test.test(text[0]))
      ? {
          ok: true,
          result: { type, value: text[0], children: [] },
          text: text.slice(1),
        }
      : { ok: false }

export const joinChildren = ({ children, ...tree }: Tree): Tree => ({
  ...tree,
  children: [],
  value: children.map((child) => child.value).join(''),
})

export const infix = ({ children: [a, b, c], ...tree }: Tree): Tree => ({
  ...b,
  children: [a, c],
})
