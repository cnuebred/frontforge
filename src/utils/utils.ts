
export const string_contain = (string: string, contain: string): boolean => {
  return string.indexOf(contain) != -1
}

export const filter_object = (object: { [index: string]: any }, callback: (key: string, value: any) => boolean) => {
  const entries = Object.entries(object).map(([key, value]) => {
    if (callback(key, value))
      return [key, value]
    else
      return null
  }).filter(item => !!item)
  return Object.fromEntries(entries)
}

/**
 * Applies CSS properties from a config object to a DOM element's style.
 * Skips entries where the value is `undefined` or `null`.
 * 
 * @param element - target DOM element
 * @param styles - object mapping CSS property names to values
 * 
 * @example
 * ```ts
 * apply_styles(container.self, {
 *   display: 'flex',
 *   flexDirection: 'column',
 *   rowGap: undefined  // skipped
 * })
 * ```
 */
export const apply_styles = (element: HTMLElement, styles: { [key: string]: any }): void => {
  for (const [key, value] of Object.entries(styles)) {
    if (value != null) {
      (element.style as any)[key] = value
    }
  }
}