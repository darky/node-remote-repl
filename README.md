# node-remote-repl

Execute code remotelly via Node.js inspect protocol like Clojure nREPL

### Install

```
npm install -g node-remote-repl
```

### Usage

You can always get help of cli:

```
node-remote-repl --help
```

Output:

```
Usage: node-remote-repl [options] <file>

Options:
  -V, --version        output the version number
  -h, --host <string>  host of inspect protocol (default: "localhost")
  -p, --port <number>  port of inspect protocol (default: 9229)
  -h, --help           display help for command
```

Ok, it's very easy, create for example `repl.js` and play with it

```
node-remote-repl --host some-host --port 9229 repl.js
```

### Some use cases

#### log to stdout of your remote process

```js
console.log(/* some stuff */)
```

#### expose some json from remote process

```js
JSON.stringify({/* some json */}, null, 2)
```

#### use power of require

```js
var util = require('util');
var module = require('./some-module');
util.inspect(module.method(), {colors: true})
```

#### typescript support out of the box

```ts
var n: number = 1;
n;
```

#### use some CI/CD for replace stuff on remote side

```js
var typedi = require('typedi');
var Module = require('./some-module');
typedi.Container.set('some-module', new class extends Module {
  method() {
    // replace implementation on the fly
  }
})
```

### Integration with IDE

Because it simple command line util, you can easy integrate it with your IDE.
For example let's do it with Visual Studio Code with Code Runner extension:

* install Code Runner extension to Visual Studio Code
* configure Code Runner to run `node-remote-repl` in `repl.js`:

```json
{
  "code-runner.executorMapByGlob": {
    "repl.js": "node-remote-repl --host some-host --port 9229"
  }
}
```

* profit, now you can fastly run repl via Visual Studio Code
* I hope, some similar stuff exists on all popular IDE

### Limitations

* Use `var` instead `let` or `const`. Otherwise, you get error like: `SyntaxError: Identifier 'someVar' has already been declared` on next call until your remote process will be restarted
* On typescript side need use `require` instead `import` stuff. Otherwise, you get error like: `ReferenceError: exports is not defined`. Example of proper usage:

```ts
var someModule = require('./some-module') as typeof import('./some-module');
someModule // all typing works correctly
```
