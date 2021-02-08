type IWebpackConfigRemoveList = [RegExp | string, string][];

export const scssRelatedPackages = ["node-sass", "sass-loader"];

export const scssRelatedWebpackConfigs: IWebpackConfigRemoveList = [
  ["/\\.s(a|c)ss$/", "/\\.css/"],
  [/\n(.)*sass-loader(.)*/, ""]
];

export const eslintRelatedPackages = [
  "eslint",
  "eslint-plugin-import",
  "eslint-plugin-react",
  "eslint-plugin-react-hooks",
  "eslint-webpack-plugin",
  "@typescript-eslint/eslint-plugin",
  "@typescript-eslint/parser",
  "fork-ts-checker-webpack-plugin"
];

export const eslintRelatedFiles = [".eslintrc", ".eslintignore"];

export const eslintRelatedScripts = ["lint", "lint:fix"];

export const eslintRelatedWebpackConfigs: IWebpackConfigRemoveList = [
  [/\n.*eslint.webpack.plugin.*/g, ""],
  [/\n.*fork.ts.checker.webpack.plugin.*/g, ""],
  [/\n.*new.*ESLintPlugin(.*\n){6}.*/, ""],
  [/\n.*new.*ForkTsCheckerWebpackPlugin(.*\n){8}.*/, ""]
];
