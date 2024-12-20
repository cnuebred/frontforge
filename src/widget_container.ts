import { attributes_t, widget_render_option_t } from "./d"
import { Pocket } from "./pocket"
import { Widget } from "./widget"

export class ContainerWidget extends Widget {
  #children: Widget[] = []
  widgets: () => Widget[]
  check_instance = () => 'container_widget'

  constructor(tag: string = 'div') {
    super(tag, '')
  }
  clear() {
    this.#children.forEach(item => item.destroy())
    this.#children = []
  }
  foreach_children(callback: (item: Widget | ContainerWidget) => void){
    this.#children.forEach(callback)
  }
  render(with_attributes: boolean = true, with_markdown: boolean = true) {
    if (with_attributes){
      this.remove_all_attributes()
    }
    this.rerender_display()
    const children = this.#children.filter(item => !!item)
    children.forEach(item => {
      item.render(with_attributes, with_markdown)
    })
    this.convert_object_to_attributes(this.attribute)
    return this
  }
  add(widget: Widget) {
    this.#children.push(widget)
  }
  remove(widget: Widget){
    this.#children = this.#children.filter(item => item.hash != widget.hash)
  }
  build(with_markdown: boolean = true) {
    const children = this.#children.filter(item => !!item)
    children.forEach(item => {
      item.render(false, with_markdown)
      item.hook(this.self)
    })
  }
}
