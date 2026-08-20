export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/out/"],
  moduleDirectories: ["node_modules", "src"],
};

