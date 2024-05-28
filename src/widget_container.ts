import { attributes_t, widget_render_option_t } from "./d"
import { Pocket } from "./pocket"
import { Widget } from "./widget"

export class ContainerWidget extends Widget {
  #children: Widget[] = []
  widgets: any
  constructor(tag: string = 'div') {
    super(tag, '')
  }
  jk(callback?: () => Widget[]) {
    if (!callback)
      callback = this.widgets
    else {
      this.widgets = callback

    }
    callback().forEach(item => {
      item.build()
      this.self.append(item.self)
    })
  }
  clear() {
    this.#children = []
    Array.from(this.self.children).forEach(item => item.remove())
  }
  refresh() {
    Array.from(this.self.children).forEach(item => item.remove())
    this.jk()
  }
  add(widget: Widget, parent_proxy: (boolean | null) = null) {
    if (parent_proxy == null) {
      if (!widget?.pocket)
        widget.pocket = this.pocket
    }
    if (parent_proxy == true) {
      widget.pocket = this.pocket
    }

    this.#children.push(widget)
  }
  build() {
    const children = this.#children.filter(item => !!item)
    children.forEach(item => {
      const item_pocket_exist = item?.pocket
      // const item_pocket_target = item_pocket_exist?.target || item.set_pocket(new Pocket({})).target
      // // this.pocket.target[item.hash] = item_pocket_target
      // item_pocket_target['_'] = this.pocket.target

      if (item_pocket_exist) {
        item.pocket.set_setter_callback((_, property) => {
          if (
            item.dynamic?.value?.includes(String(property)) ||
            item.dynamic?.condition?.includes(String(property)) ||
            item.dynamic?.attributes?.includes(String(property))
          )
            item.build()
        })
      } else if (!!this.pocket) {
        this.pocket.set_setter_callback(() => item.build())
      }
    })
    children.forEach(item => {
      item.build()
      this.self.append(item.self)
    })
  }
}
