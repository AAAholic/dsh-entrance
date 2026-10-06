// An isolated transparent decoration. The caller owns its layout and entrance
// transform; only the image's interior bends, with a stationary top anchor.
export function mountWelcomeRibbon(container, { imageURL, motion = true } = {}) {
  if (!container?.ownerDocument || typeof container.appendChild !== 'function') {
    throw new TypeError('A positioned ribbon container is required')
  }
  if (typeof imageURL !== 'string' || !imageURL) throw new TypeError('A ribbon image URL is required')

  const document = container.ownerDocument
  const view = document.defaultView
  const layer = document.createElement('div')
  layer.dataset.welcomeRibbon = ''
  layer.setAttribute('aria-hidden', 'true')
  layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;contain:layout paint;'
  const image = document.createElement('img')
  image.alt = ''
  image.decoding = 'async'
  image.draggable = false
  image.style.cssText = 'display:block;position:absolute;inset:0;width:100%;height:100%;box-sizing:border-box;padding:0 8px;object-fit:contain;object-position:center top;pointer-events:none;'
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  canvas.style.cssText = 'display:none;position:absolute;inset:0;width:100%;height:100%;pointer-events:none;'
  layer.append(image, canvas)
  container.appendChild(layer)
  let context = null
  try { context = canvas.getContext('2d', { alpha: true }) } catch { /* Keep the static image. */ }

  const reducedMotion = view?.matchMedia?.('(prefers-reduced-motion: reduce)')
  const frameInterval = 1000 / 24
  const tau = Math.PI * 2
  let disposed = false, loaded = false, paused = false, frozen = false
  let motionEnabled = Boolean(motion)
  let frame = null, previousTime = null, lastPaint = null
  let elapsed = 0, width = 0, height = 0, pixelRatio = 1, padding = 8
  let settleReady
  const ready = new Promise(resolve => { settleReady = resolve })
  const settle = value => { settleReady?.(value); settleReady = null }
  const useCanvas = () => loaded && context && motionEnabled && !reducedMotion?.matches
  const canRun = () => !disposed && useCanvas() && width > 0 && height > 0 &&
    !paused && !frozen && !document.hidden && typeof view?.requestAnimationFrame === 'function'

  function stop() {
    if (frame !== null) view?.cancelAnimationFrame?.(frame)
    frame = null
    previousTime = lastPaint = null
  }

  function displacement(position, seconds) {
    const anchor = Math.pow(Math.max(0, Math.min(1, position)), 1.45)
    const amplitude = Math.min(6.5, width * .035)
    return amplitude * anchor * (
      .72 * Math.sin(tau * seconds / 5.8 - position * 2.3) +
      .28 * Math.sin(tau * seconds / 9.4 - position * 3.9 + 1.1)
    )
  }

  function drawFrame() {
    if (disposed || !loaded || !context || width <= 0 || height <= 0) return
    const scale = Math.min(Math.max(1, width - padding * 2) / image.naturalWidth, height / image.naturalHeight)
    const drawWidth = image.naturalWidth * scale
    const drawHeight = image.naturalHeight * scale
    const left = (width - drawWidth) / 2
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.imageSmoothingEnabled = true
    const seconds = elapsed / 1000
    // Each strip is sheared into its neighbour. The source extends by 1 CSS px
    // to seal seams, but a disjoint, pixel-aligned clip paints translucent pixels
    // exactly once instead of darkening them through source-over accumulation.
    const stripPixels = Math.max(1, Math.round(4 * pixelRatio))
    const imagePixels = Math.ceil(drawHeight * pixelRatio)
    for (let pixelY = 0; pixelY < imagePixels; pixelY += stripPixels) {
      const y = pixelY / pixelRatio
      const nextY = Math.min(drawHeight, (pixelY + stripPixels) / pixelRatio)
      const offset = displacement(y / drawHeight, seconds)
      const slope = (displacement(nextY / drawHeight, seconds) - offset) / (nextY - y)
      const sliceHeight = Math.min(drawHeight - y, nextY - y + 1)
      context.save()
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.beginPath()
      context.rect(0, pixelY, canvas.width, Math.min(stripPixels, imagePixels - pixelY))
      context.clip()
      context.setTransform(pixelRatio, 0, slope * pixelRatio, pixelRatio,
        (left + offset - slope * y) * pixelRatio, 0)
      context.drawImage(image, 0, y / scale, image.naturalWidth, sliceHeight / scale,
        0, y, drawWidth, sliceHeight)
      context.restore()
    }
  }

  function draw() {
    try { drawFrame() } catch {
      // Decoration rendering must never prevent entering the application.
      context = null
      canvas.style.display = 'none'
      image.style.visibility = 'visible'
      stop()
    }
  }

  function tick(timestamp) {
    frame = null
    if (!canRun()) return
    if (previousTime !== null) elapsed += Math.max(0, Math.min(100, timestamp - previousTime))
    previousTime = timestamp
    if (lastPaint === null || timestamp - lastPaint >= frameInterval) {
      draw()
      // Keep the average painting rate at 24 fps on 60/120 Hz displays.
      lastPaint = lastPaint === null ? timestamp : timestamp - (timestamp - lastPaint) % frameInterval
    }
    if (canRun()) frame = view.requestAnimationFrame(tick)
  }

  function reconcile() {
    if (disposed) return
    const animated = Boolean(useCanvas())
    canvas.style.display = animated ? 'block' : 'none'
    image.style.visibility = animated ? 'hidden' : 'visible'
    if (animated) draw()
    if (!canRun()) stop()
    else if (frame === null) frame = view.requestAnimationFrame(tick)
  }

  function resize(nextWidth, nextHeight) {
    if (disposed) return
    nextWidth = Number.isFinite(nextWidth) ? Math.max(0, nextWidth) : 0
    nextHeight = Number.isFinite(nextHeight) ? Math.max(0, nextHeight) : 0
    const ratio = Math.min(2, view?.devicePixelRatio || 1,
      Math.sqrt(300000 / Math.max(1, nextWidth * nextHeight)))
    if (nextWidth === width && nextHeight === height && ratio === pixelRatio) return
    width = nextWidth
    height = nextHeight
    pixelRatio = ratio
    padding = Math.min(8, width * .05)
    image.style.padding = `0 ${padding}px`
    // No scene-sized or auxiliary buffers: at most 300,000 backing pixels.
    canvas.width = Math.max(1, Math.min(300000, Math.floor(width * pixelRatio)))
    canvas.height = Math.max(1, Math.min(Math.floor(height * pixelRatio), Math.floor(300000 / canvas.width)))
    reconcile()
  }

  const onResize = () => resize(container.clientWidth, container.clientHeight)
  const observer = typeof view?.ResizeObserver === 'function'
    ? new view.ResizeObserver(entries => {
      const rect = entries.find(entry => entry.target === container)?.contentRect
      if (rect) resize(rect.width, rect.height)
    }) : null
  observer?.observe(container)
  if (!observer) view?.addEventListener?.('resize', onResize)
  const onVisibility = () => {
    if (document.hidden) stop()
    else reconcile()
  }
  document.addEventListener('visibilitychange', onVisibility)
  reducedMotion?.addEventListener?.('change', reconcile)

  image.onload = async () => {
    try { await image.decode?.() } catch { /* A completed image can still render. */ }
    if (disposed) return
    if (!image.naturalWidth || !image.naturalHeight) { image.onerror(); return }
    loaded = true
    onResize()
    reconcile()
    settle(true)
  }
  image.onerror = () => {
    if (disposed) return
    loaded = false
    stop()
    layer.style.display = 'none'
    settle(false)
  }
  onResize()
  image.src = imageURL

  function setPaused(value) {
    if (disposed) return
    paused = Boolean(value)
    // A paused frame remains visible, including during an exit transition.
    if (paused) stop()
    else reconcile()
  }
  function setMotion(value) {
    if (disposed) return
    motionEnabled = Boolean(value)
    reconcile()
  }
  function freeze() {
    if (disposed) return
    frozen = true
    stop()
  }
  function dispose() {
    if (disposed) return
    disposed = true
    stop()
    observer?.disconnect()
    if (!observer) view?.removeEventListener?.('resize', onResize)
    document.removeEventListener('visibilitychange', onVisibility)
    reducedMotion?.removeEventListener?.('change', reconcile)
    image.onload = image.onerror = null
    image.removeAttribute('src')
    layer.remove()
    canvas.width = canvas.height = 1
    settle(false)
    context = null
  }

  return { ready, setPaused, setMotion, freeze, dispose }
}
