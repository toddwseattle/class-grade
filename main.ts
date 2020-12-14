import yargs from "https://deno.land/x/yargs/deno.ts";
import { RunTests } from "./runtests.ts";
import { Junit2csv } from "./junit2csv.ts";
import { CheckSize } from "./checkSize.ts";
const version = "0.0.1";
const runTests = new RunTests();
const junit2csv = new Junit2csv();
const checkSize = new CheckSize();
const gradeCommands = yargs(Deno.args) as any;
gradeCommands
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
  )
  .command(
    "filesizes",
    "get the number and sizes of files in each directory",
    checkSize.processYarguments,
    checkSize.command
  )
  .help()
  .version(version).argv;
// // foo.command('download ...','download a list ',(yargs: YargsType)=>{return yargs.positional()})
// foo.command(
//   "run-tests",
//   "operate on assignments from githubclassroom",
//   runTests.processYarguments,
//   runTests.processYarguments
// ).argv;
//   .strictCommands()
//   .demandCommand(1).argv;
