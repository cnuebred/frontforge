import { writeFile } from 'fs'
import {ForgeBundle} from '../src/bundle'


const tests = [
  'sql_editor',
  'pocket',
  'events',
  'layout'
]

const app = async (script_name:string) => {
  const bundle = new ForgeBundle()
  const script = await bundle.bundle(`./tests/${script_name}.ts`)
  const style = await bundle.style('./tests/style.scss')
  console.log(`[${script_name}]
- script: ${script.length}
- style:  ${style.length}
- full:   ${style.length + script.length}
`)
  writeFile(`./${script_name}.html`, `
  <html>
  <body>
  <app>
  </app>
  </body>
  <style>
  ${style}
  </style>
  <script>
  ${script}
  </script>
  </html>
  `, () => {

  })
}

tests.forEach(item => {
  app(item)
})