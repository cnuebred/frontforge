import esbuild, { transform } from 'esbuild'
import { readFileSync } from 'fs'
import { compileString } from 'sass'

export class ForgeBundle{
  constructor(){}

  async style(path:string){
      const text = await readFileSync(path)
      const css = compileString(text.toString(), { style: 'compressed' }).css || ''
      const response = await transform(css, {
        minify: true,
        loader: 'css',
        platform: 'node',
        target: 'es2021'
    })
    return response.code
  }

  async bundle(path:string){
    const result = await esbuild.build({
      entryPoints: [path],
      bundle: true,
      outfile: 'output.js',
      format: 'esm', 
      platform: 'browser',
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
      write:false,
    });

    return result.outputFiles[0].text;
  }
}