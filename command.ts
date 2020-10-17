import yargs from "https://deno.land/x/yargs/deno.ts";
import { Arguments, YargsType } from "https://deno.land/x/yargs/types.ts";

export interface YargCommand {
  processYarguments(yargs: YargsType): void;
  command(yargs: YargsType): void;
}
