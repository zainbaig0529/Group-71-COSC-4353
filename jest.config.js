export default {
    testEnvironment: 'node',
    transform: {
      '^.+\\.jsx?$': 'babel-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.jsx?$',
    transformIgnorePatterns: [],
    setupFilesAfterEnv: ['./setupTests.js'] // if you have setup tests
  };
  