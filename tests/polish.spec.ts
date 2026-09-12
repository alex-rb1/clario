import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
test('dashboard and editing controls meet automated accessibility checks', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('heading', { level: 1 }).waitFor()
  for (const theme of ['dark', 'light']) {
    if (theme === 'light')
      await page.getByRole('button', { name: 'Toggle theme' }).click()
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(result.violations).toEqual([])
  }
  await page.goto('/canvas/new')
  await page.getByRole('button', { name: 'Add node', exact: true }).click()
  await page.getByRole('button', { name: 'Edit node', exact: true }).click()
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(result.violations).toEqual([])
})
test('small screens, modal focus, and theme persistence', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  )
  await page.getByRole('button', { name: 'Toggle theme' }).click()
  await page.reload()
  await expect(page.locator('.app')).toHaveAttribute('data-theme', 'light')
  await page.getByRole('button', { name: 'New canvas', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.goto('/canvas/new')
  await page.getByRole('button', { name: 'Add node', exact: true }).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  )
  await page
    .getByRole('button', { name: 'Keyboard shortcuts', exact: true })
    .click()
  await page.keyboard.press('n')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('.react-flow__node-block')).toHaveCount(1)
})
test('editing an unselected node, content history, deletion history, and backup', async ({
  page,
}) => {
  await page.goto('/canvas/new')
  await page.getByRole('button', { name: 'Add node', exact: true }).click()
  await page.locator('.react-flow__pane').click({ position: { x: 50, y: 250 } })
  await page.getByRole('button', { name: 'Edit node', exact: true }).click()
  await expect(
    page.getByRole('textbox', { name: 'Node content' }),
  ).toHaveAttribute('contenteditable', 'true')
  await page
    .getByRole('textbox', { name: 'Node content' })
    .fill('Keep this idea')
  await page
    .getByRole('button', { name: 'Finish editing', exact: true })
    .click()
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(page.locator('.node-editor')).toHaveText('Write an idea…')
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  await expect(page.locator('.node-editor')).toHaveText('Keep this idea')
  await page
    .getByRole('button', { name: 'Delete selected', exact: true })
    .click()
  await expect(page.locator('.react-flow__node-block')).toHaveCount(0)
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(page.locator('.node-editor')).toHaveText('Keep this idea')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download backup' }).click()
  expect((await download).suggestedFilename()).toMatch(/\.clario\.json$/)
})
