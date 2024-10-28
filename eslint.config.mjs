import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import nextJsPlugin from "eslint-plugin-next";

export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      react: pluginReact,
      js: pluginJs,
      next: nextJsPlugin,
    },
    rules: {
      "react/no-unknown-property": [
        "error",
        {
          "ignore": ["jsx", "global"],
        },
      ],
    },
  },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  nextJsPlugin.configs.coreWebVitals,
];