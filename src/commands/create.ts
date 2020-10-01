import { resolve, join } from "path";
import { readFileSync, writeFileSync, renameSync, unlinkSync } from "fs";
import { prompt } from "inquirer";
import { copyDir } from "../util/fs";
import { exec as _exec } from "child_process";
import { promisify } from "util";
import {
  scssRelatedPackages,
  scssRelatedWebpackConfings,
  eslintRelatedPackages,
  eslintRelatedFiles,
  eslintRelatedScripts,
  eslintRelatedWebpackConfigs
} from "../config";

const exec = promisify(_exec);

const create = async (projectName: string) => {
  const rootDir = resolve(__dirname, "..", "..");
  if (!projectName) return console.log("project name is not provided!");
  try {
    const result: { ProjectSetup: string[] } = await prompt([
      {
        name: "ProjectSetup",
        type: "checkbox",
        message: "Project setup",
        choices: ["typescript", "scss", "eslint"]
      }
    ]);
    console.log(result.ProjectSetup);
    let template = "js";
    if (result.ProjectSetup.includes("typescript")) template = "ts";

    const projectPath = resolve(".", `${projectName}`);

    console.log("Creating project...");
    copyDir(resolve(rootDir, "templates", template), projectPath);

    const packageJSON = JSON.parse(readFileSync(resolve(projectPath, "package.json"), "utf-8"));
    const webpackConfigPath = resolve(projectPath, `webpack.config.${template}`);
    console.log(webpackConfigPath);
    let webpackConfigText = readFileSync(webpackConfigPath, "utf-8");

    if (!result.ProjectSetup.includes("scss")) {
      // remove scss related packages
      scssRelatedPackages.forEach(el => {
        delete packageJSON.devDependencies[el];
        delete packageJSON.dependencies[el];
      });

      // rename main.scss to main.css
      const mainStylesPath = resolve(projectPath, "src", "styles", "main");
      renameSync(`${mainStylesPath}.scss`, `${mainStylesPath}.css`);

      // change main styles import extension in index file
      const ext = template === "js" ? "js" : "tsx";
      const indexPath = resolve(projectPath, "src", `index.${ext}`);
      const newIndexText = readFileSync(indexPath, "utf-8").replace("main.scss", "main.css");
      writeFileSync(indexPath, newIndexText);

      // remove scss related configs from webpack.config.{js|ts}
      scssRelatedWebpackConfings.forEach(([src, target]) => {
        webpackConfigText = webpackConfigText.replace(src, target);
      });
    }

    if (!result.ProjectSetup.includes("eslint")) {
      // eslint packages to remove
      eslintRelatedPackages.forEach(el => {
        delete packageJSON.devDependencies[el];
        delete packageJSON.dependencies[el];
      });

      // remove eslint related files
      eslintRelatedFiles.forEach(el => unlinkSync(join(projectName, el)));

      // remove eslint related scripts
      eslintRelatedScripts.forEach(el => delete packageJSON.scripts[el]);

      // remove eslint related configs webpack.config.{js|ts}
      eslintRelatedWebpackConfigs.forEach(([src, target]) => {
        webpackConfigText = webpackConfigText.replace(src, target);
      });
    }

    writeFileSync(webpackConfigPath, webpackConfigText);

    const dependencies = Object.keys(packageJSON.dependencies);
    const devDependencies = Object.keys(packageJSON.devDependencies);
    packageJSON.name = `${projectName}`;
    delete packageJSON.dependencies;
    delete packageJSON.devDependencies;

    writeFileSync(resolve(projectPath, "package.json"), JSON.stringify(packageJSON, null, 2));

    console.log("Installing dependencies...");
    await exec(`npm i --prefix=${projectPath} ${dependencies.join(" ")}`);
    console.log("Installing dev dependencies...");
    await exec(`npm i -D --prefix=${projectPath} ${devDependencies.join(" ")}`);
    console.log("Almost ready...");

    console.log("Done!");
    console.log(`To start dev server run - cd ${projectName} && npm run dev`);

  } catch (e) {
    console.error(e);
  }
};

export default create;
