import { test, expect } from '@playwright/test'
import { routeWire } from '../src/lib/routing'
test('routes around a card instead of crossing its body', () => {
  const obstacle = { x: 450, y: 160, width: 280, height: 180 }
  const points = routeWire(
    { x: 380, y: 250 },
    { x: 900, y: 250 },
    'right',
    'left',
    [
      { x: 100, y: 160, width: 280, height: 180 },
      obstacle,
      { x: 900, y: 160, width: 280, height: 180 },
    ],
  )
  expect(points).not.toBeNull()
  for (let i = 1; i < points!.length; i++) {
    const a = points![i - 1],
      b = points![i]
    expect(a.x === b.x || a.y === b.y).toBe(true)
    const crosses =
      a.x === b.x
        ? a.x > 450 &&
          a.x < 730 &&
          Math.max(a.y, b.y) > 160 &&
          Math.min(a.y, b.y) < 340
        : a.y > 160 &&
          a.y < 340 &&
          Math.max(a.x, b.x) > 450 &&
          Math.min(a.x, b.x) < 730
    expect(crosses).toBe(false)
  }
})
test('wire detours update when an intervening card moves', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    const make = (id: string, x: number) => ({
      id,
      type: 'block',
      position: { x, y: 160 },
      style: { width: 280, height: 180 },
      data: {
        title: id,
        content: '<p>A card</p>',
        code: '',
        language: 'typescript',
        kind: 'standard',
      },
    })
    localStorage.setItem(
      'clario:canvas:routing',
      JSON.stringify({
        version: 1,
        document: {
          id: 'routing',
          name: 'Routing',
          updatedAt: Date.now(),
          viewport: { x: 0, y: 0, zoom: 1 },
          nodes: [make('start', 50), make('obstacle', 450), make('end', 900)],
          edges: [
            {
              id: 'wire',
              source: 'start',
              target: 'end',
              sourceHandle: 'right',
              targetHandle: 'left',
              label: 'request',
            },
          ],
        },
      }),
    )
  })
  await page.goto('/canvas/routing')
  const path = page.locator('.react-flow__edge-path')
  await expect(path).toHaveAttribute('d', / Q /)
  const initial = await path.getAttribute('d')
  const obstacle = page.locator('[data-id="obstacle"] .block-title')
  const box = (await obstacle.boundingBox())!
  await obstacle.hover({ position: { x: 10, y: 10 } })
  await page.mouse.down()
  await page.mouse.move(box.x + 10, box.y + 260, { steps: 10 })
  await page.mouse.up()
  await expect(path).not.toHaveAttribute('d', initial!)
  await expect(page.locator('.react-flow__edge-text')).toHaveText('request')
  await page.screenshot({ path: 'test-results/routing.png' })
})
