import { attributes_t, instances, widget_render_option_t } from "./d"
import { createHash, randomBytes } from 'crypto-browserify'
import { Pocket } from "./pocket"
import { validateLocaleAndSetLanguage } from "typescript"
import { ContainerWidget } from "./widget_container"



type attr_value_t = string | number | boolean | null
type attr_t = { [index: string]: attr_value_t }

// const read_nest = (object: { [index: string]: any }, address: string | string[]) => {
//   if (typeof address == 'string')
//     address = address.split('.')

//   const address_step = address.shift()

//   if (address_step)
//     return read_nest(object[address_step], address)
//   else
//     return object
// }
// const set_nest = (object: { [index: string]: any }, address: string | string[], value: any) => {
//   if (typeof address == 'string')
//     address = address.split('.')

//   const address_step = address.shift()
//   if (address_step)

//     if (address.length > 1)
//       read_nest(object[address_step], address)
//     else
//       object[address_step] = value
// }


type clone_options_t = {
  with_events?: boolean
}

export class Widget {
  tag: string
  self: HTMLElement
  #value: (() => string) | string
  #attribute: (() => attr_t) | attr_t
  events: [string, (event: Event) => void][] = []
  //states 
  pinned: boolean = false
  //functions
  show: () => boolean = null
  check_instance = () => 'widget'
  readonly query: string
  readonly hash: string

  constructor(tag: string = 'div', value: (() => string) | string = '') {
    if (tag.indexOf('.') != -1) {
      const params = tag.split('.')
      tag = params.shift()
        this.attribute = {
          class: params.join(' ')
        }
    }
    this.tag = tag
    this.hash = randomBytes(4).toString('hex')
    this.query = `${this.tag}[v=${this.hash}]`

    this.self = document.createElement(tag)
    this.value = value
    this.self.setAttribute('v', `${this.hash}`)
  }

  get value(): string {
    if (typeof (this.#value) == 'function')
      return this.#value()
    return this.#value
  }
  set value(text: (() => string) | string) {
    this.#value = text
  }

  set attribute(attr: (() => attr_t) | attr_t) {
    this.#attribute = attr
  }
  get attribute(): attr_t {
    if (typeof this.#attribute === 'function')
      return this.#attribute()
    return this.#attribute
  }

  protected convert_markdown_to_html(text: string): string {
    text = text
      .replace(/(?<!\\)\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/(?<!\\)\*(.*?)\*/g, '<i>$1</i>')    
      .replace(/(?<!\\)```([\S\s]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/(?<!\\)`(.*?)`/g, '<code>$1</code>')
      .replace(/(?<!\\)__(.*?)__/g, '<u>$1</u>')    
      .replace(/(?<!\\)~~(.*?)~~/g, '<s>$1</s>')    
      .replace(/(?<!\\)^# (.*$)/gim, '<h1>$1</h1>') 
      .replace(/(?<!\\)^## (.*$)/gim, '<h2>$1</h2>') 
      .replace(/(?<!\\)^### (.*$)/gim, '<h3>$1</h3>') 
      .replace(/(?<!\\)^#### (.*$)/gim, '<h4>$1</h4>') 
      .replace(/(?<!\\)^##### (.*$)/gim, '<h5>$1</h5>') 
      .replace(/(?<!\\)^###### (.*$)/gim, '<h6>$1</h6>') 
      .replace(/(?<!\\)\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      .replace(/\\([_*`~[\]()])/g, '$1');
  
    return text;
  }

  protected remove_all_attributes() {
    for (let i = this.self.attributes.length - 1; i >= 0; i--) {
      if(this.self.attributes[i].name == 'v') continue
      this.self.removeAttribute(this.self.attributes[i].name)
    }
  }
  protected convert_object_to_attributes(attributes: attr_t) {
    for (const index in attributes) {
      this.self.setAttribute(index.toString(), attributes[index].toString())
    }
  }
  protected rerender_display(): boolean {
    if (!this.show) return true
    if (this.show()) {
      this.self.style.display = 'block'
      return true
    }
    else {
      this.self.style.display = 'none'
      return false
    }
  }

  render() {
    this.remove_all_attributes()

    this.rerender_display()
    this.self.innerHTML = this.convert_markdown_to_html(this.value)

    this.convert_object_to_attributes(this.attribute)

    return this
  }
  event(event_name: string, callback: (event: Event) => void): this {
    this.events.push([event_name, callback])
    this.self.addEventListener(event_name, (event) => callback(event))
    return this
  }
  hook(query: string | Element | ContainerWidget) {
    if (query instanceof Widget && query.check_instance() == instances.CONTAINER_WIDGET){
      query.add(this)
      return this
    }
    const hook = (typeof (query) == 'string' ? document.querySelector(query) : query ) as Element
    this.pinned = true
    console.log()
    if (this.check_instance() == instances.CONTAINER_WIDGET){
      (this as unknown as ContainerWidget).build() // really bad code
    }
    hook.append(this.self)
    return this
  }
  show_when(callback?: () => boolean) {
    this.show = callback
    this.rerender_display()
  }
  clone(clone_options?: clone_options_t) {
    const widget = new Widget(this.tag)
    widget.attribute = this.#attribute
    widget.value = this.#value
    widget.show = this.show
    widget.events = [...this.events]
    if (clone_options?.with_events)
      this.events.forEach(([event_name, callback]) => {
        this.self.addEventListener(event_name, (event) => callback(event))
      })
    return widget
  }
  destroy() {
    this.pinned = false
    this.self.remove()
  }
}
