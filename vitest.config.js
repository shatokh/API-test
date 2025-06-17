// vitest.config.js
export default {
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
  },
};
