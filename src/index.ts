#! /usr/bin/env node

import { program } from "commander";
import create from "./commands/create";
// @ts-ignore
import packageJSON from "../package.json";

program.version(packageJSON.version);

program
  .command("create <name>")
  .description("create react project")
  .action(create);
  
program.parse(process.argv);
