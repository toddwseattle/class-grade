/***
 * The CSV combine command.
 */
import { Arguments } from "https://deno.land/x/yargs/deno-types.ts";
import { YargCommand } from "./command.ts";
import parse from "https://denopkg.com/nekobato/deno-xml-parser/index.ts";
// import Document from "https://denopkg.com/nekobato/deno-xml-parser/index.ts";
import { Path } from "https://deno.land/x/path@v2.2.0/src/Path.ts";
import { WalkEntry } from "https://deno.land/std@0.74.0/fs/walk.ts";
import { convertCSV, getFiles } from "./utils.ts";
interface Document {
  declaration: {
    attributes: {};
  };
  root:
    | {
        name: string;
        attributes: {};
        children: any[];
      }
    | undefined;
}
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
 * Command class that converts a bunch of small per file csv results to a combined csv.  implements
 * the interface YargComnad
 */
export class CsvCombine implements YargCommand {
  private headers: string = "";
  constructor() {
    // bind member that will be callbacks.
    this.processYarguments = this.processYarguments.bind(this);
    this.command = this.command.bind(this);
  }
  processYarguments(yargs: Arguments) {
    yargs.help(
      "combine csvs that all have a title and data lines.  takes first title line of first file; and then only 2nd through 'n' lines of subsequent files; i.e. assumes a normalized set of files"
    );
    yargs.options({
      sourceCSV: {
        type: "string",
        default: ".",
        description: "location of csv files to combine",
        alias: ["source", "scsv", "path"],
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

  async command(yargs: Arguments & Junit2csvArgs): Promise<void> {
    const dir = new Path(yargs.sourceCSV);
    // if a direcotry is passed; turn it into a wildcard blob
    if (dir.isDir) {
      dir.push("*");
    }
    const junitFiles = getFiles(dir);
    const resultCSV: string[][] = [];
    // make the csv title
    for (let i = 0; i < junitFiles.length; i++) {
      const currentFile = junitFiles[i];
      try {
        const results = await this.processFile(currentFile);
        if (results.status == "success") {
          // unwrap each csv line and put in the doouble array
          results.resultsLines.forEach((line) => {
            resultCSV.push(line.split(",")); // split the string into it's components
          });
        } else {
          console.log(`failure ${results.message}`);
        }
      } catch (error) {
        console.log(`error processing ${currentFile.name}`);
        console.log(error);
      }
      if (yargs.max && i === yargs.max) break;
    }
    // add the header row
    console.log(`total rows: ${resultCSV.length}`);
    resultCSV.unshift(["name", "file_link", ...this.getCSVtitle()]);

    const csvStream = convertCSV(resultCSV);
    //   const te = new TextEncoder();
    try {
      await Deno.writeTextFile(yargs.results, csvStream);
    } catch (error) {
      console.log(`couldn't open and write to ${yargs.results}`);
    }

    console.table(resultCSV);
    // return yargs;
  }
  /**
   * take a 2d array and converts to a comma delimted csv file; with a row for each of the first
   * dimension and a column for each column. If its a string that 'can' be coerced to a number it does
   * so; and it puts quotes around strings.
   * @param resultCSV 2d array to be converted to a csvfile stream
   */

  async processFile(file: WalkEntry): Promise<CSVResults> {
    const result: CSVResults = {
      status: "failure",
      message: "unknwon failure",
      resultsLines: [],
    };
    try {
      const decoder = new TextDecoder("utf8");
      const csvFile = await Deno.readFile(file.path);
      const csvFileLines = decoder.decode(csvFile).split(/\r\n|\n/);
      // put the headers in the variable; and make csvFileLines just the data
      const headers = csvFileLines.shift() ?? "no headers";
      if (!this.setHeaders(headers)) {
        result.message = `${file.name} (${file.path}) is not a CSV file with headers compatible with the first file you read`;
      } else {
        result.status = "success";
        result.message = `CSV File Read for ${file.name}`;
        // append the filename as the first column in each case
        csvFileLines.forEach((line) => {
          if (line.length > 0)
            result.resultsLines.push(
              `${file.name},file://${file.path},${line}`
            );
        });
        // output line 2...length and put in results.  append filename to the beginning
      }
      return result;
    } catch (error) {
      result.message = error;
      return result;
    }
  }
  /**
   *
   * @param headers headers to set.
   * sets the headers class property for the csv file; and checks the the parameter matchs the
   * class property.  in both the case where the property was set or the paremeter matches the property;
   * return true
   */
  setHeaders(headers: string): boolean {
    if (this.headers === "") {
      this.headers = headers;
      return true;
    } else {
      return headers === this.headers;
    }
  }
  getCSVtitle(): string[] {
    return this.headers.split(",");
  }
}
interface CSVResults {
  status: "success" | "failure";
  message: string;
  resultsLines: string[];
}
