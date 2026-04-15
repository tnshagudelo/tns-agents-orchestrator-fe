import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      all: true,
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.d.ts',
        'src/main.ts',
        'src/app/app.config.ts',
        'src/app/app.routes.ts',
        'src/app/**/*.routes.ts',
        'src/app/**/models/**',
        'src/app/**/*.model.ts',
        'src/app/**/*.types.ts',
        'src/app/**/*.const.ts',
        'src/app/**/*.data.ts',
        'src/app/**/index.ts',
        'src/environments/**',
      ],
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 85,
      },
    },
  },
});
