import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: process.env.CLARIO_BASE_URL || 'http://127.0.0.1:5173',
    channel: 'chrome',
    headless: true,
  },
  webServer: process.env.CLARIO_BASE_URL
    ? undefined
    : {
        command: 'npm run dev -- --host 127.0.0.1',
        url: 'http://127.0.0.1:5173',
        reuseExistingServer: true,
      },
})
