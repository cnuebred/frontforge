
// pocket, jako osobny nie zintegrowany element - przyjmujacy tylko callbacki

import { reverse } from "dns";
import { Pocket } from "../src/pocket"
import { Widget } from "../src/widget"
import { ContainerWidget } from "../src/widget_container"

// class TableWidget extends ContainerWidget {
//   headers:string[]
//   rows: Pocket<any>
//   constructor(headers, rows) {
//     super('table')
//     this.headers = headers
//     this.rows = new Pocket(rows)
//     this.buildTable()
//   }

//   buildTable() {
//     this.add(new Widget('tr', ...this.headers.map(header => `<th>${header}</th>`)))
//     this.rows.target.forEach((row, index) => {
//       const rowWidget = new Widget('tr', ...row.map(cell => `<td>@${cell}</td>`))
//       rowWidget.set_pocket(new Pocket(row))
//       this.add(rowWidget)
//       rowWidget.attribute({ style: { cursor: 'pointer' } })
//       rowWidget.event('click', () => this.editRow(index))
//     })
//   }

//   editRow(index) {
//     // Logika do edycji wiersza
//     console.log(`Edytowanie wiersza ${index}`)
//   }

//   addRow(row) {
//     this.rows.target.push(row)
//     this.build()
//   }

//   removeRow(index) {
//     this.rows.target.splice(index, 1)
//     this.build()
//   }

//   sortColumn(columnIndex) {
//     this.rows.target.sort((a, b) => a[columnIndex].localeCompare(b[columnIndex]))
//     this.build()
//   }
// }

// class EditableListWidget extends ContainerWidget {
//   pocket: Pocket<any>
//   template: Widget
//   constructor(template: Widget, items: string[]) {
//     super('ul')
//     this.template = template
//     this.pocket = new Pocket({items: items})

//     this.buildList()
//   }
//   wrap(value):Widget {
//     const itemWidget = new ContainerWidget('li')
//     const template = this.template.clone({with_events:true})

//     template.value(value)
//     itemWidget.attribute({ style: { margin: '5px', cursor: 'pointer' } })
//     itemWidget.event('click', () => itemWidget.destroy())

//     itemWidget.add(template)
//     return itemWidget
//   }
//   buildList() {
//     this.pocket.target.items.forEach((item, index) => {
//       this.add(this.wrap(item))
//     })
//   }
//   addItem(item) {
//     this.add(this.wrap(item))
//     }
// }

// const tasks = new Pocket({items:[
//     'Nauka JavaScript',
//     'Spotkanie z zespołem',
//     'Przygotowanie prezentacji'
// ]})

// // // Kontener dla listy zadań
// // const taskList = new ContainerWidget('ul')
// // taskList.render(() => tasks.target.items.map((task, index) => {
// //   const taskWidget = new Widget('li', `${task}`)
// //   taskWidget.event('click', () => {
// //       taskWidget.destroy()
// //       tasks.target.items.splice(index, 1)
// //         taskList.refresh()

// //     })
// //   return taskWidget
// // }))

// // // tasks.target.items.forEach((task, index) => {
// // //     const taskWidget = new Widget('li', `${task}`)
// // //     taskWidget.event('click', () => {
// // //         taskWidget.destroy()
// // //     })
// // //     taskList.add(taskWidget)
// // // })

// // // Funkcja do dodawania nowych zadań
// // const addTask = (newTask) => {
// //     tasks.target.items.push(newTask)

// //     taskList.refresh()
// //   }

// // // Widget do dodawania zadań
// const list = new EditableListWidget(new Widget('p', ''), [
//   'Nauka JavaScript',
//   'Spotkanie z zespołem',
//   'Przygotowanie prezentacji'
// ])
// const inputWidget = new Widget('input')
// const addButton = new Widget('button', 'Dodaj zadanie')
//   addButton.event('click', () => {
//   list.addItem(inputWidget.self['value'])
//     inputWidget.self['value'] = '' // Wyczyść pole po dodaniu zadania
// })
// // Dodanie elementów do głównego kontenera
// const appContainer = new ContainerWidget()
// appContainer.hook('app') // Załóżmy, że element 'app' istnieje w HTML
// appContainer.add(inputWidget)
// appContainer.add(addButton)
// appContainer.add(list)

// appContainer.build()

function highlightCode() {
  const codeBlocks = document.querySelectorAll('code');

  codeBlocks.forEach((block) => {
    let code = block.innerHTML;

    code = code
      .replace(/('[^']*'|"[^"]*")/g, '<span class="string">$1</span>') // Ciągi znaków
      .replace(/\b(\d+)\b/g, '<span class="number">$1</span>') // Liczby
      .replace(/(\/\/[^\n]*)/g, '<span class="comment">$1</span>') // Komentarze
      .replace(/\b(function|return|var|const|let|if|else|for|while|switch|case|break)\b/g, '<span class="keyword">$1</span>') // Słowa kluczowe
      .replace(/\b(console|log|greet|event)\b/g, '<span class="function">$1</span>'); // Nazwy funkcji

    block.innerHTML = code;
  });
}
document.addEventListener('DOMContentLoaded', highlightCode);


const header = new ContainerWidget()
const title = new Widget('p', 'Hello in **Events** Section')
let snippet  = new Widget('div', `\`\`\`const clicker = new Widget('span', 'I am button, click me 😏!')
const names = ["Ben", "Bob", "Jon", "Carno", "racuch"]
let i = 0
const span = new Widget('span')
const pocket = new Pocket({  name: ''  })
pocket.set_setter_callback((target) => {
  console.log(target)
  span.render()
})
span.show = () => pocket.target.name != 'racuch'
span.value = () => "Hello! \\*\${pocket.target.name}\\* here"
const name = 'romek'
pocket.target.name = name

clicker.event('click', () => {
  pocket.target.name = names[i++ % names.length]
  console.log('D.U.P.A')
})
\`\`\``)
header.add(title)
header.add(snippet)

new Widget('p.button', 'I am button, click me change name😏!')
  .event('click', () => {
    console.log('D.U.P.A ' + i % names.length)
    pocket.target.name = names[Math.abs(pocket.target.reverse ? --i : ++i) % names.length]
}).hook(header)

new Widget('p', 'I am button, click me reverse queueueueueu 😏!')
.event('click', () => {
  pocket.target.reverse = !pocket.target.reverse
  console.log('D.U.P.A')
}).hook(header)

const names = ["Ben", "Bob", "Jon", "Carno", "Racuch"]
let i = 0
const span = new Widget('span').hook(header)
const pocket = new Pocket({  name: '', reverse: false  })
pocket.set_setter_callback((target) => {
  console.log(target)
  span.render()
})
span.show = () => pocket.target.name != 'Racuch'
span.value = () => `Hello! *${pocket.target.name}* here`
pocket.target.name = 'romek'

header.hook('app')
