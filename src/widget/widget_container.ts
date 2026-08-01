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
  /** Zastępuje całą kolekcję dzieci nową tablicą */
  set(widgets: (Widget | ContainerWidget)[]){
    this.#children = widgets
  }
  /** Iteruje po wszystkich dzieciach (jak Array.forEach) */
  foreach(callback: (item: Widget | ContainerWidget, index: number, arr: (Widget | ContainerWidget)[]) => void) {
    this.#children.forEach(callback)
  }
  /** Mapuje dzieci na nową kolekcję (jak Array.map) – czyści przed podmianą */
  map(callback: (item: Widget | ContainerWidget, index: number, arr: (Widget | ContainerWidget)[]) => Widget | ContainerWidget) {
    const tmp = [...this.#children]
    this.clear()
    this.#children = tmp.map(callback)
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
  /** Usuwa widget z kontenera (po hash-u) */
  remove(widget: Widget) {
    this.#children = this.#children.filter(item => item.hash != widget.hash)
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
