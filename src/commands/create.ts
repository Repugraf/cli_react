import { resolve, join } from "path";
import { readFileSync, writeFileSync, renameSync, unlinkSync } from "fs";
import { prompt } from "inquirer";
import { copyDir, exec } from "../helpers/util";
import {
  scssRelatedPackages,
  scssRelatedWebpackConfigs,
  eslintRelatedPackages,
  eslintRelatedFiles,
  eslintRelatedScripts,
  eslintRelatedWebpackConfigs
} from "../config";

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

    let template = "js";
    if (result.ProjectSetup.includes("typescript")) template = "ts";

    const projectPath = resolve(".", `${projectName}`);
    const ext = template === "js" ? "js" : "tsx";

    console.log("Creating project...");
    copyDir(resolve(rootDir, "templates", "common"), projectPath);
    copyDir(resolve(rootDir, "templates", template), projectPath);
    const indexPath = resolve(projectPath, "src", "index");
    const appPath = resolve(projectPath, "src", "components", "App");
    if (template === "ts") {
      renameSync(`${indexPath}.js`, `${indexPath}.${ext}`);
      renameSync(`${appPath}.js`, `${appPath}.${ext}`);
    }

    const packageJSON = JSON.parse(readFileSync(resolve(projectPath, "package.json"), "utf-8"));
    const webpackConfigPath = resolve(projectPath, `webpack.config.${template}`);
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
      const indexPath = resolve(projectPath, "src", `index.${ext}`);
      const newIndexText = readFileSync(indexPath, "utf-8").replace("main.scss", "main.css");
      writeFileSync(indexPath, newIndexText);

      // remove scss related configs from webpack.config.{js|ts}
      scssRelatedWebpackConfigs.forEach(([src, target]) => {
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
    await exec(`npm install ${dependencies.join(" ")}`, { cdw: projectPath });

    console.log("Installing dev dependencies...");
    await exec(`npm install -D ${devDependencies.join(" ")}`, { cdw: projectPath });

    console.log("Done!");
    console.log(`To start dev server run: \ncd ${projectName}\nnpm run dev`);

  } catch (e) {
    console.error(e);
  }
};

export default create;
