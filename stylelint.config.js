/** @type {import('stylelint').Config} */
export default {
  customSyntax: "postcss-scss",
  plugins: ["stylelint-scss", "stylelint-value-no-unknown-custom-properties"],
  rules: {
    "csstools/value-no-unknown-custom-properties": [
      true,
      {
        importFrom: ["src/styles/theme/dark.css", "src/styles/theme/light.css", "src/styles/variables.css"],
      },
    ],
  },
};
