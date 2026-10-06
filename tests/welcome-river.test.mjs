import test from 'node:test'
import assert from 'node:assert/strict'
import { mountWelcomeRiver } from '../lib/client/welcome-river.mjs'

function fixture(options = {}) {
  const frames = new Map(), listeners = new Map(), mediaListeners = new Map()
  let nextFrame = 0, time = 0, observerDisconnected = false
  const media = { matches: false, addEventListener: (name, fn) => mediaListeners.set(name, fn), removeEventListener: name => mediaListeners.delete(name) }
  const view = {
    requestAnimationFrame(fn) { frames.set(++nextFrame, fn); return nextFrame },
    cancelAnimationFrame(id) { frames.delete(id) },
    matchMedia: () => media,
    ResizeObserver: class { observe() {} disconnect() { observerDisconnected = true } },
  }
  const document = {
    defaultView: view, hidden: false,
    createElement: tag => new Element(tag), createElementNS: (_, tag) => new Element(tag),
    addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name),
  }
  class Element {
    constructor(tag) { this.tag = tag; this.ownerDocument = document; this.style = {}; this.dataset = {}; this.children = []; this.attributes = new Map() }
    setAttribute(name, value) { this.attributes.set(name, value) }
    appendChild(node) { this.children.push(node); node.parent = this; return node }
    append(...nodes) { nodes.forEach(node => this.appendChild(node)) }
    querySelector() { return this.tail ??= new Element('g') }
    remove() { this.parent.children = this.parent.children.filter(node => node !== this) }
  }
  const host = new Element('div'); host.clientWidth = 1200; host.clientHeight = 240
  const river = mountWelcomeRiver(host, options)
  const fish = () => host.children[0].children.filter(node => node.dataset.riverFish)
  const snapshot = () => fish().map(node => [node.style.transform, node.style.opacity, node.children[0].style.transform, node.children[0].tail.attributes.get('transform')])
  const step = timestamp => {
    time = timestamp
    const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn(time))
  }
  const advance = milliseconds => { const end = time + milliseconds; if (time === 0) step(0); while (time < end) step(Math.min(time + 50, end)) }
  return { host, river, fish, snapshot, frames, advance, media,
    visibility(hidden) { document.hidden = hidden; listeners.get('visibilitychange')?.() },
    reduce(value) { media.matches = value; mediaListeners.get('change')?.() },
    cleaned: () => listeners.size === 0 && mediaListeners.size === 0 && observerDisconnected,
  }
}

test('three distinct fish overlap so at least two remain visible throughout repeated leap cycles', () => {
  const f = fixture()
  assert.deepEqual(f.fish().map(fish => fish.dataset.riverFish), ['gold-koi', 'vermilion-fantail', 'jade-minnow'])
  assert.equal(new Set(f.fish().map(fish => fish.style.width)).size, 3)
  assert.equal(new Set(f.fish().map(fish => fish.children[0].innerHTML)).size, 3)
  let allThreeVisible = false
  for (let sample = 0; sample < 200; sample++) {
    const visible = f.fish().filter(fish => Number(fish.style.opacity) >= .2).length
    assert.ok(visible >= 2, `At least two arc crossings at sample ${sample}`)
    allThreeVisible ||= visible === 3
    f.advance(50)
  }
  assert.ok(allThreeVisible)
  f.river.dispose()
})

test('fish cross a complete rising and falling arc, submerge, then repeat after 3.3 seconds without a horizontal swimming phase', () => {
  const f = fixture()
  const position = () => {
    const node = f.fish()[0]
    const match = node.style.transform.match(/translate3d\(([^p]+)px,([^p]+)px,0\) rotate\(([^d]+)deg\)/)
    assert.equal(node.children[0].style.transform, 'scaleX(1)', 'leaps must retain their crossing direction')
    return { x: Number(match[1]), y: Number(match[2]), angle: Number(match[3]) }
  }
  f.advance(200); const rising = position()
  f.advance(1150); const apex = position()
  f.advance(1150); const falling = position()
  assert.ok(rising.x < apex.x && apex.x < falling.x)
  assert.ok(apex.y < rising.y && apex.y < falling.y)
  assert.ok(rising.angle < 0 && falling.angle > 0)
  assert.ok(Math.abs(rising.y - falling.y) < .001)
  f.advance(400)
  assert.equal(f.fish()[0].style.opacity, '0', 'fish stays submerged between arcs')
  const submerged = f.fish()[0].style.transform
  f.advance(200)
  assert.equal(f.fish()[0].style.transform, submerged, 'no hidden horizontal swimming animation')
  f.advance(400); const nextLeap = position()
  assert.ok(Math.abs(nextLeap.x - rising.x) < .001 && Math.abs(nextLeap.y - rising.y) < .001)
  f.river.dispose()
})

test('two-fish option keeps exactly two fish', () => {
  const f = fixture({ fishCount: 2 })
  assert.equal(f.fish().length, 2)
  f.advance(12000)
  assert.equal(f.fish().filter(fish => Number(fish.style.opacity) >= .78).length, 2)
  f.river.dispose()
})

test('100 speed reaches the same pose in half the time as the default 50', () => {
  const normal = fixture(), fast = fixture({ speed: 100 })
  normal.advance(2000); fast.advance(1000)
  assert.deepEqual(fast.snapshot(), normal.snapshot())
  normal.river.dispose(); fast.river.dispose()
})

test('100 amplitude doubles the default leap displacement without enlarging fish', () => {
  const normal = fixture(), high = fixture({ amplitude: 100 }), still = fixture({ amplitude: 0 })
  normal.advance(1350); high.advance(1350)
  const y = fixture => Number(fixture.fish()[0].style.transform.match(/translate3d\([^,]+,([^p]+)px/)[1])
  assert.ok(Math.abs((y(still) - y(high)) - 2 * (y(still) - y(normal))) < .001)
  assert.equal(normal.fish()[0].style.width, high.fish()[0].style.width)
  normal.river.dispose(); high.river.dispose(); still.river.dispose()
})

test('zero amplitude, zero speed, and disabled motion produce static visible fish with no RAF', () => {
  for (const options of [{ amplitude: 0 }, { speed: 0 }, { motion: false }]) {
    const f = fixture(options), initial = f.snapshot()
    f.advance(1000)
    assert.deepEqual(f.snapshot(), initial)
    assert.equal(f.frames.size, 0)
    assert.equal(f.fish().filter(fish => fish.style.opacity === '0.78').length, 3)
    f.river.dispose()
  }
})

test('pause, hidden documents, reduced motion, freeze, and disposal own RAF correctly', () => {
  const f = fixture(); f.advance(2000)
  f.river.setPaused(true); const paused = f.snapshot(); f.advance(1000)
  assert.deepEqual(f.snapshot(), paused); assert.equal(f.frames.size, 0)
  f.river.setPaused(false); f.advance(1000)
  assert.notDeepEqual(f.snapshot(), paused); assert.equal(f.frames.size, 1)
  f.visibility(true); const hidden = f.snapshot(); f.advance(1000)
  assert.deepEqual(f.snapshot(), hidden); assert.equal(f.frames.size, 0)
  f.visibility(false); f.advance(500)
  assert.notDeepEqual(f.snapshot(), hidden)
  f.reduce(true); const reduced = f.snapshot(); f.advance(1000)
  assert.deepEqual(f.snapshot(), reduced); assert.equal(f.frames.size, 0)
  f.reduce(false); f.advance(500)
  f.river.freeze(); const frozen = f.snapshot()
  f.river.setMotion(false); f.river.setMotion(true); f.river.setPaused(false); f.advance(1000)
  assert.deepEqual(f.snapshot(), frozen); assert.equal(f.frames.size, 0)
  f.river.dispose(); f.river.dispose()
  assert.equal(f.host.children.length, 0); assert.equal(f.frames.size, 0); assert.ok(f.cleaned())
})
