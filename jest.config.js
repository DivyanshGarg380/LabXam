export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "jsdom",

  extensionsToTreatAsEsm: [".ts", ".tsx"],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },

  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.app.json"
      }
    ]
  },

  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"]
};