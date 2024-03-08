const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://demoshopping.ru",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
