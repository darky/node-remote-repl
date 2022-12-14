console.time('require')

import path from 'path'
import fs from 'fs'

import { program } from 'commander'
import ts, { ModuleKind, ScriptTarget } from 'typescript'
import CRI from 'chrome-remote-interface'

import packageJson from './package.json'

console.timeEnd('require')

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

const fileExtension = file.match(/(\.js|\.jsx|\.ts|\.tsx)$/)?.[1]

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
const expression =
  fileExtension === '.js'
    ? fileContent
    : ts.transpileModule(fileContent, {
        compilerOptions: {
          lib: ['es2020'],
          module: ModuleKind.CommonJS,
          target: ScriptTarget.ES2020,
          esModuleInterop: true,
          jsx: fileExtension.endsWith('x') ? ts.JsxEmit.React : void 0,
        },
      }).outputText

;(async () => {
  type ProgramT = {
    host: string
    port: number
  }
  const client = await CRI({
    host: program.opts<ProgramT>().host,
    port: program.opts<ProgramT>().port,
  })
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
