# node-remote-repl

Execute code remotelly via Node.js inspect protocol like Clojure nREPL

### Install

```
npm install -g node-remote-repl
```

### Usage

```
node-remote-repl --help
```

```
Usage: node-remote-repl [options] <file>

Options:
  -V, --version        output the version number
  -h, --host <string>  host of inspect protocol (default: "localhost")
  -p, --port <number>  port of inspect protocol (default: 9229)
  -h, --help           display help for command
```

### Example

```
node-remote-repl --host some-host --port 9229 repl.js
```

**repl.js**:

```js
JSON.stringify(process.env); // show all env on remote node.js process
```
