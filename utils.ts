/**
 * Utility Functions
 */
import {
  expandGlobSync,
  WalkEntry,
} from "https://deno.land/std@0.74.0/fs/mod.ts";
import { Path } from "https://deno.land/x/path@v2.2.0/src/Path.ts";

/**
 * for a glob, return all the directories and none of the files.
 * @param glob a file wildcard to search for directories
 * @returns an empty array if nothing found or an array of WalkEntry's of directories at the path
 */
export function getDirectories(glob: string): WalkEntry[] {
  const dirCond = (w: WalkEntry) => w.isDirectory;
  return walkGlob(dirCond, glob);
}
/**
 * for a glob, return all the files and none of the directories.
 * @param glob a file wildcard to search for files
 * @returns an empty array if nothing found or an array of WalkEntry's of files at the path
 */

export function getFiles(dir: Path): WalkEntry[] {
  const fileCond = (w: WalkEntry) => w.isFile;
  return walkGlob(fileCond, dir.toString());
}
/**
 * Shallow walk of a glob that returns WalkEntries that match a function test
 * @param condFunc function taking a walkentry that returns true or fals for whether the file should
 * be included in results set
 * @param glob glob wildcard of where to search for files/directories
 */
function walkGlob(condFunc: (w: WalkEntry) => boolean, glob: string) {
  const entries: WalkEntry[] = [];
  for (const file of expandGlobSync(glob)) {
    if (condFunc(file)) {
      entries.push(file);
    }
  }
  return entries;
}
