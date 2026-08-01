import {  DEFAULT_RENDER_OPTIONS, render_options_t, Widget } from "./widget"

/**
 * Kontener na widgety – zarządza grupą elementów jako kolekcją.
 * 
 * Dziedziczy po {@link Widget}, więc sam też jest elementem DOM.
 * Umożliwia operacje tablicowe (add, remove, foreach, map) na dzieciach.
 * 
 * @example
 * ```ts
 * const list = new ContainerWidget("ul.list")
 * list.add(new Widget("li", "Item 1"))
 * list.add(new Widget("li", "Item 2"))
 * list.hook("body")
 * ```
 */
export class ContainerWidget extends Widget {
  #children: Widget[] = []
  /** Callback zwracający aktualną listę dzieci (do dynamicznych widoków) */
  widgets: () => Widget[]

  /** Liczba dzieci w kontenerze */
  get size() {
    return this.#children.length
  }

  /**
   * @param tag - znacznik HTML kontenera (domyślnie "div")
   */
  constructor(tag: string = 'div') {
    super(tag, '')
  }
  /** Usuwa wszystkie dzieci z DOM i czyści kolekcję */
  clear() {
    this.#children.forEach(item => item.unhook())
    this.#children = []
  }
  /** 
   * Zastępuje całą kolekcję dzieci nową tablicą.
   * Stare dzieci są odpinane z DOM.
   * @returns `this` – umożliwia chainowanie
   */
  set(widgets: (Widget | ContainerWidget)[]): this {
    this.clear()
    this.#children = widgets
    return this
  }
  /** Iteruje po wszystkich dzieciach (jak Array.forEach) */
  foreach(callback: (item: Widget | ContainerWidget, index: number, arr: (Widget | ContainerWidget)[]) => void) {
    this.#children.forEach(callback)
  }
  /** 
   * Mapuje dzieci na nową kolekcję (jak Array.map).
   * Stare dzieci są odpinane z DOM, nowe są renderowane i podpinane.
   * @returns `this` – umożliwia chainowanie
   */
  map(callback: (item: Widget | ContainerWidget, index: number, arr: (Widget | ContainerWidget)[]) => Widget | ContainerWidget): this {
    const tmp = [...this.#children]
    this.clear()
    this.#children = tmp.map(callback)
    this.#children.forEach(item => {
      item.render()
      item.hook(this.self)
    })
    return this
  }
  /**
   * Renderuje kontener i wszystkie dzieci.
   * @returns `this` – umożliwia chainowanie
   */
  render(render_options: render_options_t = DEFAULT_RENDER_OPTIONS) {
    if (!render_options.with_attributes) {
      this.remove_attributes()
    }
    this.render_display()
    const children = this.#children.filter(item => !!item)
    children.forEach(item => {
      item.render(render_options)
    })
    this.apply_attributes_by_object(this.attribute)
    return this
  }
  /**
   * Dodaje widget do kontenera.
   * @param widget - widget do dodania
   * @param with_render - czy od razu wywołać `render()` na widgecie
   * @param with_hook - czy od razu podpiąć widget do DOM kontenera
   * @returns `this` – umożliwia chainowanie
   */
  add(widget: Widget, with_render?: boolean, with_hook?: boolean) {
    this.#children.push(widget)
    
    if (with_render) {
      widget.render()
    }
    
    if (with_hook){
      widget.hook(this.self)
    }
    return this
  }
  /** 
   * Usuwa widget z kontenera (po hash-u) i odpina go z DOM.
   * @returns `this` – umożliwia chainowanie
   */
  remove(widget: Widget): this {
    const target = this.#children.find(item => item.hash === widget.hash)
    if (target) {
      target.unhook()
    }
    this.#children = this.#children.filter(item => item.hash !== widget.hash)
    return this
  }
  /**
   * Znajduje widget po hash-u.
   * @returns znaleziony widget lub `undefined`
   */
  find(hash: string): Widget | undefined {
    return this.#children.find(item => item.hash === hash)
  }

  /**
   * Pobiera widget po indeksie (jak dostęp tablicowy).
   * @returns widget na danej pozycji lub `undefined`
   */
  get(index: number): Widget | undefined {
    return this.#children[index]
  }

  /**
   * Filtruje dzieci, usuwając te które nie przechodzą testu.
   * Odrzucone widgety są odpinane z DOM.
   * @returns `this` – umożliwia chainowanie
   */
  filter(callback: (item: Widget, index: number, arr: Widget[]) => boolean): this {
    const rejected = this.#children.filter((item, i, arr) => !callback(item, i, arr))
    rejected.forEach(item => item.unhook())
    this.#children = this.#children.filter(callback)
    return this
  }

  /**
   * Usuwa widget na podanym indeksie i odpina go z DOM.
   * @returns `this` – umożliwia chainowanie
   */
  remove_at(index: number): this {
    if (index >= 0 && index < this.#children.length) {
      this.#children[index].unhook()
      this.#children.splice(index, 1)
    }
    return this
  }

  /**
   * Wstawia widget na podaną pozycję (0 = początek).
   * Opcjonalnie renderuje i podpina do DOM.
   * @returns `this` – umożliwia chainowanie
   */
  insert_at(index: number, widget: Widget, with_render?: boolean, with_hook?: boolean): this {
    if (with_render) widget.render()
    if (with_hook) widget.hook(this.self)
    this.#children.splice(index, 0, widget)
    return this
  }

  /**
   * Buduje wszystkie dzieci – renderuje i podpina do DOM kontenera.
   * Przydatne przy pierwszym podpięciu kontenera do DOM.
   * @param with_markdown - czy parsować Markdown w treści dzieci (domyślnie: true)
   */
  build_all(with_markdown: boolean = true) {
    const children = this.#children.filter(item => !!item)
    children.forEach(item => {
      item.render({
        with_attributes: true,
        with_markdown: with_markdown
      })
      item.hook(this.self)
    })
  }
}
