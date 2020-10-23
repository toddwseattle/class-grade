# Class Grade Runner

This is a class grade runner designed to be used with GitHub Classroom and the GitHub classroom desktop tool. It enables a batch command to be run on a set of directories--for example the set of github repositories downloaded for an assignment from github classroom.

It also has a command that given a folder of JUnit compatible xml Test results will create a csv with the top-line statistics, using each file as a key.

## Using

As of this writing, the class grade runner is a work in progress. It's written using [Deno](https://deno.land), a new typescript based successor to node. The Deno environment needs to be installed on a computer to run. Once installed, the work in progress can be run.

The command needs to be given filesystem read an write privileges to work correctly. It also currently uses some of the standard libraries for expanding wild cards and so on; so for example:

```bash
deno run --allow-read --allow-write --unstable main.ts --help
```

will output the help text.

## Installing locally

For this early version, there isn't an install from the net; but you can make it a cli by using the following deno command from the root directory of the repository on your machine:

```bash
deno install --allow-read --allow-write --unstable --name gh-grade main.ts
```

Then, assuming your path is configured correctly (See the [page on the deno script installer](https://deno.land/manual@v1.4.6/tools/script_installer)) you can run the command by simply typing

```bash
gh-grade --help
```

at the command line

## Commands

Assuming installation, the following commands and options are available:

### `run-test`: Run a command on each repository / directory

```bash
gh-grade run-tests
```

#### run-tests Options

##### `--command` _command_

the command to run in each directory. by default, a file marker token, `_OUTPUT_` can be used to specify the location of the output file.

For example, to run phpunit on testfile.php; and place the xml junit output in a directory; the option would be:

```bash
gh-grade run-tests --command phpunit --log-junit _OUTPUT_ ./myTest.php
```

This would cause phpunit to be executed for each directory; replacing `_OUTPUT_` with a path to a filename in the results directory.

##### `--resultsPath` _path_

the path where the results files should go. \_results in the current directory by default.

##### `--path` _path_

Parent path which has subdirectories on which the `command` will be run. For example, the directory where github classroom saved all the repositories for a given assignment

##### `--max` _number_

run for the first _number_ directories (good to make sure the command works...).

### junit2csv: create a summary csv file from a directory of junit xml files

junit2csv looks through a directory of xml files output in junit compatible format; and for each file, takes the summary statistics from the first test suite in the file. It skips files in the path that are not compatible. It creates a csv with columns for filename, tests, errors, failures, assertions, and running time.

#### junit2csv options

##### `--test-dir` _path_

path to location of the junit xml files (default current directory)

##### `--results` _path_

file name to store the comma delimited results (default results.csv in the current directory)

##### junit2csv option: `--max` _number_

run for the first _number_ files (good to make sure the command works...).

## Structure
