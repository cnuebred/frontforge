// Dynamic state management

// TODO provide type to fully class Pocket

type getter_callback_t<T> = (target: T, property: string | symbol, receiver: any) => void
type setter_callback_t<T> = (target: T, property: string | symbol, value:any, receiver: any) => void

export class Pocket<T extends object> {
  target: T
  getters: getter_callback_t<T>[] = []
  setters: setter_callback_t<T>[] = []
  constructor(obj: T) {
    this.target = new Proxy<T>(obj, {
      get: (target, property, receiver) => {
        const eq = Reflect.get(target, property, receiver);
        // console.log('GET ', property, target[property])
        this.getters.forEach(item => item(target, property, receiver))
        return eq
      },
      set: (target, property, value, receiver) => {
        const eq = Reflect.set(target, property, value, receiver);
        // console.log('SET ', property, target[property], value)
        this.setters.forEach(item => item(target, property, value, receiver))
        return eq
      }
    })
  }
  set_getter_callback(callback: getter_callback_t<T>){
    this.getters.push(callback)
  }
  set_setter_callback(callback: setter_callback_t<T>){
    this.setters.push(callback)
  }
}