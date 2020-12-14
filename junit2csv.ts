import { Arguments } from "https://deno.land/x/yargs/deno-types.ts";
import { YargCommand } from "./command.ts";
import parse from "https://denopkg.com/nekobato/deno-xml-parser/index.ts";
// import Document from "https://denopkg.com/nekobato/deno-xml-parser/index.ts";
import { Path } from "https://deno.land/x/path@v2.2.0/src/Path.ts";
import { WalkEntry } from "https://deno.land/std@0.74.0/fs/walk.ts";
import { getFiles } from "./utils.ts";
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
 * Command class that converts a Junit directory to a csv.  implements
 * the interface YargComnad
 */
export class Junit2csv implements YargCommand {
  constructor() {
    // bind member that will be callbacks.
    this.processYarguments = this.processYarguments.bind(this);
    this.command = this.command.bind(this);
  }
  processYarguments(yargs: Arguments) {
    yargs.help(
      "collect topline statistics from a directory of junit xml files"
    );
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

  async command(yargs: Arguments & Junit2csvArgs): Promise<void> {
    const dir = new Path(yargs.testDir);
    // if a direcotry is passed; turn it into a wildcard blob
    if (dir.isDir) {
      dir.push("*");
    }
    const junitFiles = getFiles(dir);
    const resultCSV: string[][] = [];
    // make the csv title
    resultCSV.push(["name", ...this.getCSVtitle()]);
    for (let i = 0; i < junitFiles.length; i++) {
      const currentFile = junitFiles[i];
      try {
        const results = await this.processFile(currentFile);
        if (results.status == "success") {
          resultCSV.push([currentFile.name, ...results.results]);
        } else {
          console.log(`failure ${results.message}`);
        }
      } catch (error) {
        console.log(`error processing ${currentFile.name}`);
        console.log(error);
      }
      if (yargs.max && i === yargs.max) break;
    }
    const csvStream = this.convertCSV(resultCSV);
    const te = new TextEncoder();
    try {
      const csv = await Deno.open(yargs.results, { create: true, write: true });
      const result = await csv.write(te.encode(csvStream));
      if (result > 0) {
        console.log(
          `sucessfully wrote results to csv file in ${yargs.results}, ${result} bytes`
        );
      }
      csv.close();
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
  convertCSV(resultCSV: string[][]) {
    let resultsString = "";
    resultCSV.forEach((row) => {
      let rowString = "";
      row.forEach((cell, i) => {
        if (typeof cell === "string") {
          if (+cell !== NaN) {
            rowString += cell;
          } else {
            rowString += `"${cell}"`;
          }
        } else if (typeof cell !== "undefined") {
          // not a string
          rowString += cell;
        }
        if (i + 1 < resultCSV.length) {
          rowString += ",";
        }
      });
      resultsString += rowString + "\n";
    });
    return resultsString;
  }
  isTestSuite(xmlFile: Document) {
    return xmlFile?.root?.children[0].name == "testsuite" ?? false;
  }
  async processFile(file: WalkEntry): Promise<JUnitResults> {
    const result: JUnitResults = {
      status: "failure",
      message: "unknwon failure",
      results: [],
    };
    try {
      const decoder = new TextDecoder("utf8");
      const xmlEntry = await Deno.readFile(file.path);
      const xmlResult = parse(decoder.decode(xmlEntry));
      if (!this.isTestSuite(xmlResult)) {
        result.message = `${file.name} (${file.path}) is not a JUnit XML test suite result and was skipped`;
      } else {
        result.status = "success";
        result.message = `Test Suite Read for ${file.name}`;
        result.results = this.getCSVline(xmlResult);
        result.results.push(`file://${file.path}`);
      }
      return result;
    } catch (error) {
      result.message = error;
      return result;
    }
  }
  getCSVtitle(): string[] {
    return ["tests", "errors", "failures", "assertions", "time", "path"];
  }
  getCSVline(xml: Document): string[] {
    const testResults = xml?.root?.children[0]
      .attributes as JUnitXMLSuiteAttributes;
    return [
      testResults.tests,
      testResults.errors,
      testResults.failures,
      testResults.assertions,
      testResults.time,
    ];
  }
}
interface JUnitResults {
  status: "success" | "failure";
  message: string;
  results: string[];
}
interface JUnitXMLSuiteAttributes {
  assertions: string;
  errors: string;
  failures: string;
  file: string;
  name: string;
  skipped: string;
  tests: string;
  time: string;
  warnings: string;
}
