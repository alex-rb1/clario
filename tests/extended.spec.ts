import { test, expect } from '@playwright/test'
test('links, alignment, underline, strike, and numbered lists survive reload', async ({
  page,
}) => {
  await page.goto('/canvas/new')
  await page.getByRole('button', { name: 'Add node', exact: true }).click()
  await page.getByRole('button', { name: 'Edit node', exact: true }).click()
  const editor = page.getByRole('textbox', { name: 'Node content' })
  await editor.fill('Documentation')
  await editor.press('Meta+a')
  await page.getByRole('button', { name: 'Underline', exact: true }).click()
  await page.getByRole('button', { name: 'Strikethrough', exact: true }).click()
  await page.getByRole('button', { name: 'Align center', exact: true }).click()
  page.once('dialog', (d) => d.accept('https://example.com/docs'))
  await page.getByRole('button', { name: 'Link', exact: true }).click()
  await expect(editor.locator('a')).toHaveAttribute(
    'href',
    'https://example.com/docs',
  )
  await expect(editor.locator('u')).toHaveText('Documentation')
  await expect(editor.locator('s')).toHaveText('Documentation')
  await page.getByRole('button', { name: 'Numbered list', exact: true }).click()
  await expect(editor.locator('ol')).toBeVisible()
  await page.reload()
  await expect(page.locator('.node-editor ol')).toBeVisible()
  await expect(page.locator('.node-editor a')).toHaveAttribute(
    'href',
    'https://example.com/docs',
  )
})
test('one hundred nodes remain editable and retain a changed viewport', async ({
  page,
}) => {
  await page.goto('/')
  await page.evaluate(() => {
    const nodes = Array.from({ length: 100 }, (_, i) => ({
      id: `n${i}`,
      type: 'block',
      position: { x: (i % 10) * 320, y: Math.floor(i / 10) * 220 },
      style: { width: 280, height: 180 },
      data: {
        title: `Idea ${i}`,
        content: '<p>A useful thought</p>',
        code: '',
        language: 'typescript',
        kind: 'standard',
      },
    }))
    localStorage.setItem(
      'clario:canvas:large',
      JSON.stringify({
        version: 1,
        document: {
          id: 'large',
          name: 'Large diagram',
          updatedAt: Date.now(),
          nodes,
          edges: [],
        },
      }),
    )
  })
  await page.goto('/canvas/large')
  await expect(page.locator('.react-flow__node-block')).toHaveCount(100)
  await page.getByRole('button', { name: 'Add node', exact: true }).click()
  await expect(page.locator('.react-flow__node-block')).toHaveCount(101)
  await page.keyboard.press('+')
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem('clario:canvas:large')!).document
            .viewport?.zoom,
      ),
    )
    .toBeGreaterThan(0)
  const transform = await page
    .locator('.react-flow__viewport')
    .getAttribute('style')
  await page.reload()
  await expect(page.locator('.react-flow__node-block')).toHaveCount(101)
  await expect(page.locator('.react-flow__viewport')).toHaveAttribute(
    'style',
    transform!,
  )
})
