import { prompt } from "inquirer";

void async function () {
  const result = await prompt([
    {
      name: "ProjectSetup",
      type: "checkbox",
      message: "Project setup",
      choices: ["typescript", "eslint", "scss", "unit-tests"]
    }
  ]);
  console.log(result);
}();
