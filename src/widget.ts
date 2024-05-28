import { attributes_t, widget_render_option_t } from "./d"
import { createHash, randomBytes } from 'crypto-browserify'
import { Pocket } from "./pocket"
import { validateLocaleAndSetLanguage } from "typescript"

const read_nest = (object: { [index: string]: any }, address: string | string[]) => {
  if (typeof address == 'string')
    address = address.split('.')

  const address_step = address.shift()

  if (address_step)
    return read_nest(object[address_step], address)
  else
    return object
}
const set_nest = (object: { [index: string]: any }, address: string | string[], value: any) => {
  if (typeof address == 'string')
    address = address.split('.')

  const address_step = address.shift()
  if (address_step)

    if (address.length > 1)
      read_nest(object[address_step], address)
    else
      object[address_step] = value
}
const change_key_to_attr_style = (key) => {
  return key.replaceAll(/([a-z])([A-Z])/gm, '$1-$2').toLowerCase()
}
// TODO dynamiczne zmiany wartości - w tekście, w elementach oraz w atrybutach
// wykorzystanie proxy

type dynamic_t = {
  value?: string[]
  condition?: string[]
  attributes?: string[]
}

export class Widget {
  tag: string
  self: HTMLElement
  setup: boolean = true
  #value: string[]
  pocket: Pocket<any> = null
  dynamic: dynamic_t = {}
  attr: { [index: string]: any }
  show_condition: () => boolean = null

  readonly query: string
  readonly hash: string

  set_pocket<T extends object>(value: Pocket<T>) {
    this.pocket = value
    return this.pocket
  }
  private proxy_getter(callback: () => void) {
    this.pocket.set_getter_callback(callback)
  }
  private proxy_setter(callback: () => void) {
    this.pocket.set_setter_callback(callback)
  }
  constructor(tag: string = 'div', ...value: string[]) {
    this.tag = tag
    this.hash = randomBytes(4).toString('hex')
    this.query = `${this.tag}[v=${this.hash}]`

    this.self = document.createElement(tag)
    this.value(...value)
    this.self.setAttribute('v', `${this.hash}`)
  }

  private  convertMarkdownToHtml(text: string): string{
      text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.*?)\*/g, '<i>$1</i>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/~~(.*?)~~/g, '<s>$1</s>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
  
  
    return text
  }

  private dynamic_string(value: string): [(string[] | null), string] {
    const dynamic_elements = Array.from(value
      .matchAll(/(?<!\\)\@([\w+\.?]+)/g)).map(item => item[1])
    //.filter((value, index, array) => array.indexOf(value) == index)

    if (this.pocket) {
      let dynamic_value = value
      dynamic_elements.forEach((item) => {
        const target = read_nest(this.pocket.target, item) || ''
        if (typeof target == 'function')
          dynamic_value = dynamic_value.replace(new RegExp(`(?<!\\\\)\@${item}`), target(value)
            .replaceAll(/(?<!\\)\@([\w+\.?]+)/g, '')) // <-- option
        dynamic_value = dynamic_value.replace(new RegExp(`(?<!\\\\)\@${item}`), target)
      })
      return [dynamic_elements, dynamic_value.replaceAll(/(?<!\\)\\/g, '')]
    } else {
      return [dynamic_elements, value.replaceAll(/(?<!\\)\\/g, '')]
    }
  }
  value(...value: string[]) {

    if (value.length == 0) {
      value = this.#value || ['']
    }
    else {
      this.#value = value
    }

    let [dynamic_elements, content] = this.dynamic_string((this.#value || ['']).join(''))
    this.dynamic.value = dynamic_elements
    this.self.innerHTML = this.convertMarkdownToHtml(content)
    return this
  }
  attribute(attr?: { [index: string]: any }) {
    this.attr = attr

    Object.entries(this.attr)?.forEach(([key, value]) => {
      if (key == 'v') return
      if (typeof value == 'object') {
        value = Object.entries(value).map(([key, value]) => {
          value = value.toString()
          return `${change_key_to_attr_style(key)}:${value}`
        }).join(';')
      }
      const [dynamic_elements, dynamic_value] = this.dynamic_string(value.toString())
      this.dynamic.attributes = dynamic_elements
      this.self.setAttribute(key, dynamic_value)
    })
    return this
  }
  event(event_name: string, callback: (event: Event) => void) {
    this.self.addEventListener(event_name, (event) => callback(event))
  }
  hook(query: string) {
    const hook = document.querySelector(query)
    hook.append(this.self)
    return this
  }
  show_if(callback?: () => boolean) {
    this.show_condition = callback
    this.dynamic.condition = Array.from(callback.toString()
      .matchAll(/target\.(\S+)/g)).map(item => item[1])

    if (callback())
      this.self.style.display = 'block'
    else
      this.self.style.display = 'none'
  }
  destroy() {
    this.self.remove()
  }
  build() {
    this.value()
    if (this.attr)
      this.attribute(this.attr)
    if (this.show_condition)
      this.show_if(this.show_condition)

  }
}
