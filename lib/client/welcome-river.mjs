let nextRiverId = 0

// The caller owns the bottom river's placement and entrance/exit transform.
// Fish cross the surface in overlapping arcs, then disappear below it.
// 50 preserves the original single-leap height and 2.5–2.8-second duration;
// the 3.3-second repeat keeps two or three fish visible with the default count.
export function mountWelcomeRiver(container, { motion = true, amplitude = 50, speed = 50, fishCount = 3 } = {}) {
  if (!container?.ownerDocument || typeof container.appendChild !== 'function') {
    throw new TypeError('A positioned river container is required')
  }
  const document = container.ownerDocument
  const view = document.defaultView
  const namespace = 'http://www.w3.org/2000/svg'
  const id = `welcome-river-${++nextRiverId}`
  const strength = value => (Number.isFinite(Number(value)) ? Math.max(0, Math.min(100, Number(value))) : 50) / 50
  const amplitudeScale = strength(amplitude), speedScale = strength(speed)
  const layer = document.createElement('div')
  layer.dataset.welcomeRiver = ''
  layer.setAttribute('aria-hidden', 'true')
  layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;contain:layout paint;'
  const specs = [
    { x: .205, y: .64, compactX: .28, compactY: .86, direction: 1, size: 1, start: 0, duration: 2.7, leap: .22, travel: .051, pigment: '#ba4035', light: '#f9dda0', dark: '#c9964e', line: '#a95e35' },
    { x: .795, y: .62, compactX: .8, compactY: .42, direction: -1, size: .82, start: 1.1, duration: 2.5, leap: .18, travel: .046, pigment: '#efd08a', light: '#d78058', dark: '#a84436', line: '#8a4434' },
    { x: .475, y: .83, compactX: .52, compactY: .64, direction: 1, size: .71, start: 2.2, duration: 2.8, leap: .16, travel: .045, pigment: '#d8b76e', light: '#a8c9b6', dark: '#487d78', line: '#346663' },
  ].slice(0, Number(fishCount) === 2 ? 2 : 3)
  const fish = specs.map((spec, index) => {
    const node = document.createElement('div')
    node.dataset.riverFish = ['gold-koi', 'vermilion-fantail', 'jade-minnow'][index]
    node.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;transform-origin:center;'
    const svg = document.createElementNS(namespace, 'svg')
    svg.setAttribute('viewBox', '0 0 124 70')
    svg.style.cssText = `display:block;width:100%;height:100%;overflow:visible;transform:scaleX(${spec.direction});`
    const body = [
      'M31 36C44 20 65 13 86 17C101 19 113 28 116 34C110 44 97 50 81 52C61 54 43 46 31 36Z',
      'M34 36C40 17 59 8 81 12C101 15 113 26 116 34C114 47 100 58 80 59C59 60 41 50 34 36Z',
      'M29 36C47 25 68 21 88 25C103 27 113 31 119 35C108 42 91 45 77 45C57 45 41 41 29 36Z',
    ][index]
    const tail = [
      'M37 33C26 30 17 20 6 16C7 27 11 33 20 36C12 40 8 47 6 58C20 51 29 43 38 42Z',
      'M39 31C29 23 22 9 7 6C10 23 13 29 22 35C10 40 5 51 4 65C23 58 29 48 40 42Z',
      'M35 33L7 22L16 36L7 51L36 40Z',
    ][index]
    const fins = [
      'M49 21Q52 8 67 8L73 22M50 46Q45 59 60 60L69 47',
      'M50 19Q53 2 69 4L82 16M53 51Q49 68 70 65L83 54',
      'M55 27L66 14L77 24M56 43L70 55L80 44',
    ][index]
    svg.innerHTML = `<defs><linearGradient id="${id}-${index}" x1="0" y1="0" x2=".35" y2="1"><stop stop-color="${spec.light}"/><stop offset="1" stop-color="${spec.dark}"/></linearGradient></defs>
      <g fill="${spec.pigment}" stroke="#e9bc70" stroke-width="1.4" stroke-linejoin="round">
        <g data-tail><path d="${tail}"/><path d="M9 21Q22 32 33 36M10 53Q23 40 33 37" fill="none" stroke-width=".9"/></g>
        <path d="${fins}"/>
        <path d="${body}" fill="url(#${id}-${index})"/>
        <g ${index === 2 ? 'transform="translate(0 12) scale(1 .66)"' : ''}>
        <path d="M45 27Q57 20 70 21Q72 31 66 36Q55 42 42 38Q46 34 45 27Z" stroke="none"/>
        <path d="M80 18Q95 18 106 27Q97 24 93 32Q82 36 76 27Z" stroke="none"/>
        <path d="M75 41Q88 37 98 43Q86 52 74 50Z" stroke="none" opacity=".85"/>
        <path d="M75 33Q65 34 58 46Q70 45 81 37Z" fill="#edc780"/>
        <path d="M43 34Q48 39 53 33M54 28Q59 33 64 27M53 40Q58 45 63 39M67 25Q72 30 77 24M66 44Q71 49 76 43M79 37Q84 42 89 36" fill="none" stroke="${spec.line}" stroke-width=".75" opacity=".56"/>
        <path d="M98 27Q93 34 97 41" fill="none" stroke="${spec.line}" stroke-width="1"/>
        <circle cx="105" cy="30" r="2.5" fill="#222c2a" stroke="#fbe4ad" stroke-width="1"/>
        <path d="M112 35Q119 33 120 29" fill="none" stroke-width=".9"/>
        </g>
      </g>`
    node.appendChild(svg)
    const ripple = document.createElementNS(namespace, 'svg')
    ripple.setAttribute('viewBox', '0 0 100 24')
    ripple.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none;opacity:0;'
    ripple.innerHTML = '<g fill="none" stroke="#dfb775" stroke-width="1" stroke-linecap="round"><path d="M12 12Q32 3 50 6M61 6Q79 7 88 12M22 16Q51 22 77 15" opacity=".65"/><path d="M35 10Q48 6 63 10" opacity=".9"/></g>'
    layer.append(ripple, node)
    return { ...spec, wideX: spec.x, wideY: spec.y, node, svg, tail: svg.querySelector('[data-tail]'), ripple, width: 0, height: 0 }
  })
  container.appendChild(layer)
  const reducedMotion = view?.matchMedia?.('(prefers-reduced-motion: reduce)')
  let disposed = false, frozen = false, paused = false, motionEnabled = Boolean(motion)
  let width = 0, height = 0, elapsed = 0, previousTime = null, lastPaint = null, frame = null
  const animated = () => motionEnabled && amplitudeScale > 0 && speedScale > 0 && !reducedMotion?.matches
  const canRun = () => !disposed && !frozen && !paused && animated() && !document.hidden &&
    width > 0 && height > 0 && typeof view?.requestAnimationFrame === 'function'

  function stop() {
    if (frame !== null) view?.cancelAnimationFrame?.(frame)
    frame = previousTime = lastPaint = null
  }
  function pose(item, x, y, angle, opacity, tailAngle = 0) {
    item.node.style.transform = `translate3d(${x - item.width / 2}px,${y - item.height / 2}px,0) rotate(${angle}deg)`
    item.node.style.opacity = String(opacity)
    item.tail.setAttribute('transform', `rotate(${tailAngle} 34 36)`)
  }
  function drawStatic() {
    for (const item of fish) {
      item.svg.style.transform = `scaleX(${item.direction})`
      pose(item, item.x * width, item.y * height, -13 * item.direction, .78)
      item.ripple.style.opacity = '.23'
      item.ripple.style.transform = `translate3d(${item.x * width - item.width * .55}px,${item.y * height + item.height * .26}px,0)`
    }
  }
  function draw() {
    const time = elapsed / 1000 * speedScale
    const cycle = 3.3
    const seconds = time % cycle
    for (const item of fish) {
      const local = (seconds - item.start + cycle) % cycle
      const progress = local / item.duration
      const leaping = progress >= 0 && progress <= 1
      const distance = width * item.travel * amplitudeScale
      const rise = Math.min(height * item.leap, item.width * .85) * amplitudeScale
      if (leaping) {
        const x = item.x * width + item.direction * distance * (progress - .5)
        const y = item.y * height - 4 * rise * progress * (1 - progress)
        const angle = Math.atan2(-4 * rise * (1 - 2 * progress), distance) * 180 / Math.PI * item.direction
        const fade = Math.max(0, Math.min(1, progress / .06, (1 - progress) / .1))
        item.svg.style.transform = `scaleX(${item.direction})`
        pose(item, x, y, angle, fade * .9, Math.sin(progress * Math.PI * 7) * 5 * amplitudeScale)
      } else item.node.style.opacity = '0'
      // Only the departure and landing leave a short, thin surface ring.
      const landing = local - item.duration
      const rippleAge = local >= 0 && local < .75 ? local : landing >= 0 && landing < 1.15 ? landing : -1
      if (rippleAge >= 0) {
        const atLanding = local >= item.duration
        const edgeX = item.x * width + item.direction * distance * (atLanding ? .5 : -.5)
        item.ripple.style.transform = `translate3d(${edgeX - item.width * .55}px,${item.y * height + item.height * .12}px,0) scale(${.72 + rippleAge * .44})`
        item.ripple.style.opacity = String(Math.max(0, Math.min(.65, .46 * amplitudeScale) * (1 - rippleAge / (atLanding ? 1.15 : .75))))
      } else item.ripple.style.opacity = '0'
    }
  }
  function tick(timestamp) {
    frame = null
    if (!canRun()) return
    if (previousTime !== null) elapsed += Math.max(0, Math.min(100, timestamp - previousTime))
    previousTime = timestamp
    if (lastPaint === null || timestamp - lastPaint >= 1000 / 24) {
      draw()
      lastPaint = lastPaint === null ? timestamp : timestamp - (timestamp - lastPaint) % (1000 / 24)
    }
    if (canRun()) frame = view.requestAnimationFrame(tick)
  }
  function reconcile() {
    if (disposed || frozen) return
    if (animated()) draw()
    else drawStatic()
    if (!canRun()) stop()
    else if (frame === null) frame = view.requestAnimationFrame(tick)
  }
  function resize() {
    if (disposed || frozen) return
    width = Math.max(0, container.clientWidth || 0)
    height = Math.max(0, container.clientHeight || 0)
    const compact = width < 600
    for (const item of fish) {
      item.x = compact ? item.compactX : item.wideX
      item.y = compact ? item.compactY : item.wideY
      item.width = Math.min(62 * item.size, Math.max(compact ? 22 : 0, width * .034 * item.size), height * .36)
      item.height = item.width * 70 / 124
      item.node.style.width = `${item.width}px`
      item.node.style.height = `${item.height}px`
      item.ripple.style.width = `${item.width * 1.1}px`
      item.ripple.style.height = `${item.width * .264}px`
      item.ripple.style.transformOrigin = 'center'
    }
    reconcile()
  }
  const observer = typeof view?.ResizeObserver === 'function' ? new view.ResizeObserver(resize) : null
  observer?.observe(container)
  if (!observer) view?.addEventListener?.('resize', resize)
  const onVisibility = () => { if (document.hidden) stop(); else reconcile() }
  document.addEventListener('visibilitychange', onVisibility)
  reducedMotion?.addEventListener?.('change', reconcile)
  resize()

  function setPaused(value) {
    if (disposed || frozen) return
    paused = Boolean(value)
    if (paused) stop()
    else reconcile()
  }
  function setMotion(value) {
    if (disposed || frozen) return
    motionEnabled = Boolean(value)
    reconcile()
  }
  function freeze() {
    if (disposed || frozen) return
    frozen = true
    stop()
  }
  function dispose() {
    if (disposed) return
    disposed = true
    stop()
    observer?.disconnect()
    if (!observer) view?.removeEventListener?.('resize', resize)
    document.removeEventListener('visibilitychange', onVisibility)
    reducedMotion?.removeEventListener?.('change', reconcile)
    layer.remove()
  }
  return { setPaused, setMotion, freeze, dispose }
}
