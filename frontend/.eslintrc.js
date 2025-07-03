module.exports = {
  env: {
    browser: true,  // For browser-based JavaScript
    node: true,     // For Node.js globals (if needed)
    es2021: true,   // For ES2021 features
  },
  extends: [
    'eslint:recommended',                // ESLint's recommended rules
    'plugin:react/recommended',          // React-specific linting rules
    'plugin:@typescript-eslint/recommended',  // TypeScript linting rules
  ],
  parser: '@typescript-eslint/parser',  // Parser for TypeScript
  parserOptions: {
    ecmaVersion: 12,  // ECMAScript version
    sourceType: 'module',  // Use ES modules (import/export)
  },
  plugins: [
    'react',              // React plugin for ESLint
    '@typescript-eslint', // TypeScript plugin for ESLint
  ],
  rules: {
    'no-unused-vars': 'warn',  // Example: warn on unused variables
    // Add more custom rules here as needed
  },
};