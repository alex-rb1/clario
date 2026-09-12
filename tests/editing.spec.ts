import { test, expect } from '@playwright/test'
test('rich content formatting stays within the selected node',async({page})=>{
 await page.goto('/canvas/new');await page.getByRole('button',{name:'Add node',exact:true}).click()
 await page.getByRole('button',{name:'Edit node',exact:true}).click()
 const editor=page.getByRole('textbox',{name:'Node content'})
 await editor.fill('Understand the system');await editor.press('Meta+a')
 await page.getByRole('button',{name:'Bold',exact:true}).click()
 await expect(editor.locator('strong')).toHaveText('Understand the system')
 await page.getByRole('button',{name:'Italic',exact:true}).click();await expect(editor.locator('em')).toHaveText('Understand the system')
 await page.getByLabel('Font size').selectOption('20px');await expect(editor.locator('span')).toHaveAttribute('style',/font-size: 20px/)
 await page.getByRole('button',{name:'Bullet list',exact:true}).click();await expect(editor.locator('ul')).toBeVisible()
 await page.getByRole('button',{name:'Finish editing',exact:true}).click();await expect(page.getByRole('toolbar',{name:'Text formatting'})).toHaveCount(0)
})
