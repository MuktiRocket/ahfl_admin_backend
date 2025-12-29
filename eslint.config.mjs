import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },

    { languageOptions: { globals: globals.browser } },
    {
        ignores: ["build/**/*", "node_modules/**/*"]
    },

    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    // Add custom rules
    {
        rules: {
            // Error Rules
            "semi": ["error", "always"],
            "keyword-spacing": "error",
            "space-infix-ops": "error",
            "space-unary-ops": "error",
            "key-spacing": ["error", { "afterColon": true }],
            "space-before-blocks": "error",
            "arrow-spacing": ["error", { "before": true, "after": true }],
            "comma-spacing": ["error", { before: false, after: true }],
            "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 0 }],
            "object-curly-spacing": ["error", "always"],

            // Warning Rules
            "no-console": "warn",
            "max-lines": ["warn", { "max": 250, "skipBlankLines": true, "skipComments": true }],
            "max-lines-per-function": ["warn", { "max": 25, "skipComments": true, "IIFEs": false }],
            "complexity": ["warn", { "max": 10 }],
            "max-statements": ["warn", { "max": 20 }]
        },
    },
];
