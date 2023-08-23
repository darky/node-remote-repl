import path from 'path'
import fs from 'fs'

import { program } from 'commander'
import CRI from 'chrome-remote-interface'

import packageJson from './package.json'

program
  .version(packageJson.version)
  .name('node-remote-repl')
  .usage('[options] <file>')
  .option('-h, --host <string>', 'host of inspect protocol', 'localhost')
  .option('-p, --port <number>', 'port of inspect protocol', Number, 9229)
  .parse(process.argv)

const file = program.args[0]

if (!file) {
  console.error('Need to pass <file> argument')
  process.exit(1)
}

const fileExtension = file.match(/(\.js|\.jsx|\.ts|\.tsx|\.mjs|\.cjs|\.mts|\.cts)$/)?.[1]

if (!fileExtension) {
  console.error('Support only js or ts file extensions')
  process.exit(1)
}

const filePath = path.resolve(process.cwd(), file)

if (!fs.existsSync(filePath)) {
  console.error(`File on path: "${filePath}" not exists`)
  process.exit(1)
}

const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' })

;(async () => {
  type ProgramT = {
    host: string
    port: number
  }

  const client = await CRI({
    host: program.opts<ProgramT>().host,
    port: program.opts<ProgramT>().port,
  })

  const expression = fileExtension.endsWith('js')
    ? fileContent
    : await (async () => {
        if (process.env['USE_SWC']) {
          const swc = await import('@swc/core')
          return swc.transformSync(fileContent, {
            module: {
              type: fileExtension === '.mts' ? 'es6' : 'commonjs',
            },
            jsc: {
              target: 'es2022',
              parser: {
                syntax: 'typescript',
                tsx: fileExtension.endsWith('x'),
              },
            },
          }).code
        }

        const ts = await import('typescript')
        return ts.transpileModule(fileContent, {
          compilerOptions: {
            lib: ['es2022'],
            module: fileExtension === '.mts' ? ts.ModuleKind.ES2020 : ts.ModuleKind.CommonJS,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            target: ts.ScriptTarget.ES2022,
            esModuleInterop: true,
            jsx: fileExtension.endsWith('x') ? ts.JsxEmit.React : void 0,
          },
        }).outputText
      })()

  const resp = await client.Runtime.evaluate({
    expression: `(async () => {
      const exports = {};
      ${expression}
      if (exports.$replJson) {
        return JSON.stringify(await exports.$replJson(), null, 2);
      }
      if (exports.$repl) {
        return await exports.$repl();
      }
    })()`,
    includeCommandLineAPI: true,
    awaitPromise: true,
  })
  console.log(resp.result.value || resp)
  client.close()
})().catch((e: Error) => {
  console.error(e)
  process.exit(1)
})
