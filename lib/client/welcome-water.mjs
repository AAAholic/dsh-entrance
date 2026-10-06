// Transparent water-light overlay. The caller owns the 2.2 s exit timeline and
// positions the container; this module never changes the underlying interface.
export function welcomeWaterWaves(progress, width, height, origin) {
  const clamp = n => Math.max(0, Math.min(1, n))
  const smooth = n => { n = clamp(n); return n * n * (3 - 2 * n) }
  const x = origin.x * width, y = origin.y * height
  const shortest = Math.min(width, height)
  const reach = Math.hypot(Math.max(x, width - x), Math.max(y, height - y))
  return [0, 1, 2].map(wave => {
    const start = .10 + wave * .13
    const amount = clamp((progress - start) / (1 - start))
    return {
      wave, amount,
      radius: (1 - Math.pow(1 - amount, 1.25)) * (reach + shortest * .075),
      thickness: (shortest * .027 + 7) * (1 - amount * .32),
      energy: smooth(amount / .09) * (1 - smooth((amount - .70) / .30)) * (1 - wave * .2),
    }
  })
}

export function createWelcomeWater(container) {
  if (!container?.ownerDocument || typeof container.appendChild !== 'function') {
    throw new TypeError('createWelcomeWater requires a positioned DOM container')
  }

  const document = container.ownerDocument
  const view = document.defaultView
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  canvas.setAttribute('aria-hidden', 'true')
  canvas.dataset.yoimiyaWelcomeWater = ''
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:40;'
  container.appendChild(canvas)
  const ctx = canvas.getContext('2d', { alpha: true })
  const reducedMotion = view?.matchMedia?.('(prefers-reduced-motion: reduce)')
  const clamp = (n, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n))
  const smooth = n => { n = clamp(n); return n * n * (3 - 2 * n) }
  const phase = (n, a, b) => clamp((n - a) / (b - a))
  const finite = (n, fallback) => typeof n === 'number' && Number.isFinite(n) ? n : fallback
  const tau = Math.PI * 2
  const samples = 96
  let width = 1
  let height = 1
  let pixelRatio = 1
  let measured = false
  let backingReady = false
  let backingDirty = true
  let prepared = false
  let disposed = false
  let lastProgress = 0
  let lastOrigin = { x: .5, y: .5 }

  function setSize(nextWidth, nextHeight) {
    if (disposed || !ctx) return
    nextWidth = Math.max(1, finite(nextWidth, 1))
    nextHeight = Math.max(1, finite(nextHeight, 1))
    measured = true
    // Bound backing memory and fill rate on Retina and large external displays.
    const nextRatio = Math.min(1, view?.devicePixelRatio || 1, Math.sqrt(1200000 / (nextWidth * nextHeight)))
    if (nextWidth === width && nextHeight === height && nextRatio === pixelRatio) return
    width = nextWidth
    height = nextHeight
    pixelRatio = nextRatio
    backingDirty = true
  }

  function measure() {
    setSize(container.clientWidth, container.clientHeight)
  }

  function ensureBacking() {
    if (!measured) measure()
    if (backingReady && !backingDirty) return
    canvas.width = Math.max(1, Math.floor(width * pixelRatio))
    canvas.height = Math.max(1, Math.floor(height * pixelRatio))
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    backingReady = true
    backingDirty = false
  }

  function rememberOrigin(origin) {
    if (!origin) return
    if (!origin.normalized && !measured) measure()
    lastOrigin = {
      x: clamp(finite(origin.x, origin.normalized ? .5 : width / 2) / (origin.normalized ? 1 : width)),
      y: clamp(finite(origin.y, origin.normalized ? .5 : height / 2) / (origin.normalized ? 1 : height)),
    }
  }

  function clear() {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }

  function radialShape(angle, radius, thickness, offset, wave, amount) {
    const variation = Math.sin(angle * 3 + wave * 1.31 + amount * .65) * .5 +
      Math.sin(angle * 5 - wave * .72 - amount * .4) * .3 +
      Math.cos(angle * 8 + wave * 1.2) * .2
    const swell = (3 + radius * .013) * variation
    const breadth = thickness * (1 + Math.sin(angle * 2 + wave) * .16 + Math.cos(angle * 5 - wave) * .08)
    return Math.max(0, radius + swell + offset * breadth)
  }

  // Filled curved ribbons, including the highlights, have a visible water body;
  // there are no stroked circular outlines or straight light streaks.
  function ribbon(x, y, radius, thickness, inner, outer, wave, amount, color, alpha, start = 0, end = tau) {
    if (alpha <= .001 || radius <= 0) return
    const count = Math.max(16, Math.ceil(samples * (end - start) / tau))
    ctx.beginPath()
    for (let i = 0; i <= count; i += 1) {
      const a = start + (end - start) * i / count
      const edge = start === 0 && end === tau ? 1 : Math.pow(Math.sin(Math.PI * i / count), .6)
      const r = radialShape(a, radius, thickness, outer * edge, wave, amount)
      const px = x + Math.cos(a) * r
      const py = y + Math.sin(a) * r
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    for (let i = count; i >= 0; i -= 1) {
      const a = start + (end - start) * i / count
      const edge = start === 0 && end === tau ? 1 : Math.pow(Math.sin(Math.PI * i / count), .6)
      const r = radialShape(a, radius, thickness, inner * edge, wave, amount)
      ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
    }
    ctx.closePath()
    ctx.fillStyle = color
    ctx.globalAlpha = alpha
    ctx.fill()
  }

  function drawDrop(progress, x, y, scale) {
    const fall = phase(progress, 0, .16)
    if (progress > 0 && progress < .16) {
      const fallY = y - (1 - fall * fall) * 34 * scale
      const opacity = Math.sin(Math.PI * fall) * .7
      const glow = ctx.createRadialGradient(x, fallY, 0, x, fallY, 10 * scale)
      glow.addColorStop(0, 'rgba(232,224,195,.42)')
      glow.addColorStop(.38, 'rgba(169,198,192,.18)')
      glow.addColorStop(1, 'rgba(156,187,190,0)')
      ctx.globalAlpha = opacity
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.ellipse(x, fallY, 8 * scale, 11 * scale, -.08, 0, tau)
      ctx.fill()
      ctx.fillStyle = 'rgba(226,229,207,.58)'
      ctx.beginPath()
      ctx.ellipse(x, fallY, 2 * scale, (4.4 - fall * 1.4) * scale, -.08, 0, tau)
      ctx.fill()
    }
    const hit = phase(progress, .13, .29)
    if (progress >= .13 && progress < .29) {
      const radius = (7 + hit * 18) * scale
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius)
      glow.addColorStop(0, 'rgba(204,215,195,.12)')
      glow.addColorStop(.42, 'rgba(216,205,174,.16)')
      glow.addColorStop(1, 'rgba(122,160,165,0)')
      ctx.globalAlpha = Math.sin(hit * Math.PI)
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, tau)
      ctx.fill()
    }
  }

  function draw(progress, origin) {
    clear()
    // At both endpoints the underlying application is completely unobscured.
    if (progress <= 0 || progress >= 1 || reducedMotion?.matches) return
    const x = origin.x * width
    const y = origin.y * height
    const shortest = Math.min(width, height)
    const scale = clamp(shortest / 720, .7, 1.5)
    drawDrop(progress, x, y, scale)

    for (const {wave, amount, radius, thickness, energy} of welcomeWaterWaves(progress, width, height, origin)) {
      if (energy < .001) continue

      const reflection = ctx.createLinearGradient(x - radius, y + radius * .4, x + radius, y - radius * .7)
      reflection.addColorStop(0, '#d3b58c')
      reflection.addColorStop(.29, '#a4b6a8')
      reflection.addColorStop(.57, '#87b5bd')
      reflection.addColorStop(.79, '#ded0b1')
      reflection.addColorStop(1, '#bea59c')

      ctx.globalCompositeOperation = 'source-over'
      ribbon(x, y, radius, thickness, -.4, 1.15, wave, amount, '#182d36', energy * .065)
      ribbon(x, y, radius, thickness, -.95, -.05, wave, amount, '#203b40', energy * .052)
      // Nested broad, low-alpha bodies give soft edges without a screen blur.
      ctx.globalCompositeOperation = 'screen'
      ribbon(x, y, radius, thickness, -1.8, 1.65, wave, amount, reflection, energy * .018)
      ribbon(x, y, radius, thickness, -1.3, 1.12, wave, amount, reflection, energy * .028)
      ribbon(x, y, radius, thickness, -.83, .7, wave, amount, reflection, energy * .043)
      ribbon(x, y, radius, thickness, -.4, .36, wave, amount, reflection, energy * .064)
      const turn = wave * .62 + amount * .1
      ribbon(x, y, radius, thickness, -.15, .3, wave, amount, '#e1c49b', energy * .16, .24 + turn, 1.75 + turn)
      ribbon(x, y, radius, thickness, -.22, .25, wave, amount, '#b6d0c8', energy * .12, 3.35 + turn, 4.92 + turn)
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }

  // Coordinates are CSS pixels by default; normalized origins stay anchored on resize.
  function update(progress, origin) {
    if (disposed || !ctx) return
    lastProgress = clamp(finite(progress, 0))
    rememberOrigin(origin)
    if (lastProgress <= 0 || lastProgress >= 1 || reducedMotion?.matches) {
      if (backingReady) clear()
      return
    }
    ensureBacking()
    draw(lastProgress, lastOrigin)
  }

  // Optional startup work: allocate and exercise the full drawing path before exit.
  function prepare(origin) {
    if (disposed || !ctx || reducedMotion?.matches) return false
    if (prepared) return true
    measure()
    rememberOrigin(origin)
    ensureBacking()
    draw(.48, lastOrigin)
    draw(lastProgress, lastOrigin)
    prepared = true
    return true
  }

  function redrawAfterResize(nextWidth, nextHeight) {
    setSize(nextWidth, nextHeight)
    if (disposed || !ctx || !backingReady || !backingDirty) return
    ensureBacking()
    draw(lastProgress, lastOrigin)
  }

  const onResize = () => redrawAfterResize(container.clientWidth, container.clientHeight)
  const observer = typeof view?.ResizeObserver === 'function'
    ? new view.ResizeObserver(entries => {
      const rect = entries.find(entry => entry.target === container)?.contentRect
      if (rect) redrawAfterResize(rect.width, rect.height)
    }) : null
  observer?.observe(container)
  if (!observer) view?.addEventListener?.('resize', onResize)

  function dispose() {
    if (disposed) return
    disposed = true
    observer?.disconnect()
    if (!observer) view?.removeEventListener?.('resize', onResize)
    canvas.remove()
    // Release the backing store even when the caller temporarily retains the API.
    canvas.width = 1
    canvas.height = 1
  }

  return { update, prepare, dispose }
}
