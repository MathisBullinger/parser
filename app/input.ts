import css from 'bundle-text:./input.css'

export default class Input extends HTMLElement {
  private readonly textArea = document.createElement('textarea')
  private readonly inputMirror = document.createElement('pre')
  private readonly worker = new Worker(
    new URL('data-url:./mathWorker.ts', import.meta.url),
    { type: 'module' }
  )

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })

    const style = document.createElement('style')
    style.textContent = css
    shadow.appendChild(style)

    this.textArea.setAttribute('rows', '1')
    this.textArea.setAttribute('autocomplete', 'off')
    this.textArea.setAttribute('autocorrect', 'off')
    this.textArea.setAttribute('spellcheck', 'false')
    this.textArea.setAttribute('data-gramm', 'false')
    shadow.appendChild(this.textArea)

    this.inputMirror.setAttribute('class', 'input-mirror')
    shadow.appendChild(this.inputMirror)
  }

  connectedCallback() {
    this.textArea.addEventListener('click', (e) => {
      e.stopPropagation()
    })
    this.addEventListener('click', (e) => {
      e.preventDefault()
      console.log('click')
      this.textArea.focus()
    })
    this.textArea.addEventListener('input', ({ target }) =>
      this.onInput((target as HTMLTextAreaElement).value)
    )

    this.worker.addEventListener('message', (e) => {
      console.log(e.data)
    })
  }

  onInput(text: string) {
    const lines = text.split(/\r?\n/)
    this.textArea.setAttribute('rows', lines.length.toString())

    for (let i = this.inputMirror.childElementCount; i < lines.length; i++) {
      const line = document.createElement('span')
      this.inputMirror.appendChild(line)
      this.worker.postMessage({ type: 'addLine' })
    }

    while (this.inputMirror.childElementCount > lines.length) {
      this.inputMirror.removeChild(this.inputMirror.lastChild)
      this.worker.postMessage({ type: 'removeLine' })
    }

    for (let i = 0; i < lines.length; i++) {
      const line = this.inputMirror.childNodes[i]
      if (line.textContent === lines[i]) continue
      this.worker.postMessage({ type: 'updateLine', index: i, text: lines[i] })
      line.textContent = lines[i]
    }
  }
}

customElements.define('math-input', Input)
