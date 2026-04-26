/**
 * Visual QA screenshot script.
 * Usage: node .claude/screenshot.mjs [--url http://localhost:5173] [--width 1440]
 *
 * Captures the current frontend and saves to .claude/screenshots/
 * Requires: dev server running at the target URL
 */

import { launch } from '../frontend/node_modules/puppeteer/lib/cjs/puppeteer/puppeteer.js'
import { existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const puppeteer = require('../frontend/node_modules/puppeteer')

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCREENSHOTS_DIR = join(__dirname, 'screenshots')

const args = process.argv.slice(2)
const getArg = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null }

const URL_TARGET = getArg('--url') || 'http://localhost:5173'
const WIDTH = parseInt(getArg('--width') || '1440', 10)

if (!existsSync(SCREENSHOTS_DIR)) mkdirSync(SCREENSHOTS_DIR, { recursive: true })

console.log(`📸 Capturing ${URL_TARGET} at ${WIDTH}px wide...`)

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

const page = await browser.newPage()

// Desktop
await page.setViewport({ width: WIDTH, height: 900, deviceScaleFactor: 1 })
await page.goto(URL_TARGET, { waitUntil: 'networkidle2', timeout: 30000 })
await new Promise((r) => setTimeout(r, 1500))

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
await page.screenshot({ path: join(SCREENSHOTS_DIR, `current-${timestamp}.png`), fullPage: true })
await page.screenshot({ path: join(SCREENSHOTS_DIR, 'current.png'), fullPage: true })

// Mobile
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 })
await page.reload({ waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 1000))
await page.screenshot({ path: join(SCREENSHOTS_DIR, 'current-mobile.png'), fullPage: true })

await browser.close()

console.log('✅ Saved to .claude/screenshots/')
console.log('   current.png        — desktop (latest)')
console.log(`   current-${timestamp}.png — desktop (timestamped)`)
console.log('   current-mobile.png — mobile (390px)')
console.log('\n🔍 Compare against: .claude/screenshots/reference/')
