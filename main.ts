import yargs from "https://deno.land/x/yargs/deno.ts";
import { Arguments, YargsType } from "https://deno.land/x/yargs/types.ts";
import { RunTests } from "./runtests.ts";
const runTests = new RunTests();
const foo = yargs(Deno.args);
foo.command(
  "run-tests",
  "operate",
  runTests.processYarguments,
  runTests.command
).argv;
// // foo.command('download ...','download a list ',(yargs: YargsType)=>{return yargs.positional()})
// foo.command(
//   "run-tests",
//   "operate on assignments from githubclassroom",
//   runTests.processYarguments,
//   runTests.processYarguments
// ).argv;
//   .strictCommands()
//   .demandCommand(1).argv;
