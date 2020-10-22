import yargs from "https://deno.land/x/yargs/deno.ts";
import { Arguments, YargsType } from "https://deno.land/x/yargs/types.ts";
import { RunTests } from "./runtests.ts";
import { Junit2csv } from "./junit2csv.ts";
const runTests = new RunTests();
const junit2csv = new Junit2csv();
const foo = yargs(Deno.args);
foo
  .command(
    "run-tests",
    "run a command against every directory in the path",
    runTests.processYarguments,
    runTests.command
  )
  .command(
    "junit2csv",
    "convert a directory of junit results to a csv",
    junit2csv.processYarguments,
    junit2csv.command
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
