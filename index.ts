import path from "path";
import fs from "fs";

import { program } from "commander";
import ts, { ModuleKind, ScriptTarget } from "typescript";
import CRI from "chrome-remote-interface";

import packageJson from "./package.json";

program
  .version(packageJson.version)
  .name("node-remote-repl")
  .usage("[options] <file>")
  .option("-h, --host <string>", "host of inspect protocol", "localhost")
  .option("-p, --port <number>", "port of inspect protocol", Number, 9229)
  .parse(process.argv);

const file = program.args[0];

if (!file) {
  console.error("Need to pass <file> argument");
  process.exit(1);
}

const fileExtension = file.match(/(\.js|\.ts)$/)?.[1];

if (!fileExtension) {
  console.error("Support only js or ts file extensions");
  process.exit(1);
}

const filePath = path.resolve(process.cwd(), file);

if (!fs.existsSync(filePath)) {
  console.error(`File on path: "${filePath}" not exists`);
  process.exit(1);
}

const fileContent = fs.readFileSync(filePath, { encoding: "utf8" });
const expression =
  fileExtension === ".js"
    ? fileContent
    : ts.transpileModule(fileContent, {
        compilerOptions: {
          lib: ["es2018"],
          module: ModuleKind.CommonJS,
          target: ScriptTarget.ES2018,
          esModuleInterop: true,
        },
      }).outputText;

(async () => {
  type ProgramT = {
    host: string;
    port: number;
  };
  const client = await CRI({
    host: ((program as unknown) as ProgramT).host,
    port: ((program as unknown) as ProgramT).port,
  });
  const resp = await client.Runtime.evaluate({
    expression,
    includeCommandLineAPI: true,
  });
  console.log(resp.result.value || resp);
  client.close();
})().catch((e: Error) => {
  console.error(e);
  process.exit(1);
});
