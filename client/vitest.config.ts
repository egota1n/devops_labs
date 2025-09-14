// vitest.config.ts
import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      setupFiles: ['./src/tests/setup.js'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov', 'html'],
        all: true,
        include: ['src/**/*.{ts,vue}'],
      },
    },
  }),
)
