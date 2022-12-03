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
console.log(/* some stuff */);
```

#### expose something from remote process

```js
exports.$repl = async () => {
  return 1 + 1;
};
```

#### expose some json from remote process

```js
exports.$replJson = async () => {
  return {obj: true};
};
```

#### use power of require

```js
const util = require('util');
const module = require('./some-module');

exports.$repl = async () => {
  return util.inspect(module.method(), {colors: true});
};
```

#### typescript support out of the box

```ts
exports.$repl = async () => {
  const n: number = 1;
  return n;
};
```

#### you can replace implementation on remote side

```js
const Module = require('./some-module');
Module.prototype.method = () => {
  // replace implementation on the fly
};
```

### Integration with IDE

Because it simple command line util, you can easy integrate it with your IDE.
For example let's do it with Visual Studio Code and Code Runner extension:

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

### Related

* [repl-ns](https://github.com/darky/repl-ns) - 
Namespace for REPL driven development for TypeScript/JavaScript, inspired by Clojure namespaces
