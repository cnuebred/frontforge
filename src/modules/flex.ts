import { Widget } from "../widget/widget";
import { ContainerWidget } from "../widget/widget_container";
import { apply_styles } from "../utils/utils";


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
  direction?: flex_direction_e,
  wrap?: flex_wrap_e,
  align_content?: flex_align_content_e,
  align_items?: flex_align_items_e,
  justify_content?: flex_justify_e,
  row_gap?: string
  column_gap?: string
  height?: string,
  width?: string
}

const DEFAULT_FLEX_OPTIONS: flex_options_t = {
  direction: flex_direction_e.row,
}

/**
 * Wraps an existing container with flexbox layout and populates it with widgets.
 * Applies flex CSS properties to the container, then adds and builds all children.
 * 
 * @param container - existing ContainerWidget to wrap
 * @param widgets - child widgets to place inside the flex container
 * @param options - flex layout configuration (direction, wrap, alignment, gaps, etc.)
 * 
 * @example
 * ```ts
 * const container = new ContainerWidget()
 * WrapFlex(container, [header, content, footer], { direction: flex_direction_e.column })
 * container.hook("body")
 * ```
 */
export function WrapFlex(
  container: ContainerWidget,
  widgets: (Widget | ContainerWidget)[],
  options: flex_options_t = DEFAULT_FLEX_OPTIONS): void {

  options = { ...DEFAULT_FLEX_OPTIONS, ...options }
  const flex_config = {
    display: 'flex',
    flexDirection: options?.direction,
    flexWrap: options?.wrap,
    alignContent: options?.align_content,
    alignItems: options?.align_items,
    justifyContent: options?.justify_content,
    rowGap: options?.row_gap,
    columnGap: options?.column_gap,
    height: options?.height,
    width: options?.width
  }
  apply_styles(container.self, flex_config)
  widgets.forEach(item => {
    container.add(item)
  })
  container.build_all()
}

export function Flex(widgets: (Widget | ContainerWidget)[], options: flex_options_t = DEFAULT_FLEX_OPTIONS): ContainerWidget {
  const container = new ContainerWidget()
  WrapFlex(container, widgets, options)
  return container
}
