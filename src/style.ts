const change_key_to_attr_style = (key) => {
  return key.replaceAll(/([a-z])([A-Z])/gm, '$1-$2').toLowerCase()
}

export function style_wrapper(style_object: { [index: string]: string | number | null }) {
  return Object.entries(style_object).map(([key, value]) => {
    return `${change_key_to_attr_style(key)}:${value};`
  }).join('')
}