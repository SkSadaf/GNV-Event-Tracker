const { defineConfig } = require("cypress");
const webpackConfig = require("./webpack.config.js");
const path = require('path');

module.exports = defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
      webpackConfig,
    },
    specPattern: "gnv-event-tracker/src//*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/component.js",
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});