
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