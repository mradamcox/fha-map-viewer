import js from "@eslint/js";
import css from "@eslint/css";
import html from "eslint-plugin-html";

export default [
  // 1. JavaScript Configuration
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off"
    }
  },

  // 2. CSS Configuration
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    rules: {
      "css/no-empty-blocks": "error",
      "css/no-duplicate-imports": "error"
    }
  },

  // 3. HTML Configuration
  {
    files: ["**/*.html"],
    plugins: { html },
    settings: {
      "html/html-extensions": [".html"]
    }
  }
];