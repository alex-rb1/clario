import { test, expect } from '@playwright/test'
for (const name of [
  'Blank',
  'Algorithm / LeetCode',
  'System Architecture',
  'User Flow',
  'Project Planning',
  'Concept Map',
])
  test(`template: ${name}`, async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'New canvas', exact: true }).click()
    await page
      .locator('.template-option')
      .filter({ has: page.getByText(name, { exact: true }) })
      .click()
    await expect(page.getByLabel('Canvas name', { exact: true })).toHaveValue(
      name === 'Blank' ? 'Untitled canvas' : name,
    )
    if (name === 'Blank')
      await expect(page.locator('.react-flow__node-block')).toHaveCount(0)
    else {
      expect(
        await page.locator('.react-flow__node-block').count(),
      ).toBeGreaterThan(3)
      await page.reload()
      await page
        .getByRole('button', { name: 'Add node', exact: true })
        .waitFor()
      expect(
        await page.locator('.react-flow__node-block').count(),
      ).toBeGreaterThan(3)
    }
    await page.getByRole('button', { name: 'Add node', exact: true }).click()
    await expect(page.locator('.react-flow__node.selected')).toHaveCount(1)
  })
