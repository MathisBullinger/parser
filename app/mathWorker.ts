import evaluate from '../core/parser'

const lines: string[] = []

self.addEventListener('message', (e) => {
  switch (e.data.type) {
    case 'addLine':
      lines.push('')
      break
    case 'removeLine':
      lines.pop()
      break
    case 'updateLine':
      lines[e.data.index] = e.data.text
      onLineUpdate(e.data.index)
      break
  }
})

function onLineUpdate(index: number) {
  const line = lines[index]
  const result = evaluate(line)

  globalThis.postMessage({ type: 'result', line: index, result })
}
