import yargs from "https://deno.land/x/yargs/deno.ts";
import { Arguments, YargsType } from "https://deno.land/x/yargs/types.ts";
import { YargCommand } from "./command.ts";
import { WalkEntry } from "https://deno.land/std@0.74.0/fs/mod.ts";
import { Path, WINDOWS_SEPS } from "https://deno.land/x/path/mod.ts";
import { getDirectories } from "./utils.ts";
interface RunTestArgs {
  [x: string]: unknown;
  studentCSV: string;
  resultsCSV: string;
  command: string;
  path: string;
  resultsPath: string;
  isrepo: boolean;
  max: number;
}
export class RunTests implements YargCommand {
  static FILEMARKER = "_OUTPUT_";
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
          help:
            "path to directory where results for each command should be stored",
          alias: ["rp"],
        },
        command: {
          type: "string",
          default: "echo",
          description: `command to run in each directory ${RunTests.FILEMARKER} is replaced with a unique file name matching the directory placed in the results path`,
          help: `command to run in each directory ${RunTests.FILEMARKER} is replaced with a unique file name matching the directory placed in the results path`,
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
        max: {
          type: "integer",
          default: null,
          description: "how many directories to do maximum (default all)",
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

  private isDir(path: string): boolean {
    const isDir = new Path(path);
    return isDir.isDir;
  }
  async command(yargs: YargsType & RunTestArgs): Promise<YargsType> {
    //runTestarg = yargs;
    console.log(`studentCSV: ${yargs["studentCSV"]}`);
    console.log(`resultsCSV: ${yargs.resultsCSV}`);
    console.log(`command: ${yargs.command}`);
    // append *.* if it's a dir
    const path = this.isDir(yargs.path)
      ? new Path(yargs.path).push("*")
      : new Path(yargs.path);
    let directories = getDirectories(path.toString());
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
      const execdir: Promise<boolean>[] = [];
      for (let i = 0; i < directories.length; i++) {
        const dir = directories[i];
        console.log(`queuing processing for ${dir.name}`);
        execdir.push(this.processFile(dir, yargs.command, resultsPath));
        if (yargs.max && i === yargs.max) break;
      }
      const results = await Promise.all(execdir);
    }
    return yargs;
  }
  async processFile(
    dir: WalkEntry,
    command: string,
    resultsPath: Path
  ): Promise<boolean> {
    // change directory to the dir
    const cwd = Deno.cwd();
    Deno.chdir(dir.path);
    // create the name of the output file and output err
    const out = dir.name + ".out";
    const err = dir.name + ".err";

    // generate the command
    const splitCommand = command.split(" ");

    splitCommand.forEach((param, i) => {
      if (param === RunTests.FILEMARKER) {
        const outputsub = new Path(resultsPath.toString()).push(
          dir.name.toString()
        );
        splitCommand[i] = outputsub.toString();
      }
    });
    // exec the command
    const result = Deno.run({
      cmd: splitCommand,
      stdout: "piped",
      stderr: "piped",
    });
    try {
      const { code } = await result.status();

      if (code === 0) {
        const rawOutput = await result.output();
        await Deno.stdout.write(rawOutput);
      } else if (code === 2) {
        const rawError = await result.stderrOutput();
        const rawOutput = await result.output();
        await Deno.stdout.write(rawOutput);
        const errorString = new TextDecoder().decode(rawError);
        console.log(errorString);
      }
    } catch (error) {
      console.log(error);
    }

    // handle errors
    // console.log(result.status);
    return true;
  }
}
