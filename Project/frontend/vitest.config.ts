import { defineConfig } from 'vitest/config';

// Only the pure logic in src/lib is tested. Keep Next's build output out of the test run.
export default defineConfig({
  test: { include: ['src/**/*.test.ts'], exclude: ['node_modules', '.next'] },
});
