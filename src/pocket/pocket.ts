// Dynamic state management

type getter_callback_t<T> = (target: T, property: string | symbol, receiver: any) => void
type setter_callback_t<T> = (target: T, property: string | symbol, value: any, receiver: any) => void

/**
 * Reactive state container that wraps an object in a {@link Proxy}.
 * 
 * `Pocket` intercepts all property access (get/set) on the wrapped object
 * and notifies registered callbacks. This enables reactive UI patterns –
 * whenever the state changes, listeners can automatically re-render widgets,
 * update the DOM, or trigger side effects.
 * 
 * @typeParam T - the shape of the wrapped object (must be an object type)
 * 
 * @example
 * ```ts
 * const state = new Pocket({ count: 0, name: "FARO" })
 * 
 * // React to any property change
 * state.set_setter_callback((target, prop, value) => {
 *   console.log(`${String(prop)} changed to`, value)
 * })
 * 
 * state.target.count++  // logs: "count changed to 1"
 * ```
 */
export class Pocket<T extends object> {
  /** The proxied object – access and mutate this to trigger callbacks. */
  target: T

  /** Registered getter callbacks (fired on every property read). */
  getters: getter_callback_t<T>[] = []

  /** Registered setter callbacks (fired on every property write). */
  setters: setter_callback_t<T>[] = []

  /**
   * Creates a new reactive pocket.
   * @param obj - the initial state object to wrap
   */
  constructor(obj: T) {
    this.target = new Proxy<T>(obj, {
      get: (target, property, receiver) => {
        const eq = Reflect.get(target, property, receiver);
        this.getters.forEach(item => item(target, property, receiver))
        return eq
      },
      set: (target, property, value, receiver) => {
        const eq = Reflect.set(target, property, value, receiver);
        this.setters.forEach(item => item(target, property, value, receiver))
        return eq
      }
    })
  }

  /**
   * Registers a callback that fires on every property **read**.
   * @param callback - receives `(target, property, receiver)`
   */
  set_getter_callback(callback: getter_callback_t<T>) {
    this.getters.push(callback)
  }

  /**
   * Registers a callback that fires on every property **write**.
   * @param callback - receives `(target, property, newValue, receiver)`
   */
  set_setter_callback(callback: setter_callback_t<T>) {
    this.setters.push(callback)
  }
}