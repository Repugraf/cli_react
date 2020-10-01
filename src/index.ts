#! /usr/bin/env node

import { program } from "commander";
import create from "./commands/create";

program.version(require("../package.json").version, "-v, --version");

program
  .command("create <name>")
  .description("create react project")
  .action(create);
  
program.parse(process.argv);
