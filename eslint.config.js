export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**"
    ]
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        Buffer: "readonly",
        URL: "readonly",
        console: "readonly",
        crypto: "readonly",
        document: "readonly",
        fetch: "readonly",
        FormData: "readonly",
        Headers: "readonly",
        performance: "readonly",
        process: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        window: "readonly"
      }
    },
    rules: {
      "eqeqeq": "error",
      "no-constant-condition": ["error", { "checkLoops": false }],
      "no-undef": "error",
      "no-unreachable": "error",
      "no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }]
    }
  }
];
