import esbuild, { transform } from 'esbuild'
import { readFileSync, writeFile } from 'fs'
import { compileString } from 'sass'

type head_link_rel_t = 'alternate' | 'author' | 'dns-prefetch' |
  'help' | 'icon' | 'license' |
  'next' | 'pingback' | 'preconnect' |
  'prefetch' | 'preload' | 'prerender' |
  'prev' | 'search' | 'stylesheet'

type head_link_crossorigin_t = 'anonymous' | 'use-credentials'
type head_link_referrerpolicy_t = 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'unsafe-url'

type head_meta_http_equiv_t = 'content-security-policy' | 'content-type' | 'default-style' | 'refresh'
type head_meta_name_t = 'application-name' | 'author' | 'description' | 'generator' | 'keywords' | 'viewport'


type head__link_t = {
  rel?: head_link_rel_t
  crossorigin?: head_link_crossorigin_t
  referrerpolicy?: head_link_referrerpolicy_t
  href?: string
  hreflang?: string
  media?: string
  sizes?: string
  title?: string
  type?: string
}
type head__meta_t = {
  charset?: string
  content?: string
  http_equiv?: head_meta_http_equiv_t
  name?: head_meta_name_t
}

type head_t = {
  title: string
  link: head__link_t[]
  meta: head__meta_t[]
}

const iterate_by_object_with_callback = (object: Object, callback: (key, value, parent) => void, parent) => {
  Object.entries(object).forEach(([key, value], index) => {
    if (value instanceof Object) {
      iterate_by_object_with_callback(value, callback, key)
    }
    else {
      callback(key, value, parent)
    }

  })

}

export class ForgeBundle {
  #head: string[] = []
  #script: string[] = []
  #style: string[] = []
  constructor() { }
  head = {
    title: (title: string) => this.#head.push(`<title>${title}</title>`),
    link: (link_obj: head__link_t) => this.#head.push(`<link ${Object.entries(link_obj).map(([key, value]) => `${key}="${value}"`).join(' ')}>`),
    meta: (meta_obj: head__meta_t) => this.#head.push(`<meta ${Object.entries(meta_obj).map(([key, value]) => `${key}="${value}"`).join(' ')}>`),
  }
  async style(path: string) {
    const text = await readFileSync(path)
    const css = compileString(text.toString(), { style: 'compressed' }).css || ''
    const response = await transform(css, {
      minify: true,
      loader: 'css',
      platform: 'node',
      target: 'es2021'
    })
    this.#style.push(response.code)
    return response.code
  }

  async script(path: string) {
    const result = await esbuild.build({
      entryPoints: [path],
      bundle: true,
      outfile: 'output.js',
      format: 'esm',
      platform: 'browser',
      minify: true,
      target: 'es2020',
      inject: [require.resolve('process')],
      define: {
        'global': 'window',
        'process.env.NODE_ENV': '"production"',
        'process': JSON.stringify({
          env: {
            NODE_ENV: 'production'
          },
          version: '0.0.0'
        })
      },
      resolveExtensions: ['.ts', '.js'],
      loader: { '.ts': 'ts' },
      write: false,
    });
    this.#script.push(result.outputFiles[0].text)
    return result.outputFiles[0].text
  }
  async build(project_name: string, path: string, to_file: boolean = true) {
    const html_struct = `<html>
      <head>${this.#head.join('\n')}</head>
      <body><app></app></body>
      <style>${this.#style.join('\n')}</style>
      <script>${this.#script.join('\n')}</script>
      </html>`
    if (to_file)
      writeFile(`${path}/${project_name}.html`, html_struct, () => { })
    return html_struct
  }
}