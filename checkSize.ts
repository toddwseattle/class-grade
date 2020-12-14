import { Arguments } from "https://deno.land/x/yargs/deno-types.ts";
import { Path } from "https://deno.land/x/path@v2.2.0/src/Path.ts";
import { YargCommand } from "./command.ts";
import { dirname } from "https://deno.land/std@0.74.0/path/win32.ts";
import { getDirectories } from "./utils.ts";
import { WalkEntry } from "https://deno.land/std@0.74.0/fs/walk.ts";
/**
 * This is a command to check file sizes in each directory passed in filespec.  It generates
 * a CSV with the sum
 */

/**
 * type of arguments to checkSize
 */
export interface CheckSizeArgs {
  [x: string]: unknown;
  help: boolean;
  path: string;
  files: string;
  results: string;
  max: number;
}
/** each line of results...the name of directory, number of bytes, and total files */
interface ResultLine {
  name: string;
  bytes: number;
  files: number;
}
export class CheckSize implements YargCommand {
  constructor() {}
  processYarguments(yargs: Arguments) {
    yargs.help(
      "check size of a file or group of files and output per directory"
    );
    yargs.options({
      path: {
        type: "string",
        default: "*.*",
        description: "parent path of repos with results",
        alias: ["p"],
      },
      files: {
        type: "string",
        default: "*.*",
        description:
          "filespec, glob, or filename to check size of in each directory",
        alias: ["f"],
      },
      results: {
        type: "string",
        default: "size_results.csv",
        description: "file to write and append results",
        alias: ["r", "rcsv"],
      },
      max: {
        type: "integer",
        default: null,
        description: "max number of directories to process form the path",
      },
    });
    return yargs;
  }
  getCSVtitle(sizeDesc: string): string[] {
    return ["directory", `size of ${sizeDesc}`, `file count of ${sizeDesc}`];
  }

  async countFiles(repoName: WalkEntry, fileSpec: string): Promise<ResultLine> {
    const repoResult = { name: repoName.name, bytes: 0, files: 0 };
    return repoResult;
  }
  async command(yargs: Arguments & CheckSizeArgs): Promise<Arguments> {
    if (!yargs.help) {
      const repoPath = new Path(yargs.path);
      if (repoPath.isDir) {
        repoPath.push("*");
      }
      const repos = getDirectories(repoPath.toString());
      if ((repos.length = 0)) {
        console.log(`nothing to do for ${repoPath}`);
      } else {
        console.log(
          `calculating sizes for ${yargs.files} in ${repos.length} directories`
        );
        const resultCSV: string[][] = [];
        resultCSV.push(this.getCSVtitle(yargs.files));
        const countPromises: Promise<ResultLine>[] = [];

        for (let i = 0; i < repos.length; i++) {
          countPromises.push(this.countFiles(repos[i], yargs.files));
        }
      }
    }
    return yargs;
  }
}
