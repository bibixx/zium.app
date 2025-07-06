// eslint-disable-next-line no-undef
const styleDictionaryMode = process.env.STYLE_DICTIONARY_MODE;

const selector = styleDictionaryMode === "light" ? "html.light" : ":root";

// eslint-disable-next-line no-undef
module.exports = {
  source: [`src/tokens/${styleDictionaryMode}.sd.json`],
  platforms: {
    css: {
      transformGroup: "css",
      files: [
        {
          destination: `src/styles/theme/${styleDictionaryMode}.css`,
          format: "css/variables",
        },
      ],
      options: {
        selector,
      },
    },
  },
};
