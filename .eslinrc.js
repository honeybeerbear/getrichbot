// {
//     "plugins": ["prettier"],
//     "extends": ["eslint:recommended", "plugin:prettier/recommended"],
//     "rules": {
//       "prettier/prettier": "error"
//     }
//   }
module.exports = {
  env: { browser: true, es6: true, node: true },
  extends: ["eslint:recommended", "airbnb", "plugin:prettier/recommended"],
  plugins: ["react", "react-hooks", "prettier"],
  rules: {
    "react/react-in-jsx-scope": 0,
    "react/prefer-stateless-function": 0,
    "react/jsx-filename-extension": 0,
    "react/jsx-one-expression-per-line": 0,
    "no-nested-ternary": 0,
  },
  globals: { react: "writable" },
};
