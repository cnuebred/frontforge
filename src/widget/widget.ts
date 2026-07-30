import { randomBytes } from 'crypto-browserify'

import { ContainerWidget } from "./widget_container"
import { string_contain } from "../utils/utils"
import { text_to_markdown } from "./markdown"

type attr_value_t = string | number | boolean | null
type attr_t = { [index: string]: attr_value_t }

export type clone_options_t = {
  with_events?: boolean
}

export const DEFAULT_CLONE_OPTIONS: clone_options_t = {
  with_events: true
}

// to move

const get_value_from_function_or_property =
  <T>(maybe_function: (() => T) | T): T => {
    if (typeof (maybe_function) == 'function') {
      return (maybe_function as Function)()
    }
    return maybe_function
  }

// to move 


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
  #content: (() => string) | string
  #attribute: (() => attr_t) | attr_t
  #markdown_content: boolean = null
  events: [string, (event: Event) => void][] = []
  style: CSSStyleDeclaration // buuu CamelCase :<
  class: element_class_operator_t
  //states 
  pinned: boolean = false
  //functions
  show: () => boolean = null
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
    this.content = value
    this.self.setAttribute('v', `${this.hash}`)

    for (const class_param of tag_class_exclusives) {
      this.class.add(class_param)
    }
  }

  get markdown_content() {
    return this.#markdown_content
  }
  set markdown_content(value: boolean) {
    this.#markdown_content = value
  }

  get content(): string {
    return get_value_from_function_or_property(this.#content)
  }
  set content(text: (() => string) | string) {
    this.#content = text
  }
  set attribute(attr: (() => attr_t) | attr_t) {
    this.#attribute = attr
  }
  get attribute(): attr_t {
    return get_value_from_function_or_property(this.#attribute)
  }

  protected convert_markdown_to_html(text: string): string {
    return text_to_markdown(text)
  }
  protected remove_attributes(...except: string[]) {
    for (let i = this.self.attributes.length - 1; i >= 0; i--) {
      if (this.self.attributes[i].name == 'v') continue
      if (except.includes(this.self.attributes[i].name)) continue
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
      this.remove_attributes()
    }

    this.render_display()
    if(this.#markdown_content == null || this.#markdown_content == undefined){
      if (render_options.with_markdown) {
        this.self.innerHTML = this.convert_markdown_to_html(this.content)
      } else {
        this.self.innerHTML = this.content
      }
    }else{
      if (this.#markdown_content) {
        this.self.innerHTML = this.convert_markdown_to_html(this.content)
      } else {
        this.self.innerHTML = this.content
      }
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

    if (query instanceof ContainerWidget) {
      query.add(this)
    } else {
      const root = (typeof (query) == 'string' ? document.querySelector(query) : query) as HTMLElement
      this.pinned = true

      if (this instanceof ContainerWidget) {
        (this as unknown as ContainerWidget).build_all() // really bad code, idk how to do this better
      }
      this.root = root as HTMLElement
      this.root.append(this.self)
    }
    // TODO add more functions to events handler
    // worker after build all or sth like this
    return this
  }
  show_when(callback?: () => boolean) {
    this.show = callback
    this.render_display()
  }
  clone(clone_options: clone_options_t = DEFAULT_CLONE_OPTIONS) {
    const widget = new Widget(this.tag)

    widget.self = (this.self.cloneNode(true) as HTMLElement)
    widget.self.setAttribute('v', widget.hash)
    widget.style = widget.self.style
    
    widget.attribute = this.#attribute
    widget.content = this.#content
    widget.show = this.show
    widget.events = [...this.events]

    if (clone_options.with_events)
      this.events.forEach(([event_name, callback]) => {
        widget.self.addEventListener(event_name, (event) => callback(event))
      })

    return widget
  }
}
