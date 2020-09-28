import { program } from "commander";
import create from "./commands/create";

program
  .command("create <name>")
  .description("create react project")
  // extracting project name
  .action((...args) => create(args[2]))
  .parse(process.argv);
