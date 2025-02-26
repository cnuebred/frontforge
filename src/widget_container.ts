import { attributes_t, widget_render_option_t } from "./d"
import { Pocket } from "./pocket"
import { DEFAULT_CLONE_OPTIONS, DEFAULT_RENDER_OPTIONS, render_options_t, Widget } from "./widget"

export class ContainerWidget extends Widget {
  #children: Widget[] = []
  widgets: () => Widget[]
  check_instance = () => 'container_widget'

  constructor(tag: string = 'div') {
    super(tag, '')
  }
  clear() {
    this.#children.forEach(item => item.unhook())
    this.#children = []
  }
  foreach_children(callback: (item: Widget | ContainerWidget, index: number) => void) {
    this.#children.forEach(callback)
  }
  render(render_options: render_options_t = DEFAULT_RENDER_OPTIONS) {
    if (!render_options.with_attributes) {
      this.remove_all_attributes()
    }
    this.render_display()
    const children = this.#children.filter(item => !!item)
    children.forEach(item => {
      item.render(render_options)
    })
    this.apply_attributes_by_object(this.attribute)
    return this
  }
  add(widget: Widget, with_render?: boolean, with_hook?: boolean) {
    this.#children.push(widget)
    
    if (with_render) {
      widget.render()
    }
    
    if (with_hook){
      widget.hook(this.self)
    }
  }
  remove(widget: Widget) {
    this.#children = this.#children.filter(item => item.hash != widget.hash)
  }
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
