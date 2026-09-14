import { test, expect } from '@playwright/test'
test('freehand strokes snap, persist, follow nodes, and switch routing', async ({
  page,
}) => {
  await page.goto('/canvas/new')
  const pane = page.locator('.react-flow__pane')
  await pane.dblclick({ position: { x: 150, y: 170 } })
  await pane.dblclick({ position: { x: 750, y: 400 } })
  await page.getByRole('button', { name: 'Freehand', exact: true }).click()
  const nodes = page.locator('.react-flow__node-block'),
    source = nodes.first().locator('.react-flow__handle-right'),
    target = nodes.nth(1).locator('.react-flow__handle-top')
  const a = (await source.boundingBox())!,
    b = (await target.boundingBox())!
  await source.hover()
  await page.mouse.down()
  await page.mouse.move(a.x + 130, a.y - 80, { steps: 12 })
  await page.mouse.move(a.x + 220, a.y + 80, { steps: 12 })
  await page.mouse.move(b.x + 16, b.y + 8, { steps: 12 })
  await page.mouse.up()
  await expect(page.locator('.react-flow__edge')).toHaveCount(1)
  const getData = () =>
    page.evaluate(
      () =>
        JSON.parse(
          localStorage.getItem(
            `clario:canvas:${location.pathname.split('/').pop()}`,
          )!,
        ).document.edges[0].data,
    )
  expect((await getData()).routing).toBe('freehand')
  expect((await getData()).freehand.points.length).toBeGreaterThan(10)
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(page.locator('.react-flow__edge')).toHaveCount(0)
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  await expect(page.locator('.react-flow__edge')).toHaveCount(1)
  const path = page.locator('.react-flow__edge-path'),
    original = await path.getAttribute('d')
  await page.getByLabel('Wire routing').selectOption('auto')
  await expect(path).not.toHaveAttribute('d', original!)
  await page.getByLabel('Wire routing').selectOption('freehand')
  await expect(path).toHaveAttribute('d', original!)
  await page.reload()
  await expect(path).toHaveAttribute('d', original!)
  const box = (await nodes.nth(1).boundingBox())!
  await nodes
    .nth(1)
    .locator('.block-title')
    .hover({ position: { x: 5, y: 20 } })
  await page.mouse.down()
  await page.mouse.move(box.x + 70, box.y + 70, { steps: 10 })
  await page.mouse.up()
  await expect(path).not.toHaveAttribute('d', original!)
})
test('freehand can be cancelled without creating a wire', async ({ page }) => {
  await page.goto('/canvas/new')
  await page.getByRole('button', { name: 'Add node', exact: true }).click()
  await page.getByRole('button', { name: 'Freehand', exact: true }).click()
  await page.locator('.react-flow__handle-right').hover()
  await page.mouse.down()
  await page.mouse.move(900, 450, { steps: 10 })
  await expect(page.locator('.freehand-preview')).toBeVisible()
  await page.keyboard.press('Escape')
  await page.mouse.up()
  await expect(page.locator('.freehand-preview')).toHaveCount(0)
  await expect(page.locator('.react-flow__edge')).toHaveCount(0)
  await page.getByRole('button', { name: 'Auto connect', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Auto connect', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
})
