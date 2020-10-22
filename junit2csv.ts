import { Arguments, YargsType } from "https://deno.land/x/yargs/types.ts";
import { YargCommand } from "./command.ts";
import parse from "https://denopkg.com/nekobato/deno-xml-parser/index.ts";
import { Path } from "https://deno.land/x/path@v2.2.0/src/Path.ts";
import { WalkEntry } from "https://deno.land/std@0.74.0/fs/walk.ts";
import { getFiles } from "./utils.ts";
/**
 * type of arguments to Junit2csv command.
 */
export interface Junit2csvArgs {
  [x: string]: unknown;
  testDir: string;
  results: string;
  max: number;
}
/**
 * Command class that converts a Junit directory to a csv.  implements
 * the interface YargComnad
 */
export class Junit2csv implements YargCommand {
  constructor() {
    // bind member that will be callbacks.
    this.processYarguments = this.processYarguments.bind(this);
    this.command = this.command.bind(this);
  }
  processYarguments(yargs: YargsType) {
    yargs.options({
      testDir: {
        type: "string",
        default: ".",
        description: "location of junit compatible xml files",
        alias: ["t", "path", "testdir"],
      },
      results: {
        type: "string",
        default: "results.csv",
        description: "file to write and append results",
        alias: ["rcsv"],
      },
      max: {
        type: "integer",
        default: null,
        description: "max number of files to process from the path",
      },
    });
    return yargs;
  }

  command(yargs: YargsType & Junit2csvArgs): YargsType {
    const dir = new Path(yargs.testDir);
    // if a direcotry is passed; turn it into a wildcard blob
    if (dir.isDir) {
      dir.push("*");
    }
    const junitFiles = getFiles(dir);
    for (let i = 0; i < junitFiles.length; i++) {
      const element = junitFiles[i];

      if (yargs.max && i === yargs.mac) break;
    }
    return yargs;
  }
}
