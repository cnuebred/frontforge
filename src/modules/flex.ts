import { style_wrapper } from "../style";
import { Widget } from "../widget";
import { ContainerWidget } from "../widget_container";


export enum flex_direction_e {
  row = 'row',
  reverse_row = 'row-reverse',
  column = 'column',
  reverse_column = 'column-reverse'
}
export enum flex_wrap_e {
  wrap = 'wrap',
  nowrap = 'nowrap'
}
export enum flex_align_content_e {
  center = 'center',
  start = 'flex-start',
  end = 'flex-end',
  space_around = 'space-around',
  space_between = 'space-between',
  stretch = 'stretch',
}
export enum flex_align_items_e {
  center = 'center',
  start = 'flex-start',
  end = 'flex-end',
  stretch = 'stretch',
  baseline = 'baseline',
}
export enum flex_justify_e {
  center = 'center',
  start = 'flex-start',
  end = 'flex-end',
  space_around = 'space-around',
  space_between = 'space-between',
  space_evenly = 'space-evenly',
}

export type flex_options_t = {
  direction?: flex_direction_e
  wrap?: flex_wrap_e
  align_content?: flex_align_content_e
  align_items?: flex_align_items_e
  justify_content?: flex_justify_e,
  height?: number,
  width?: number
}

const DEFAULT_FLEX_OPTIONS: flex_options_t = {
  direction: flex_direction_e.row,
}

export const filter_object = (object: {[index: string]: any}, callback: (key, value) => boolean) => {
  const entries = Object.entries(object).map(([key, value]) => {
    if(callback(key, value))
      return [key, value]
    else 
      return null
  }).filter(item => !!item)
  return Object.fromEntries(entries)
}

export function Flex(widgets: (Widget|ContainerWidget)[], options: flex_options_t = DEFAULT_FLEX_OPTIONS): ContainerWidget {
  const container = new ContainerWidget()
  options = { ...DEFAULT_FLEX_OPTIONS, ...options }
  const flex_config = {
    display: 'flex',
    flexDirection: options.direction,
    flexWrap: options.wrap,
    alignContent: options.align_content,
    alignItems: options.align_items,
    justifyContent: options.justify_content,
    height: options.height + 'px',
    width: options.width + 'px'
  }
  container.attribute = {
    style: style_wrapper(
      filter_object(flex_config, 
        (key, value) => {
          if((key == 'height' || key == 'width') && value.startsWith('undefined'))
            return false
          return !!value
        }
      )
    )
  }
  widgets.forEach(item => {
    container.add(item)
  })
  container.build()
  container.render()
  return container
}
