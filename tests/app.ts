import {ForgeBundle} from '../src/bundle'


const tests = [
  'sql_editor',
  'pocket',
  'events',
  'layout'
]

const app = async (script_name:string) => {
  const bundle = new ForgeBundle()
  bundle.head.title(script_name)
  bundle.head.meta({
    content:"D.U.P.A",
    name: 'description'
  })
  bundle.head.meta({
    content:"width=device-width, initial-scale=1.0",
    name: 'viewport'
  })
  const script = await bundle.script(`./tests/${script_name}.ts`)
  const style = await bundle.style('./tests/style.scss')
  console.log(`[${script_name}]
- script: ${script.length}
- style:  ${style.length}
- full:   ${style.length + script.length}
`)
  bundle.build(script_name, './tests/build')
}

tests.forEach(item => {
  app(item)
})