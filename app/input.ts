import css from 'bundle-text:./input.css'

export default class Input extends HTMLElement {
  private readonly textArea = document.createElement('textarea')

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
  }

  connectedCallback() {
    this.textArea.addEventListener('click', (e) => {
      e.stopPropagation()
    })
    this.addEventListener('click', (e) => {
      e.preventDefault()
      this.textArea.focus()
    })
    this.textArea.addEventListener('input', ({ target }) =>
      this.onInput((target as HTMLTextAreaElement).value)
    )
  }

  onInput(text: string) {
    const lines = text.split(/\r?\n/)
    this.textArea.setAttribute('rows', lines.length.toString())
  }
}

customElements.define('math-input', Input)
