import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MOTION_DEFAULTS, normalizeMotion, WELCOME_PRESETS } from '../lib/client/wallpaper-preferences.mjs'

test('legacy fireworks migrate once while wallpaper values retain their meaning', () => {
  const legacy = { fireworkIntensity: 100, motion: false, intensity: 81, speed: 72, sunset: 43, duration: 4.1 }
  const normalized = normalizeMotion(legacy)
  assert.equal(normalized.fireworkIntensity, 50)
  assert.equal(normalized.welcomeScaleVersion, 2)
  assert.equal(normalized.welcomeMotion, false)
  for (const key of ['motion', 'intensity', 'speed', 'sunset', 'duration']) assert.equal(normalized[key], legacy[key])
  assert.deepEqual(normalizeMotion(normalized), normalized)
  assert.equal(normalizeMotion({ fireworkIntensity: 35 }).fireworkIntensity, 17.5)
})

test('new welcome settings preserve both weaker and stronger effects', () => {
  const keys = ['fireworkIntensity', 'handAmplitude', 'handSpeed', 'ribbonAmplitude', 'ribbonSpeed', 'riverAmplitude', 'riverSpeed']
  assert.deepEqual(normalizeMotion(), MOTION_DEFAULTS)
  for (const value of [0, 25, 50, 75, 100]) {
    const normalized = normalizeMotion({ welcomeScaleVersion: 2, ...Object.fromEntries(keys.map(key => [key, value])) })
    for (const key of keys) assert.equal(normalized[key], value, `${key} retains ${value}`)
    assert.deepEqual(normalizeMotion(normalized), normalized)
  }
})

test('invalid values cannot escape the supported range or create extra fish', () => {
  assert.deepEqual(normalizeMotion(null), MOTION_DEFAULTS)
  const values = normalizeMotion({ welcomeScaleVersion: 2, fireworkIntensity: Infinity, handAmplitude: -5, handSpeed: 150, ribbonAmplitude: NaN, riverSpeed: '100', fishCount: 20 })
  assert.equal(values.fireworkIntensity, 50)
  assert.equal(values.handAmplitude, 0)
  assert.equal(values.handSpeed, 100)
  assert.equal(values.ribbonAmplitude, 50)
  assert.equal(values.riverSpeed, 50)
  assert.equal(values.fishCount, 3)
  assert.equal(normalizeMotion({ fishCount: 1 }).fishCount, 2)
  assert.equal(normalizeMotion({ fishCount: 2.4 }).fishCount, 2)
})

test('welcome presets are versioned and do not overwrite work or automatic-entry preferences', () => {
  const work = { ...MOTION_DEFAULTS, entrance: false, intensity: 19, speed: 64, sunset: 8, motion: false }
  for (const { values } of WELCOME_PRESETS) {
    const result = normalizeMotion({ ...work, ...values })
    for (const key of ['motion', 'entrance', 'intensity', 'speed', 'sunset']) assert.equal(result[key], work[key])
    assert.equal(normalizeMotion(values).fireworkIntensity, values.fireworkIntensity)
  }
  assert.deepEqual(normalizeMotion(WELCOME_PRESETS.find(p => p.id === 'festival').values), MOTION_DEFAULTS)
})
