import yargs from "https://deno.land/x/yargs/deno.ts";
import { Arguments } from "https://deno.land/x/yargs_parser@v20.2.4-deno/build/lib/yargs-parser-types.d.ts";
//import { Arguments, YargsType } from "https://deno.land/x/yargs/deno-types.ts";

export interface YargCommand {
  processYarguments(yargs: Arguments): void;
  command(yargs: Arguments): void;
}
