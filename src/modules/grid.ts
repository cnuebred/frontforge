import { style_wrapper } from "../style/style";
import { Widget } from "../widget/widget";
import { ContainerWidget } from "../widget/widget_container";

export enum grid_align_content_e {
  center = 'center',
  space_around = 'space-around',
  space_between = 'space-between',
  space_evenly = 'space-evenly',
}
export enum grid_align_items_e {
  center = 'center',
  start = 'start',
  end = 'end',
  stretch = 'stretch',
  baseline = 'baseline',
}
export enum grid_justify_content_e {
  center = 'center',
  start = 'start',
  end = 'end',
  space_around = 'space-around',
  space_between = 'space-between',
  space_evenly = 'space-evenly',
}
export enum grid_justify_items_e {
  center = 'center',
  start = 'start',
  end = 'end',
  stretch = 'stretch',
}

export type grid_options_t = {
  align_content?: grid_align_content_e
  justify_items?: grid_justify_items_e
  align_items?: grid_align_items_e
  justify_content?: grid_justify_content_e,
  height?: number,
  width?: number,
  gridTemplateColumns?: string
  gridTemplateRows?: string
}

const DEFAULT_GRID_OPTIONS: grid_options_t = {} // TODO... or not

export const filter_object = (object: { [index: string]: any }, callback: (key, value) => boolean) => {
  const entries = Object.entries(object).map(([key, value]) => {
    if (callback(key, value))
      return [key, value]
    else
      return null
  }).filter(item => !!item)
  return Object.fromEntries(entries)
}


type grid_widget_item_t = {
  widget: Widget,
  row_span?: string | number
  col_span?: string | number
}

export function Grid(widgets: (Widget | grid_widget_item_t | ContainerWidget | null)[][], options: grid_options_t = DEFAULT_GRID_OPTIONS): ContainerWidget {
  const container = new ContainerWidget()
  options = { ...DEFAULT_GRID_OPTIONS, ...options }
  let grid_config = {
    display: 'grid',
    alignContent: options.align_content,
    justifyContent: options.justify_content,
    justifyItems: options.justify_items,
    alignItems: options.align_items,
    height: options.height + 'px',
    width: options.width + 'px',
    gridTemplateColumns: options.gridTemplateColumns,
    gridTemplateRows: options.gridTemplateRows,
  }
  container.attribute = {
    style: style_wrapper(
      filter_object(grid_config,
        (key, value) => {
          if ((key == 'height' || key == 'width') && value.startsWith('undefined'))
            return false
          return !!value
        }
      )
    )
  }

  widgets.forEach((rows, index_row: number) => {
    rows.forEach((item, index_col: number) => {
      if (!item) return
      if (item instanceof Widget) {
        item.style.gridColumn = `${index_col + 1}`
        item.style.gridRow = `${index_row + 1}`
      }
      else {
        const col_span = item.col_span ? ` / ${item.col_span}` : ''
        const row_span = item.row_span ? ` / ${item.row_span}` : ''
        item.widget.style.gridColumn = `${index_col + 1}${col_span}`
        item.widget.style.gridRow = `${index_row + 1}${row_span}`
      }
    })
  })
  widgets.flatMap(item => item).forEach(item => {
    if (!item) return
    if (item instanceof Widget)
      container.add(item)
    else
      container.add(item.widget)

  })
  container.build_all()
  container.render({
    with_attributes: true,
    with_markdown: true
  })
  return container
}
