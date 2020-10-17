import yargs from "https://deno.land/x/yargs/deno.ts";
import { Arguments, YargsType } from "https://deno.land/x/yargs/types.ts";
import { YargCommand } from "./command.ts";
import {
  existsSync,
  walk,
  WalkEntry,
  walkSync,
} from "https://deno.land/std@0.74.0/fs/mod.ts";
import { expandGlobSync } from "https://deno.land/std@0.74.0/fs/mod.ts";
import { Path, WINDOWS_SEPS } from "https://deno.land/x/path/mod.ts";
interface RunTestArgs {
  [x: string]: unknown;
  studentCSV: string;
  resultsCSV: string;
  command: string;
  path: string;
}
export class RunTests implements YargCommand {
  constructor() {
    // bind member that will be callbacks
    this.processYarguments = this.processYarguments.bind(this);
    this.command = this.command.bind(this);
  }
  processYarguments(yargs: YargsType): YargsType {
    yargs
      .options({
        studentCSV: {
          type: "string",
          default: "student.csv",
          description: "file with student github id's and emails",
          alias: ["student", "scsv"],
        },
        resultsCSV: {
          type: "string",
          default: "results.csv",
          description: "file to write and append results",
        },
        command: {
          type: "string",
          default: "echo",
          description: "command to run in each directory",
        },
        path: {
          type: "string",
          default: "*.*",
          description: "parent path of repos with results",
        },
      })
      .help(
        "traverse each directory in path, looking up directory as a github id from student.csv, run the command and place results in results.csv"
      );
    return yargs;
  }
  /**
   * Return just the directories of a glob
   * @param glob to use to find directories
   * @returns an array of directories (WalkEntries) or empty arry if none
   */
  private getdirectories(glob: string): WalkEntry[] {
    const directories: WalkEntry[] = [];
    for (const file of expandGlobSync(glob)) {
      if (file.isDirectory) {
        directories.push(file);
      }
    }
    return directories;
  }
  private isDir(path: string): boolean {
    const globChars = /[\*\?]+/;
    if (path.match(globChars) !== null) {
      // is a glob not a dir
      return false;
    } else {
      if (!existsSync(path)) {
        return false;
      } else {
        // is it a dir or a file?
        return this.getdirectories(path).length > 0;
      }
    }
  }
  private async performForDirectories(directories: WalkEntry[]): Promise<any> {}
  command(yargs: YargsType & RunTestArgs): YargsType {
    //runTestarg = yargs;
    console.log(`studentCSV: ${yargs["studentCSV"]}`);
    console.log(`resultsCSV: ${yargs.resultsCSV}`);
    console.log(`command: ${yargs.command}`);
    const path = this.isDir(yargs.path) ? yargs.path + "/*" : yargs.path;
    let directories = this.getdirectories(path);
    if (directories.length == 0) {
      console.log(`nothing to do for ${path}`);
    } else {
      console.log(`performing command in ${directories.length}`);
    }
    return yargs;
  }
}
