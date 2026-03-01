const dotenv = require('dotenv');
dotenv.config({ path: '.env.development' });

const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: '.' });

const customJestConfig = {
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  testTimeout: 30000,
};

const jestConfig = async () => {
  const nextJestConfig = await createJestConfig(customJestConfig)();
  return {
    ...nextJestConfig,
    transformIgnorePatterns: ['/node_modules/(?!(node-pg-migrate|uuid))'],
    moduleNameMapper: {
      '^file://(/.*)$': '$1',
      ...nextJestConfig.moduleNameMapper,
    },
  };
};

module.exports = jestConfig;
