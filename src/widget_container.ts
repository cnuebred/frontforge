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
  render() {
    this.remove_all_attributes()
    this.rerender_display()
    const children = this.#children.filter(item => !!item)
    children.forEach(item => {
      item.render()
    })
    this.convert_object_to_attributes(this.attribute)
    return this
  }
  add(widget: Widget) {
    this.#children.push(widget)
  }
  build() {
    const children = this.#children.filter(item => !!item)
    children.forEach(item => {
      item.render()
      item.hook(this.self)
    })
  }
}
