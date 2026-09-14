import { test, expect } from '@playwright/test'
test('labels slide along the path, resize, undo, and persist', async ({
  page,
}) => {
  await page.goto('/')
  await page.evaluate(() => {
    const node = (id: string, x: number) => ({
      id,
      type: 'block',
      position: { x, y: 220 },
      style: { width: 280, height: 180 },
      data: {
        title: id,
        content: '<p>Idea</p>',
        code: '',
        kind: 'standard',
        language: 'typescript',
      },
    })
    localStorage.setItem(
      'clario:canvas:labels',
      JSON.stringify({
        version: 1,
        document: {
          id: 'labels',
          name: 'Labels',
          updatedAt: Date.now(),
          viewport: { x: 0, y: 0, zoom: 1 },
          nodes: [node('a', 60), node('b', 850)],
          edges: [
            {
              id: 'edge',
              source: 'a',
              target: 'b',
              sourceHandle: 'right',
              targetHandle: 'left',
              label: 'request',
            },
          ],
        },
      }),
    )
  })
  await page.goto('/canvas/labels')
  const label = page.locator('.wire-label')
  await expect(label).toBeVisible()
  const before = (await label.boundingBox())!
  await label.hover()
  await page.mouse.down()
  await page.mouse.move(
    before.x + before.width / 2 + 110,
    before.y + before.height / 2,
    { steps: 10 },
  )
  await page.mouse.up()
  expect((await label.boundingBox())!.x).toBeGreaterThan(before.x + 60)
  const resize = page.getByLabel('Resize connection label')
  const corner = (await resize.boundingBox())!
  await resize.hover()
  await page.mouse.down()
  await page.mouse.move(corner.x + 65, corner.y + 10, { steps: 10 })
  await page.mouse.up()
  await expect(page.locator('.react-flow__edge-text')).toHaveCSS(
    'font-size',
    /2[0-9].*px|3[0-6].*px/,
  )
  const size = await page
    .locator('.react-flow__edge-text')
    .evaluate((el) => getComputedStyle(el).fontSize)
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(page.locator('.react-flow__edge-text')).toHaveCSS(
    'font-size',
    '14px',
  )
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  await page.reload()
  await expect(page.locator('.react-flow__edge-text')).toHaveCSS(
    'font-size',
    size,
  )
  await expect(page.locator('marker[id="arrow-edge"]')).toHaveAttribute(
    'markerWidth',
    '18',
  )
})
