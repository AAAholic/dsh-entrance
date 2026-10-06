import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createPreviewServer } from './preview.mjs'
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const out = resolve('test-results')
await mkdir(out, { recursive: true })
const server = createPreviewServer()
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) })
const report = { checks: [], errors: [], scope: 'Independent browser controller and production assets; native verification is separate.' }
const check = (name, passed) => { report.checks.push({name, pass: Boolean(passed)}); assert.ok(passed, name) }
let page
try {
  page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  page.on('pageerror', error => report.errors.push(error.message))
  await page.goto(origin)
  const intro = page.locator('[data-dsh-entrance]')
  await intro.waitFor()
  await page.waitForFunction(() => document.querySelector('[data-dsh-entrance]')?.dataset.welcomePhase === 'settled')
  check('Startup reaches the settled storyboard', await intro.count() === 1)
  check('Three different fish are rendered', await intro.locator('[data-river-fish]').count() === 3)
  const visibilitySamples = await intro.locator('[data-welcome-river]').evaluate(async layer => {
    const samples = []
    for (let i=0; i<70; i++) { samples.push([...layer.querySelectorAll('[data-river-fish]')].filter(n => Number(n.style.opacity) > .05).length); await new Promise(r => setTimeout(r,50)) }
    return samples
  })
  check('Overlapping arc leaps show at least two fish throughout a full cycle', Math.min(...visibilitySamples) >= 2)
  await page.screenshot({ path: resolve(out, 'scene-desktop.png') })
  await page.keyboard.press('Space')
  await intro.waitFor({ state: 'detached' })
  check('Exit restores the input focus', await page.locator('#input').evaluate(n => n === document.activeElement))
  check('Exit key never enters workspace input', await page.locator('#input').inputValue() === '')
  const tools = page.locator('[data-dsh-entrance-controller]')
  await tools.getByRole('button', { name: '入场设置', exact: true }).click()
  const panel = tools.locator('.panel')
  check('Independent settings remain enabled without an active intro', await panel.locator('[data-field=handAmplitude]').isEnabled())
  check('Independent settings omit unrelated wallpaper controls', await panel.locator('[data-field=intensity]').count() === 0)
  check('Every new control defaults to the midpoint', await panel.locator('[data-field=handAmplitude],[data-field=handSpeed],[data-field=ribbonAmplitude],[data-field=ribbonSpeed],[data-field=riverAmplitude],[data-field=riverSpeed],[data-field=fireworkIntensity]').evaluateAll(nodes => nodes.length === 7 && nodes.every(n => Number(n.value) === 50)))
  await page.screenshot({ path: resolve(out, 'settings-desktop.png') })
  const range = async (key, value) => panel.locator(`[data-field=${key}]`).evaluate((n, value) => { n.value = String(value); n.dispatchEvent(new Event('input', { bubbles: true })) }, value)
  await range('fishCount', 2)
  await range('handAmplitude', 100)
  check('Settings persist locally', await page.evaluate(() => { const p = JSON.parse(localStorage.getItem('dsh.entrance.preferences.v2')); return p.fishCount === 2 && p.handAmplitude === 100 && p.welcomeScaleVersion === 2 }))
  await panel.getByRole('button', {name:'预览欢迎场景',exact:true}).click()
  await page.waitForFunction(() => document.querySelector('[data-dsh-entrance]')?.dataset.welcomePhase === 'settled')
  check('Two-fish preference reaches the actual renderer', await intro.locator('[data-river-fish]').count() === 2)
  const counter = await page.locator('#counter').boundingBox()
  await page.mouse.move(counter.x + counter.width/2, counter.y + counter.height/2)
  await page.mouse.down()
  await page.waitForTimeout(900)
  check('Water origin follows the pointer', Number((await intro.getAttribute('data-water-origin')).split(',')[0]) < .5)
  await page.screenshot({ path: resolve(out, 'water-exit.png') })
  await page.waitForTimeout(1500)
  check('A held pointer keeps the input shield after visual exit', await intro.count() === 1)
  await page.mouse.up()
  await intro.waitFor({state:'detached'})
  check('Exit click does not trigger the workspace button', await page.locator('#counter').textContent() === '测试按钮 · 0 次')
  await page.locator('#counter').click()
  check('Workspace is usable after exit', await page.locator('#counter').textContent() === '测试按钮 · 1 次')
  await page.setViewportSize({width:390,height:844})
  await tools.getByRole('button',{name:'入场设置',exact:true}).click()
  check('Narrow settings have no horizontal overflow', await panel.evaluate(n => n.scrollWidth <= n.clientWidth + 1))
  await page.screenshot({path:resolve(out,'settings-narrow.png')})
  await panel.getByRole('button',{name:'恢复默认',exact:true}).click()
  await panel.getByRole('button',{name:'预览欢迎场景',exact:true}).click()
  await page.waitForFunction(() => document.querySelector('[data-dsh-entrance]')?.dataset.welcomePhase === 'settled')
  await page.screenshot({path:resolve(out,'scene-narrow.png')})
  check('Narrow scene retains three fish', await intro.locator('[data-river-fish]').count() === 3)
  await page.keyboard.press('Escape'); await intro.waitFor({state:'detached'})
  await page.emulateMedia({reducedMotion:'reduce'})
  await tools.getByRole('button',{name:'重播入场',exact:true}).click()
  await page.waitForFunction(() => document.querySelector('[data-dsh-entrance]')?.dataset.welcomePhase === 'settled')
  check('Reduced motion keeps a static ribbon', await intro.locator('[data-welcome-ribbon] canvas').evaluate(n => n.style.display === 'none'))
  await page.keyboard.press('Escape'); await intro.waitFor({state:'detached'})
  check('Replay returns focus to the Shadow DOM button', await tools.locator('[data-preview]').evaluate(n => n.getRootNode().activeElement === n))
  await page.evaluate(() => window.entrance.dispose())
  check('Disable removes the controller and dialog', await tools.count() === 0 && await intro.count() === 0)
  check('No uncaught browser errors', report.errors.length === 0)
  report.status = 'passed'
} catch (error) { report.status = 'failed'; report.failure = error.stack; throw error }
finally { await writeFile(resolve(out,'browser-report.json'), JSON.stringify(report,null,2)); await browser.close(); await new Promise(resolve => server.close(resolve)); console.log(`${report.checks.filter(c=>c.pass).length}/${report.checks.length} browser checks passed`) }
