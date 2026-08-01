import { randomBytes } from 'crypto-browserify'

// NOTE: ContainerWidget import removed to break circular dependency
// (widget.ts ↔ widget_container.ts). Duck-type check used in hook() instead.
import { string_contain } from "../utils/utils"
import { text_to_markdown } from "./markdown"
import { attributes_t, clone_options_t, widget_render_option_t } from "../types"

export type { clone_options_t } from "../types"

export const DEFAULT_CLONE_OPTIONS: clone_options_t = {
  with_events: true
}

const get_value_from_function_or_property =
  <T>(maybe_function: (() => T) | T): T => {
    if (typeof (maybe_function) == 'function') {
      return (maybe_function as Function)()
    }
    return maybe_function
  }

type element_class_operator_t = {
  add: (class_name: string) => void
  toggle: (class_name: string) => void
  remove: (class_name: string) => void
}

export type render_options_t = widget_render_option_t

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

/**
 * Core UI building block – represents a single HTML element.
 * 
 * Supports Emmet-like syntax (e.g. `"button.btn.btn-primary"`),
 * dynamic content via callback, Markdown rendering, event binding, and cloning.
 * 
 * @example
 * ```ts
 * const btn = new Widget("button.btn", "Click me!")
 * btn.event("click", () => console.log("clicked!"))
 * btn.hook("body")
 * ```
 */
export class Widget {
  /** HTML tag name (e.g. "div", "button") */
  tag: string
  /** The actual DOM element */
  self: HTMLElement
  /** Parent node in the DOM tree */
  root!: HTMLElement
  #content!: (() => string) | string
  #attribute!: (() => attributes_t) | attributes_t
  #markdown_content: boolean | null = null
  /** Registered event listeners */
  events: [string, (event: Event) => void][] = []
  /** CSS class operators (add, toggle, remove) */
  class: element_class_operator_t
  /** Inline style – always refers to `this.self.style` (getter) */
  get style(): CSSStyleDeclaration { return this.self.style }
  //states 
  /** Whether the widget is attached to the DOM */
  pinned: boolean = false
  //functions
  /** Conditional display callback (show_when) */
  show: (() => boolean) | null = null
  /** CSS selector to locate the element in the DOM (tag[v=hash]) */
  readonly query: string
  /** Unique widget identifier (8 hex characters) */
  readonly hash: string

  /**
   * @param tag - HTML tag, optionally with dot-separated classes (e.g. `"div.card.shadow"`)
   * @param value - text content or a function returning content (dynamic)
   */
  constructor(tag: string = 'div', value: (() => string) | string = '') {
    let tag_class_exclusives: string[] = []

    if (string_contain(tag, '.')) {
      tag_class_exclusives = tag.split('.')
      tag = tag_class_exclusives.shift() || 'div'
    }
    
    this.tag = tag || 'div'

    this.hash = randomBytes(4).toString('hex')
    this.query = `${this.tag}[v=${this.hash}]`

    this.self = document.createElement(tag)
    this.class = element_class_operators(this.self)
    this.content = value
    this.self.setAttribute('v', `${this.hash}`)

    for (const class_param of tag_class_exclusives) {
      this.class.add(class_param)
    }
  }

  /** Whether content should be parsed as Markdown (overrides render_options.with_markdown) */
  get markdown_content() {
    return this.#markdown_content
  }
  set markdown_content(value: boolean | null) {
    this.#markdown_content = value
  }

  /** Current text content of the widget (calls the callback if a function was provided) */
  get content(): string {
    return get_value_from_function_or_property(this.#content)
  }
  set content(text: (() => string) | string) {
    this.#content = text
  }
  /** HTML attributes of the widget (object or function returning an object) */
  set attribute(attr: (() => attributes_t) | attributes_t) {
    this.#attribute = attr
  }
  get attribute(): attributes_t {
    return get_value_from_function_or_property(this.#attribute)
  }

  /**
   * Sets a single HTML attribute (fluent API).
   * @param key - attribute name (e.g. "id", "data-value")
   * @param value - the value; `null` removes the attribute, `false`/`undefined` skips
   * @returns `this` – enables chaining
   */
  attr(key: string, value: string | number | boolean | null): this {
    if (value === null) {
      this.self.removeAttribute(key)
    } else if (value !== false && value !== undefined) {
      this.self.setAttribute(key, String(value))
    }
    return this
  }

  /**
   * Sets multiple HTML attributes at once (fluent API).
   * @param attributes - object mapping names to values
   * @returns `this` – enables chaining
   */
  attrs(attributes: attributes_t): this {
    for (const key in attributes) {
      this.attr(key, attributes[key])
    }
    return this
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
  protected apply_attributes_by_object(attributes: attributes_t) {
    for (const key in attributes) {
      this.attr(key, attributes[key])
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

  /**
   * Renders the widget into the DOM (innerHTML + attributes + conditional display).
   * @returns `this` – enables chaining
   */
  render(render_options: render_options_t = DEFAULT_RENDER_OPTIONS) {
    if (!render_options.with_attributes) {
      this.remove_attributes()
    }

    this.render_display()
    if (this.#markdown_content == null) {
      if (render_options.with_markdown) {
        this.self.innerHTML = this.convert_markdown_to_html(this.content)
      } else {
        this.self.innerHTML = this.content
      }
    } else {
      if (this.#markdown_content) {
        this.self.innerHTML = this.convert_markdown_to_html(this.content)
      } else {
        this.self.innerHTML = this.content
      }
    }

    this.apply_attributes_by_object(this.attribute)

    return this
  }
  /**
   * Registers an event listener on the DOM element.
   * @param event_name - event name (e.g. "click", "input")
   * @param callback - function called when the event fires
   * @returns `this` – enables chaining
   */
  event(event_name: string, callback: (event: Event) => void): this {
    this.events.push([event_name, callback])
    this.self.addEventListener(event_name, (event) => callback(event))
    return this
  }
  /** Detaches the widget from the DOM (removes the element from its parent) */
  unhook() {
    if (!this.pinned) return this

    this.pinned = false
    this.root.removeChild(this.self)
    return this
  }
  /**
   * Attaches the widget to the DOM.
   * @param query - CSS selector, DOM element, or ContainerWidget
   * @returns `this` – enables chaining
   */
  hook(query?: string | Element | { add: (w: Widget, r?: boolean, h?: boolean) => any, self: HTMLElement, build_all?: () => void }) {
    if (this.pinned) return this

    if (!query && !!this.root) {
      this.root.append(this.self)
      this.pinned = true
      return this
    }

    // Duck-type check for ContainerWidget (avoids circular import)
    if (query && typeof query === 'object' && 'add' in query && 'self' in query && !(query instanceof Element)) {
      query.add(this, true, true)
      this.pinned = true
      this.root = query.self
    } else {
      const root = (typeof (query) == 'string' ? document.querySelector(query) : query) as HTMLElement
      this.root = root as HTMLElement
      this.root.append(this.self)
      this.pinned = true

      if ('build_all' in this && typeof (this as any).build_all === 'function') {
        (this as any).build_all()
      }
    }
    return this
  }
  /**
   * Conditional display of the widget.
   * @param callback - function returning `true` (visible) or `false` (display: none)
   */
  show_when(callback?: () => boolean) {
    this.show = callback
    this.render_display()
  }
  /**
   * Creates a deep copy of the widget (new DOM element, new hash).
   * @param clone_options - cloning options (defaults to copying events)
   * @returns a new Widget instance
   */
  clone(clone_options: clone_options_t = DEFAULT_CLONE_OPTIONS) {
    const widget = new Widget(this.tag)

    widget.self = (this.self.cloneNode(true) as HTMLElement)
    widget.self.setAttribute('v', widget.hash)
    widget.class = element_class_operators(widget.self)

    widget.attribute = this.#attribute
    widget.content = this.#content
    widget.markdown_content = this.#markdown_content
    widget.show = this.show
    widget.events = [...this.events]

    if (clone_options.with_events)
      this.events.forEach(([event_name, callback]) => {
        widget.self.addEventListener(event_name, (event) => callback(event))
      })

    return widget
  }
}
