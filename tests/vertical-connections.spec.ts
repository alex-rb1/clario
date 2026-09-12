import { test, expect } from '@playwright/test'
test('vertical and existing horizontal connectors coexist and survive reopening', async ({
  page,
}) => {
  await page.goto('/canvas/new')
  const pane = page.locator('.react-flow__pane')
  await pane.dblclick({ position: { x: 250, y: 110 } })
  await pane.dblclick({ position: { x: 650, y: 380 } })
  const nodes = page.locator('.react-flow__node-block')
  await expect(nodes.first().locator('.react-flow__handle')).toHaveCount(4)
  await nodes
    .first()
    .locator('.react-flow__handle-bottom')
    .dragTo(nodes.nth(1).locator('.react-flow__handle-top'))
  await nodes
    .first()
    .locator('.react-flow__handle-right')
    .dragTo(nodes.nth(1).locator('.react-flow__handle-left'))
  await expect(page.locator('.react-flow__edge')).toHaveCount(2)
  const saved = () =>
    page.evaluate(() => {
      const id = location.pathname.split('/').pop()
      return JSON.parse(localStorage.getItem(`clario:canvas:${id}`)!).document
        .edges
    })
  await expect
    .poll(async () =>
      (await saved()).some(
        (e: { sourceHandle?: string; targetHandle?: string }) =>
          e.sourceHandle === 'bottom' && e.targetHandle === 'top',
      ),
    )
    .toBe(true)
  await page.reload()
  await expect(page.locator('.react-flow__edge')).toHaveCount(2)
  expect(
    (await saved()).some(
      (e: { sourceHandle?: string; targetHandle?: string }) =>
        e.sourceHandle === 'bottom' && e.targetHandle === 'top',
    ),
  ).toBe(true)
})

test('selected cards allow starting and ending connections on every side', async ({
  page,
}) => {
  await page.goto('/canvas/new')
  const pane = page.locator('.react-flow__pane')
  await pane.dblclick({ position: { x: 200, y: 130 } })
  await pane.dblclick({ position: { x: 720, y: 400 } })
  const nodes = page.locator('.react-flow__node-block')
  for (const [index, [from, to]] of [
    ['top', 'bottom'],
    ['bottom', 'right'],
    ['right', 'top'],
    ['left', 'bottom'],
  ].entries()) {
    await pane.click({ position: { x: 50, y: 350 } })
    await nodes.first().click({ position: { x: 100, y: 70 } })
    await nodes
      .nth(1)
      .click({ position: { x: 100, y: 70 }, modifiers: ['Meta'] })
    await expect(page.locator('.react-flow__node.selected')).toHaveCount(2)
    await nodes
      .first()
      .locator(`.react-flow__handle-${from}`)
      .dragTo(nodes.nth(1).locator(`.react-flow__handle-${to}`))
    await expect(page.locator('.react-flow__edge')).toHaveCount(index + 1)
  }
  const firstId = await nodes.first().getAttribute('data-id')
  const edges = await page.evaluate(
    () =>
      JSON.parse(
        localStorage.getItem(
          `clario:canvas:${location.pathname.split('/').pop()}`,
        )!,
      ).document.edges,
  )
  expect(
    edges.every((edge: { source: string }) => edge.source === firstId),
  ).toBe(true)
  await page.reload()
  await expect(page.locator('.react-flow__edge')).toHaveCount(4)
})
