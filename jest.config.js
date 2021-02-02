require("jest-config");

module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["jest-extended", "./setup.js"],
  testMatch: [
    "<rootDir>/__tests__/unit/**/*.js",
    "<rootDir>/__tests__/api/**/*.js",
  ],
};
