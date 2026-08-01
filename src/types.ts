export enum instances {
  WIDGET = 'widget',
  CONTAINER_WIDGET = 'container_widget'
}

/** Opcje renderowania widgetu */
export type widget_render_option_t = {
  /** Czy zastosować atrybuty HTML (domyślnie: true) */
  with_attributes?: boolean
  /** Czy parsować Markdown w treści (domyślnie: true) */
  with_markdown?: boolean
}

/** Mapa atrybutów HTML – `null` usuwa atrybut, `false`/`undefined` pomija */
export type attributes_t = {[index:string]: string|number|boolean|null}

/** Opcje klonowania widgetu */
export type clone_options_t = {
  /** Czy skopiować event listenery (domyślnie: true) */
  with_events?: boolean
}