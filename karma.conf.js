const { createDefaultConfig } = require('@open-wc/testing-karma');
const { merge } = require('webpack-merge');

module.exports = (config) => {
  config.set(
    merge(createDefaultConfig(config), {
      coverageIstanbulReporter: {
        thresholds: {
          global: {
            statements: 0,
            branches: 0,
            functions: 0,
            lines: 0,
          },
        },
      },

      files: [
        // runs all files ending with .test in the test folder,
        // can be overwritten by passing a --grep flag. examples:
        //
        // npm run test -- --grep test/foo/bar.test.js
        // npm run test -- --grep test/bar/*
        { pattern: config.grep ? config.grep : 'element/test/**/*.test.js', type: 'module' },
      ],

      esm: {
        nodeResolve: true,
      },
      // you can overwrite/extend the config further
    }),
  );
  return config;
};
