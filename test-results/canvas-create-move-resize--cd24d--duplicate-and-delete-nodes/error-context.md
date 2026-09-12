# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: canvas.spec.ts >> create, move, resize, connect, multi-select, duplicate, and delete nodes
- Location: tests/canvas.spec.ts:2:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.react-flow__node-block')
Expected: 2
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" locator('.react-flow__node-block') with timeout 5000ms
  - waiting for locator('.react-flow__node-block')
    14 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "clario / space to think" [ref=e5] [cursor=pointer]:
      - /url: /
      - text: clario
      - generic [ref=e10]: / space to think
    - button "Toggle theme" [ref=e11] [cursor=pointer]
  - generic [ref=e18]:
    - generic [ref=e19]:
      - link "Back to canvases" [ref=e20] [cursor=pointer]:
        - /url: /
      - strong [ref=e23]: Untitled canvas
      - generic [ref=e24]: Double-click to add a node · Shift-drag to select
    - generic [ref=e25]:
      - generic [ref=e26]:
        - button "Add node" [ref=e27] [cursor=pointer]
        - button "Duplicate selected" [ref=e29] [cursor=pointer]
        - button "Delete selected" [ref=e33] [cursor=pointer]
      - application [ref=e37]:
        - group [active] [ref=e40]:
          - generic [ref=e41]:
            - generic [ref=e51]: Untitled
            - generic [ref=e52]: Write an idea…
        - generic "Control Panel" [ref=e54]:
          - button "Zoom In" [disabled]
          - button "Zoom Out" [ref=e55] [cursor=pointer]
          - button "Fit View" [ref=e58] [cursor=pointer]
          - button "Toggle Interactivity" [ref=e61] [cursor=pointer]
        - link "React Flow attribution" [ref=e65] [cursor=pointer]:
          - /url: https://reactflow.dev/attribution
          - text: React Flow
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | test('create, move, resize, connect, multi-select, duplicate, and delete nodes', async ({page})=>{
  3  |  await page.goto('/canvas/new')
  4  |  const pane=page.locator('.react-flow__pane')
  5  |  await pane.dblclick({position:{x:250,y:200}})
  6  |  await pane.dblclick({position:{x:700,y:400}})
  7  |  const nodes=page.locator('.react-flow__node-block')
> 8  |  await expect(nodes).toHaveCount(2)
     |                      ^ Error: expect(locator).toHaveCount(expected) failed
  9  |  const first=nodes.first(); const before=await first.boundingBox(); if(!before)throw Error('No node')
  10 |  await first.locator('.block-title').hover(); await page.mouse.down(); await page.mouse.move(before.x+150,before.y+80,{steps:10}); await page.mouse.up()
  11 |  expect((await first.boundingBox())!.x).not.toBe(before.x)
  12 |  await first.click()
  13 |  const resize=first.locator('.react-flow__resize-control.bottom.right'); await resize.hover(); await page.mouse.down(); await page.mouse.move((await first.boundingBox())!.x+350,(await first.boundingBox())!.y+230,{steps:10});await page.mouse.up()
  14 |  expect((await first.boundingBox())!.width).toBeGreaterThan(280)
  15 |  await first.locator('.source').dragTo(nodes.nth(1).locator('.target'))
  16 |  await expect(page.locator('.react-flow__edge')).toHaveCount(1)
  17 |  await first.click(); await nodes.nth(1).click({modifiers:['Meta']})
  18 |  await expect(page.locator('.react-flow__node.selected')).toHaveCount(2)
  19 |  await page.getByRole('button',{name:'Duplicate selected',exact:true}).click(); await expect(nodes).toHaveCount(4)
  20 |  await page.getByRole('button',{name:'Delete selected',exact:true}).click(); await expect(nodes).toHaveCount(2)
  21 | })
  22 | 
```