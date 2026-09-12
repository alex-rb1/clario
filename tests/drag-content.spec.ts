import { test, expect } from '@playwright/test'
for (const kind of ['standard', 'code'])
  test(`${kind}: drag content, double-click to edit, select text, then drag again`, async ({
    page,
  }) => {
    await page.goto('/canvas/new')
    await page.getByRole('button', { name: 'Add node', exact: true }).click()
    if (kind === 'code')
      await page.getByLabel('Node style').selectOption('code')
    const node = page.locator('.react-flow__node-block')
    const content = node.locator('.block-content')
    const drag = async () => {
      const before = (await node.boundingBox())!
      const area = (await content.boundingBox())!
      await page.mouse.move(area.x + 60, area.y + 60)
      await page.mouse.down()
      await page.mouse.move(area.x + 150, area.y + 105, { steps: 10 })
      await page.mouse.up()
      await expect
        .poll(async () => (await node.boundingBox())!.x)
        .toBeGreaterThan(before.x + 70)
    }
    await drag()
    await page
      .locator('.react-flow__pane')
      .click({ position: { x: 40, y: 350 } })
    await content.dblclick({ position: { x: 50, y: 55 } })
    const editor =
      kind === 'code'
        ? page.getByLabel('Code content')
        : page.getByRole('textbox', { name: 'Node content' })
    await editor.fill('function example() { return 42; }')
    const before = (await node.boundingBox())!
    await editor.press('Meta+a')
    expect(
      await editor.evaluate((el) =>
        el instanceof HTMLTextAreaElement
          ? el.selectionEnd - el.selectionStart
          : window.getSelection()?.toString().length,
      ),
    ).toBeGreaterThan(10)
    expect((await node.boundingBox())!.x).toBe(before.x)
    await page
      .getByRole('button', { name: 'Finish editing', exact: true })
      .click()
    await drag()
    await page.reload()
    await expect(node).toHaveCount(1)
    await expect(
      kind === 'code' ? node.locator('pre') : node.locator('.node-editor'),
    ).toContainText('function example()')
  })
test('title surface drags and double-click enables title editing', async ({
  page,
}) => {
  await page.goto('/canvas/new')
  await page.getByRole('button', { name: 'Add node', exact: true }).click()
  const node = page.locator('.react-flow__node-block')
  const before = (await node.boundingBox())!
  const title = node.locator('.block-title')
  await title.hover({ position: { x: 80, y: 20 } })
  await page.mouse.down()
  await page.mouse.move(before.x + 180, before.y + 80, { steps: 10 })
  await page.mouse.up()
  expect((await node.boundingBox())!.x).toBeGreaterThan(before.x + 70)
  await title.dblclick({ position: { x: 80, y: 20 } })
  await page.getByLabel('Node title', { exact: true }).fill('Renamed function')
  await page
    .getByRole('button', { name: 'Finish editing', exact: true })
    .click()
  await expect(page.getByLabel('Node title', { exact: true })).toHaveValue(
    'Renamed function',
  )
})
