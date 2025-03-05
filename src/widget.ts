import { instances } from "./d"
import { randomBytes } from 'crypto-browserify'

import { ContainerWidget } from "./widget_container"
import { string_contain } from "./utils"



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


export type clone_options_t = {
  with_events?: boolean
}

export const DEFAULT_CLONE_OPTIONS: clone_options_t = {
  with_events: true
}


type element_class_operator_t = {
  add: (class_name: string) => void
  toggle: (class_name: string) => void
  remove: (class_name: string) => void
}

export type render_options_t = {
  with_attributes: boolean,
  with_markdown: boolean
}

export const DEFAULT_RENDER_OPTIONS: render_options_t = {
  with_attributes: true,
  with_markdown: true
}

const element_class_operators = (self: HTMLElement): element_class_operator_t => {
  return {
    add: (class_name) => self.classList.add(class_name),
    toggle: (class_name) => self.classList.toggle(class_name),
    remove: (class_name) => self.classList.remove(class_name)
  }
}


export class Widget {
  tag: string
  self: HTMLElement
  root: HTMLElement
  #value: (() => string) | string
  #attribute: (() => attr_t) | attr_t
  events: [string, (event: Event) => void][] = []
  style: CSSStyleDeclaration
  class: element_class_operator_t
  //states 
  pinned: boolean = false
  //functions
  show: () => boolean = null
  check_instance = () => 'widget'
  readonly query: string
  readonly hash: string

  constructor(tag: string = 'div', value: (() => string) | string = '') {
    let tag_class_exclusives = []

    if (string_contain(tag, '.')) {
      tag_class_exclusives = tag.split('.')
      tag = tag_class_exclusives.shift()
    }

    this.tag = tag
    this.hash = randomBytes(4).toString('hex')
    this.query = `${this.tag}[v=${this.hash}]`

    this.self = document.createElement(tag)
    this.class = element_class_operators(this.self)
    this.style = this.self.style
    this.value = value
    this.self.setAttribute('v', `${this.hash}`)

    for (const class_param of tag_class_exclusives) {
      this.class.add(class_param)
    }
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
      if (this.self.attributes[i].name == 'v') continue
      this.self.removeAttribute(this.self.attributes[i].name)
    }
  }
  protected apply_attributes_by_object(attributes: attr_t) {
    for (const index in attributes) {
      this.self.setAttribute(index.toString(), attributes[index].toString())
    }
  }
  protected render_display(): boolean {
    if (!this.show) return true
    if (this.show()) {
      this.self.style.display = 'block'
      return true
    } else {
      this.self.style.display = 'none'
      return false
    }
  }

  render(render_options: render_options_t = DEFAULT_RENDER_OPTIONS) {
    if (!render_options.with_attributes) {
      this.remove_all_attributes()
    }

    this.render_display()
    if (render_options.with_markdown) {
      this.self.innerHTML = this.convert_markdown_to_html(this.value)
    } else {
      this.self.innerHTML = this.value
    }

    this.apply_attributes_by_object(this.attribute)

    return this
  }
  event(event_name: string, callback: (event: Event) => void): this {
    this.events.push([event_name, callback])
    this.self.addEventListener(event_name, (event) => callback(event))
    return this
  }
  unhook() {
    if (!this.pinned) return this

    this.pinned = false
    this.root.removeChild(this.self)
  }
  hook(query?: string | Element | ContainerWidget) {
    if (this.pinned) return this

    if (!query && !!this.root) {
      this.root.append(this.self)
    }

    if (query instanceof Widget && query.check_instance() == instances.CONTAINER_WIDGET) {
      query.add(this)
    } else {
      const root = (typeof (query) == 'string' ? document.querySelector(query) : query) as HTMLElement
      this.pinned = true

      if (this.check_instance() == instances.CONTAINER_WIDGET) {
        (this as unknown as ContainerWidget).build_all() // really bad code, idk how to do this better
      }
      this.root = root as HTMLElement
      this.root.append(this.self)
    }

    return this
  }
  show_when(callback?: () => boolean) {
    this.show = callback
    this.render_display()
  }
  clone(clone_options: clone_options_t = DEFAULT_CLONE_OPTIONS) {
    const widget = new Widget(this.tag)
    widget.attribute = this.#attribute
    widget.value = this.#value
    widget.show = this.show
    widget.events = [...this.events]

    if (clone_options.with_events)
      this.events.forEach(([event_name, callback]) => {
        this.self.addEventListener(event_name, (event) => callback(event))
      })

    return widget
  }
}
