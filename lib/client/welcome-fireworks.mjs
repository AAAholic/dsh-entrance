// Five finite fireworks follow the welcome scene's design clock (0..2.4 s).
// The caller owns timing, reduced motion, cached viewport size and disposal.
const END = 2.4
const TAU = Math.PI * 2
const PALETTE = ['#ffd06a', '#ff983f', '#ff604e']
const SAMPLES = 72
const clamp = (value, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, value))
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t) }
const finite = (value, fallback) => typeof value === 'number' && Number.isFinite(value) ? value : fallback

function makeFirework(start, rise, life, x, y, radius, colors, seed, kind) {
  let state = seed
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296 }
  const particles = []
  const count = kind === 'peony' ? 68 : kind === 'palm' ? 24 : kind === 'willow' ? 34 : kind === 'brocade' ? 46 : 42
  for (let i = 0; i < count; i += 1) {
    const inner = kind === 'peony' && i >= 43
    const ringIndex = inner ? i - 43 : i
    const ringCount = kind === 'peony' ? inner ? 25 : 43 : count
    let angle = (ringIndex + random() * .56) / ringCount * TAU
    let speed = radius * (.71 + random() * .31)
    let gravity = radius * (.63 + random() * .21)
    let vertical = .9, tail = .24 + random() * .12, segments = 6, width = .98 + random() * .5
    let bead = .8 + random() * .48, drag = 2.35, fadeStart = .61
    if (kind === 'willow') {
      speed = radius * (.57 + random() * .42)
      gravity = radius * (1.25 + random() * .4)
      vertical = .86; tail = .49 + random() * .19; segments = 10; width = .78 + random() * .46; drag = 2.9
    } else if (kind === 'peony') {
      speed = radius * (inner ? .39 + random() * .16 : .82 + random() * .2)
      gravity = radius * (.24 + random() * .11)
      vertical = .94; tail = .035 + random() * .038; segments = 2; width = .84; bead = 1.5 + random() * .72; fadeStart = .49
    } else if (kind === 'palm') {
      angle = -2.95 + Math.floor(i / 3) / 7 * 2.76 + (i % 3 - 1) * .032
      speed = radius * (.72 + random() * .28)
      gravity = radius * (1.3 + random() * .27)
      vertical = 1.12; tail = .49 + random() * .13; segments = 8; width = 1.34 + random() * .4; bead = .95; drag = 2.7
    } else if (kind === 'brocade') {
      speed = radius * (.58 + random() * .43)
      gravity = radius * (.78 + random() * .36)
      vertical = .72; tail = .4 + random() * .19; segments = 9; width = .96 + random() * .5; drag = 2.8
    }
    const vx = Math.cos(angle) * speed
    const vy = Math.sin(angle) * speed * vertical
    const bend = (random() - .5) * radius * (kind === 'palm' ? .26 : .17)
    const flutter = radius * (.006 + random() * .01)
    const phase = random() * TAU
    const trajectory = new Float32Array((SAMPLES + 1) * 2)
    for (let j = 0; j <= SAMPLES; j += 1) {
      const p = j / SAMPLES
      const travel = 1 - Math.pow(1 - p, drag)
      trajectory[j * 2] = vx * travel + bend * p * p + flutter * Math.sin(p * 7 + phase) * p * p
      trajectory[j * 2 + 1] = vy * travel + gravity * Math.pow(p, 1.8)
    }
    const gaps = new Float32Array(segments)
    for (let j = 0; j < segments; j += 1) gaps[j] = .62 + random() * .23
    const colorIndex = kind === 'peony' ? inner ? 0 : i % 5 ? 2 : 1 : colors[(i + Math.floor(random() * colors.length)) % colors.length]
    particles.push({
      trajectory, gaps, segments, tail, width, bead, fadeStart,
      delay: random() * .026,
      life: life * (.86 + random() * .14),
      alpha: .79 + random() * .2,
      shimmer: random() * TAU,
      color: PALETTE[colorIndex],
      hot: colorIndex === 2 ? '#ffc08b' : '#ffe6a0',
      specks: kind !== 'peony' && i % 3 !== 1,
    })
  }
  const launchX = clamp(x + (random() - .5) * .17, .04, .96)
  return {
    start, rise, life, x, y, particles, kind, color: PALETTE[colors[0]],
    launchX, controlX: launchX + (x - launchX) * .25 + (random() - .5) * .035,
    tail: .052 + random() * .02,
  }
}

// Each finite bloom keeps its own morphology; position and timing belong to the
// scene. Trajectories and ember spacing are precomputed, shared and deterministic.
const FIREWORKS = [
  makeFirework(.06, .50, 1.05, .18, .56, .13, [0], 31, 'chrysanthemum'),
  makeFirework(.21, .58, 1.05, .90, .20, .23, [0, 1], 47, 'willow'),
  makeFirework(.66, .54, 1.05, .44, .53, .493, [2, 0, 1], 68, 'peony'),
  makeFirework(.94, .53, .84, .92, .43, .15, [2], 89, 'palm'),
  makeFirework(1.07, .52, .78, .53, .30, .41, [2, 1, 0], 103, 'brocade'),
]

function trajectoryAt(particle, t, axis) {
  const at = clamp(t) * SAMPLES
  const index = Math.min(SAMPLES - 1, Math.floor(at))
  const start = particle.trajectory[index * 2 + axis]
  return start + (particle.trajectory[(index + 1) * 2 + axis] - start) * (at - index)
}

export function createWelcomeFireworks(container, { intensity = 100 } = {}) {
  if (!container?.ownerDocument || typeof container.appendChild !== 'function') {
    throw new TypeError('createWelcomeFireworks requires a positioned DOM container')
  }
  const document = container.ownerDocument
  const view = document.defaultView
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  canvas.dataset.welcomeFireworks = ''
  const gain = clamp(finite(intensity, 100) / 100)
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:8;'
  canvas.style.opacity = String(gain)
  container.appendChild(canvas)
  const ctx = canvas.getContext('2d', { alpha: true })
  let width = 1, height = 1, ratio = 1, allocated = false, disposed = false

  function resize(nextWidth, nextHeight) {
    nextWidth = Math.max(1, finite(nextWidth, null) ?? (allocated ? width : container.clientWidth))
    nextHeight = Math.max(1, finite(nextHeight, null) ?? (allocated ? height : container.clientHeight))
    const nextRatio = Math.min(1, view?.devicePixelRatio || 1, Math.sqrt(600000 / (nextWidth * nextHeight)))
    if (allocated && nextWidth === width && nextHeight === height && nextRatio === ratio) return
    width = nextWidth; height = nextHeight; ratio = nextRatio
    canvas.width = Math.max(1, Math.floor(width * ratio))
    canvas.height = Math.max(1, Math.floor(height * ratio))
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    ctx.lineCap = 'round'
    allocated = true
  }

  function clear() {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    ctx.globalAlpha = 1
  }

  function launchX(firework, p) {
    const inverse = 1 - p
    return (inverse * inverse * firework.launchX + 2 * inverse * p * firework.controlX + p * p * firework.x) * width
  }

  function launchY(firework, p) {
    const inverse = 1 - p
    return (inverse * inverse * 1.025 + 2 * inverse * p * (firework.y + .31) + p * p * firework.y) * height
  }

  function drawLaunch(firework, age, scale) {
    const q = clamp(age / firework.rise)
    const head = 1 - Math.pow(1 - q, 1.45)
    const tail = 1 - Math.pow(1 - clamp((age - firework.tail) / firework.rise), 1.45)
    const alpha = smooth(q / .09) * (.79 + Math.sin(q * Math.PI) * .17)
    ctx.strokeStyle = firework.color
    for (let i = 0; i < 6; i += 1) {
      const a = tail + (head - tail) * i / 6
      const b = tail + (head - tail) * (i + .81) / 6
      const m = (a + b) / 2
      const x = launchX(firework, a), y = launchY(firework, a)
      const endX = launchX(firework, b), endY = launchY(firework, b)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.quadraticCurveTo(2 * launchX(firework, m) - (x + endX) / 2, 2 * launchY(firework, m) - (y + endY) / 2, endX, endY)
      ctx.lineWidth = 3.4 * scale
      ctx.globalAlpha = alpha * (i + 1) / 6 * .2
      ctx.stroke()
      ctx.lineWidth = 1.15 * scale
      ctx.globalAlpha = alpha * (i + 1) / 6
      ctx.stroke()
    }
    ctx.globalAlpha = alpha
    ctx.fillStyle = '#ffe3a1'
    ctx.beginPath()
    ctx.arc(launchX(firework, head), launchY(firework, head), 1.65 * scale, 0, TAU)
    ctx.fill()

    // A few dim embers peel off the trail and drop behind the rising comet.
    for (let i = 0; i < 4; i += 1) {
      const emberAge = age - .027 * (i + 1)
      if (emberAge <= 0) continue
      const p = 1 - Math.pow(1 - clamp(emberAge / firework.rise), 1.45)
      const drift = (i % 2 ? -1 : 1) * (i + 1) * .85 * scale
      ctx.globalAlpha = alpha * (.28 - i * .045)
      ctx.fillStyle = firework.color
      ctx.beginPath()
      ctx.arc(launchX(firework, p) + drift, launchY(firework, p) + i * i * 1.1 * scale, (.85 - i * .11) * scale, 0, TAU)
      ctx.fill()
    }
  }

  function drawBurst(firework, age, shortest, scale) {
    const cx = firework.x * width, cy = firework.y * height
    if (age < .065) {
      ctx.globalAlpha = (1 - age / .065) * .8
      ctx.fillStyle = '#ffe3a1'
      ctx.beginPath()
      ctx.arc(cx, cy, (1.8 + age * 25) * scale, 0, TAU)
      ctx.fill()
    }
    for (const particle of firework.particles) {
      const u = (age - particle.delay) / particle.life
      if (u <= 0 || u >= 1) continue
      const alpha = smooth(u / .028) * (1 - smooth((u - particle.fadeStart) / (1 - particle.fadeStart))) * particle.alpha
      if (alpha < .004) continue
      const from = Math.max(0, u - particle.tail * (.72 + u * .28))
      const span = (u - from) / particle.segments
      const shimmer = .84 + .16 * Math.sin(u * 23 + particle.shimmer)
      ctx.strokeStyle = particle.color
      ctx.fillStyle = particle.color
      for (let i = 0; i < particle.segments; i += 1) {
        const a = from + span * i
        const b = a + span * particle.gaps[i]
        const m = (a + b) / 2
        const x = cx + trajectoryAt(particle, a, 0) * shortest
        const y = cy + trajectoryAt(particle, a, 1) * shortest
        const endX = cx + trajectoryAt(particle, b, 0) * shortest
        const endY = cy + trajectoryAt(particle, b, 1) * shortest
        const controlX = 2 * (cx + trajectoryAt(particle, m, 0) * shortest) - (x + endX) / 2
        const controlY = 2 * (cy + trajectoryAt(particle, m, 1) * shortest) - (y + endY) / 2
        const strength = Math.pow((i + 1) / particle.segments, 1.35)
        const segmentAlpha = Math.min(1, alpha * shimmer * (.1 + strength * .87) * 1.1)
        const lineWidth = particle.width * 1.12 * scale * (.48 + strength * .56) * (1 - u * .26)
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.quadraticCurveTo(controlX, controlY, endX, endY)
        // A narrow translucent halo softens each warm ember without a blur pass.
        ctx.lineWidth = lineWidth * 3.6
        ctx.globalAlpha = segmentAlpha * .15
        ctx.stroke()
        ctx.lineWidth = lineWidth
        ctx.globalAlpha = segmentAlpha
        ctx.stroke()
        if (particle.specks && i % 2 === 0) {
          const drift = (1 - strength) * u * shortest * .009
          ctx.globalAlpha = segmentAlpha * .85
          ctx.beginPath()
          ctx.arc(endX + Math.sin(particle.shimmer + i) * drift * .3, endY + drift, (.48 + strength * .4) * scale, 0, TAU)
          ctx.fill()
        }
      }
      const headX = cx + trajectoryAt(particle, u, 0) * shortest
      const headY = cy + trajectoryAt(particle, u, 1) * shortest
      const headSize = particle.bead * scale * (1 - u * .24)
      ctx.globalAlpha = alpha * .19
      ctx.beginPath()
      ctx.arc(headX, headY, headSize * 2.4, 0, TAU)
      ctx.fill()
      ctx.globalAlpha = alpha * shimmer
      ctx.beginPath()
      ctx.arc(headX, headY, headSize, 0, TAU)
      ctx.fill()
      if (firework.kind === 'peony' || firework.kind === 'brocade') {
        ctx.fillStyle = particle.hot
        ctx.globalAlpha = alpha * .83
        ctx.beginPath()
        ctx.arc(headX, headY, headSize * .36, 0, TAU)
        ctx.fill()
      }
    }
  }

  function update(t, nextWidth, nextHeight) {
    if (disposed || !ctx || gain === 0) return
    t = finite(t, 0)
    if (t <= 0 || t >= END || t < FIREWORKS[0].start) {
      if (allocated) clear()
      return
    }
    resize(nextWidth, nextHeight)
    clear()
    const shortest = Math.min(width, height)
    const scale = clamp(shortest / 800, .72, 1.2)
    for (const firework of FIREWORKS) {
      const age = t - firework.start
      if (age < 0 || age >= firework.rise + firework.life) continue
      if (age < firework.rise) drawLaunch(firework, age, scale)
      else drawBurst(firework, age - firework.rise, shortest, scale)
    }
    ctx.globalAlpha = 1
  }

  function dispose() {
    if (disposed) return
    disposed = true
    canvas.remove()
    canvas.width = 1
    canvas.height = 1
  }

  return { update, dispose }
}
