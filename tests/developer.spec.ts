import { test, expect } from '@playwright/test'
test('code nodes highlight and copy source; connections accept labels and dashed lines', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/canvas/new')
  await page
    .locator('.react-flow__pane')
    .dblclick({ position: { x: 160, y: 200 } })
  await page.getByLabel('Node style').selectOption('code')
  await page.getByRole('button', { name: 'Edit node', exact: true }).click()
  await page.getByLabel('Code content').fill('const answer = 42;')
  await page.getByLabel('Code language').selectOption('javascript')
  await page
    .getByRole('button', { name: 'Finish editing', exact: true })
    .click()
  await expect(page.locator('.hljs-keyword')).toHaveText('const')
  await page.getByRole('button', { name: 'Copy code', exact: true }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'const answer = 42;',
  )
  await page
    .locator('.react-flow__pane')
    .dblclick({ position: { x: 750, y: 400 } })
  await page.locator('.source').first().dragTo(page.locator('.target').nth(1))
  await page.locator('.react-flow__edge-interaction').click({ force: true })
  await page.getByLabel('Connection label').fill('next')
  await page.getByLabel('Connection style').selectOption('dashed')
  await expect(page.locator('.react-flow__edge-text')).toHaveText('next')
  await expect(page.locator('.react-flow__edge-path')).toHaveCSS(
    'stroke-dasharray',
    '6px, 5px',
  )
})
