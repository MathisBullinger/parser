import './input'

// class Input {
//   constructor(private readonly textbox: HTMLTextAreaElement) {
//     textbox.addEventListener('input', ({ target }) =>
//       this.onInput((target as HTMLTextAreaElement).value)
//     )
//   }

//   private onInput(text: string) {
//     const lines = text.split(/\r?\n/)
//     this.textbox.setAttribute('rows', lines.length.toString())
//   }

//   public focus() {
//     this.textbox.focus()
//   }
// }

// const input = new Input(document.querySelector('.input-area')!)

const inputPart = document.querySelector('.input')!
// inputPart.addEventListener('click', () => input.focus())
