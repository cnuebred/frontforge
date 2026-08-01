import {  DEFAULT_RENDER_OPTIONS, render_options_t, Widget } from "./widget"

/**
 * Widget container – manages a group of elements as a collection.
 * 
 * Extends {@link Widget}, so it is itself a DOM element.
 * Provides array-like operations (add, remove, foreach, map) on children.
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
  /** Callback returning the current list of children (for dynamic views) */
  widgets: () => Widget[] = () => []

  /** Number of children in the container */
  get size() {
    return this.#children.length
  }

  /**
   * @param tag - HTML tag for the container (defaults to "div")
   */
  constructor(tag: string = 'div') {
    super(tag, '')
  }
  /** Removes all children from the DOM and clears the collection */
  clear() {
    this.#children.forEach(item => item.unhook())
    this.#children = []
  }
  /** 
   * Replaces the entire child collection with a new array.
   * Old children are detached from the DOM.
   * @returns `this` – enables chaining
   */
  set(widgets: (Widget | ContainerWidget)[]): this {
    this.clear()
    this.#children = widgets
    return this
  }
  /** Iterates over all children (like Array.forEach) */
  foreach(callback: (item: Widget | ContainerWidget, index: number, arr: (Widget | ContainerWidget)[]) => void) {
    this.#children.forEach(callback)
  }
  /** 
   * Maps children to a new collection (like Array.map).
   * Old children are detached from the DOM, new ones are rendered and attached.
   * @returns `this` – enables chaining
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
   * Renders the container and all its children.
   * @returns `this` – enables chaining
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
   * Adds a widget to the container.
   * @param widget - widget to add
   * @param with_render - whether to immediately call `render()` on the widget
   * @param with_hook - whether to immediately attach the widget to the container's DOM
   * @returns `this` – enables chaining
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
   * Removes a widget from the container (by hash) and detaches it from the DOM.
   * @returns `this` – enables chaining
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
   * Finds a widget by its hash.
   * @returns the found widget or `undefined`
   */
  find(hash: string): Widget | undefined {
    return this.#children.find(item => item.hash === hash)
  }

  /**
   * Gets a widget by its index (like array access).
   * @returns the widget at the given position or `undefined`
   */
  get(index: number): Widget | undefined {
    return this.#children[index]
  }

  /**
   * Filters children, removing those that do not pass the test.
   * Rejected widgets are detached from the DOM.
   * @returns `this` – enables chaining
   */
  filter(callback: (item: Widget, index: number, arr: Widget[]) => boolean): this {
    const rejected = this.#children.filter((item, i, arr) => !callback(item, i, arr))
    rejected.forEach(item => item.unhook())
    this.#children = this.#children.filter(callback)
    return this
  }

  /**
   * Removes the widget at the given index and detaches it from the DOM.
   * @returns `this` – enables chaining
   */
  remove_at(index: number): this {
    if (index >= 0 && index < this.#children.length) {
      this.#children[index].unhook()
      this.#children.splice(index, 1)
    }
    return this
  }

  /**
   * Inserts a widget at the given position (0 = beginning).
   * Optionally renders and attaches to the DOM.
   * @returns `this` – enables chaining
   */
  insert_at(index: number, widget: Widget, with_render?: boolean, with_hook?: boolean): this {
    this.#children.splice(index, 0, widget)
    if (with_render) widget.render()
    if (with_hook) widget.hook(this.self)
    return this
  }
  /**
   * Push a widget at the last position.
   * Optionally renders and attaches to the DOM.
   * @returns `this` – enables chaining
   */
  push(widget: Widget, with_render?: boolean, with_hook?: boolean): this {
    this.#children.push(widget)
    if (with_render) widget.render()
    if (with_hook) widget.hook(this.self)
    return this
  }

  /**
   * Builds all children – renders and attaches them to the container's DOM.
   * Useful when first attaching the container to the DOM.
   * @param with_markdown - whether to parse Markdown in children's content (default: true)
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

  /**
   * Refreshes the container live – detaches all children from the DOM,
   * re-renders them, and re-attaches them.
   * 
   * Useful when data has changed but you don't want to create new widgets.
   * 
   * @param with_markdown - whether to parse Markdown (default: true)
   * @returns `this` – enables chaining
   * 
   * @example
   * ```ts
   * // After changing data in the model:
   * data.items.push(newItem)
   * container.refresh()
   * ```
   */
  refresh(with_markdown: boolean = true): this {
    const children = this.#children.filter(item => !!item)
    children.forEach(item => item.unhook())
    children.forEach(item => {
      item.render({
        with_attributes: true,
        with_markdown: with_markdown
      })
      item.hook(this.self)
    })
    return this
  }
}
