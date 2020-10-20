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
  resultsPath: string;
  isrepo: boolean;
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
          alias: ["students", "scsv"],
        },
        resultsCSV: {
          type: "string",
          default: "results.csv",
          description: "file to write and append results",
          alias: ["rcsv"],
        },
        resultsPath: {
          type: "string",
          default: "_results",
          description:
            "path to directory where results for each command should be stored",
          alias: ["rp"],
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
          alias: ["p"],
        },
        isrepo: {
          type: "binary",
          default: true,
          description:
            "each directory should be a git repository (have a .git subdir)",
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
    const isDir = new Path(path);
    return isDir.isDir;
  }
  private async performForDirectories(directories: WalkEntry[]): Promise<any> {}
  command(yargs: YargsType & RunTestArgs): YargsType {
    //runTestarg = yargs;
    console.log(`studentCSV: ${yargs["studentCSV"]}`);
    console.log(`resultsCSV: ${yargs.resultsCSV}`);
    console.log(`command: ${yargs.command}`);
    // append *.* if it's a dir
    const path = this.isDir(yargs.path)
      ? new Path(yargs.path).push("*")
      : new Path(yargs.path);
    let directories = this.getdirectories(path.toString());
    if (directories.length == 0) {
      console.log(`nothing to do for ${path}`);
    } else {
      console.log(`performing command in ${directories.length} directories`);
      const resultsPath = new Path(yargs.resultsPath);
      if (!resultsPath.isDir) {
        if (resultsPath.isFile) {
          console.log(
            `${resultsPath} is a file; a directory or new directory path was expected...terminating`
          );
          return yargs;
        } else {
          if (!resultsPath.mkDirSync(true)) {
            console.log(`can't create the path ${resultsPath} terminating...`);
            return yargs;
          }
        }
      }
      directories.forEach((dir) => {
        console.log(`processing ${dir.name}`);
      });
    }
    return yargs;
  }
}
