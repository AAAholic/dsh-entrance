// Layered welcome portrait. The caller owns the timeline and reduced-motion policy.
const NS = 'http://www.w3.org/2000/svg'
const WIDTH = 1122, HEIGHT = 1402
const WRIST = { x: 292, y: 626 }
const ELBOW = { x: 221, y: 899 }
let sequence = 0
const moduleID = Math.random().toString(36).slice(2)
const clamp = value => Math.max(0, Math.min(1, value))
const smooth = value => { const u = clamp(value); return u * u * (3 - 2 * u) }

// The cut follows the visible palm/forearm and excludes the shoulder and face.
// Wrist and elbow overlaps keep the small joint rotations connected.
const palmTop = 'M 126 392 L 394 392 L 394 543 L 358 564 L 347 597'
const movingPalm = `${palmTop} L 335 637 L 250 644 L 244 614 L 223 584 L 191 560 L 130 548 Z`
const removedPalm = `${palmTop} L 339 620 L 252 626 L 244 614 L 223 584 L 191 560 L 130 548 Z`
const movingArm = `${palmTop} L 336 638 C 329 672 318 713 311 753 C 303 798 284 851 263 885 C 244 916 222 927 206 913 C 188 900 185 877 187 850 C 191 804 213 747 232 702 L 246 667 L 252 636 L 244 614 L 223 584 L 191 560 L 130 548 Z`
const removedArm = `${palmTop} L 335 638 C 326 674 315 714 308 753 C 300 799 282 850 260 885 L 245 900 L 199 900 C 189 884 189 866 190 851 C 194 805 216 748 235 703 L 249 667 L 254 636 L 244 614 L 223 584 L 191 560 L 130 548 Z`

export function mountWelcomeCharacter(container, { imageURL, expressionURL, blink = true } = {}) {
  if (!container?.ownerDocument) throw new TypeError('A character container is required')
  if (typeof imageURL !== 'string' || !imageURL) throw new TypeError('A character image URL is required')
  const document = container.ownerDocument
  const id = `welcome-character-${moduleID}-${++sequence}`
  const node = (name, attrs = {}) => {
    const element = document.createElementNS(NS, name)
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value)
    return element
  }
  const portrait = document.createElement('div')
  portrait.setAttribute('role', 'img')
  portrait.setAttribute('aria-label', '宵宫微笑并轻轻挥手欢迎你回来')
  portrait.dataset.welcomeCharacter = ''
  portrait.style.cssText = `position:relative;display:block;width:100%;aspect-ratio:${WIDTH}/${HEIGHT};pointer-events:none;`
  // Static SVG islands preserve the original cuts. Only their HTML wrappers
  // move, allowing the compositor to reuse the small rasterized joint patches.
  const full = { x: 0, y: 0, width: WIDTH, height: HEIGHT }
  const armBounds = { x: 120, y: 386, width: 280, height: 550 }
  const palmBounds = { x: 120, y: 386, width: 280, height: 264 }
  const island = (bounds, preserveAspectRatio = 'none') => {
    const svg = node('svg', {
      viewBox: `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`,
      width: bounds.width, height: bounds.height, preserveAspectRatio, 'aria-hidden': 'true',
    })
    svg.style.cssText = 'display:block;width:100%;height:100%;overflow:hidden;'
    return svg
  }
  const layer = (bounds, parentBounds = full, pivot = null) => {
    const element = document.createElement('div')
    element.style.cssText = `position:absolute;left:${(bounds.x-parentBounds.x)/parentBounds.width*100}%;top:${(bounds.y-parentBounds.y)/parentBounds.height*100}%;width:${bounds.width/parentBounds.width*100}%;height:${bounds.height/parentBounds.height*100}%;`
    if (pivot) {
      element.style.transformOrigin = `${(pivot.x-bounds.x)/bounds.width*100}% ${(pivot.y-bounds.y)/bounds.height*100}%`
      element.style.willChange = 'transform'
    }
    return element
  }
  const svg = island(full, 'xMidYMid meet')
  const defs = node('defs')
  const bodyMask = node('mask', {
    id: `${id}-body`, maskUnits: 'userSpaceOnUse',
    x: 0, y: 0, width: WIDTH, height: HEIGHT, style: 'mask-type:luminance',
  })
  bodyMask.append(node('rect', { width: WIDTH, height: HEIGHT, fill: '#fff' }))
  bodyMask.append(node('path', { d: removedArm, fill: '#000' }))
  defs.append(bodyMask)
  const image = { href: imageURL, width: WIDTH, height: HEIGHT, preserveAspectRatio: 'none' }
  svg.append(defs, node('image', { ...image, mask: `url(#${id}-body)` }))
  const body = layer(full)
  body.append(svg)
  const forearm = layer(armBounds, full, ELBOW)
  forearm.dataset.greetingForearm = ''
  const armSVG = island(armBounds)
  const armDefs = node('defs')
  const armClip = node('clipPath', { id: `${id}-arm`, clipPathUnits: 'userSpaceOnUse' })
  armClip.append(node('path', { d: movingArm }))
  const forearmMask = node('mask', {
    id: `${id}-forearm`, maskUnits: 'userSpaceOnUse',
    ...armBounds, style: 'mask-type:luminance',
  })
  forearmMask.append(node('rect', { ...armBounds, fill: '#fff' }))
  forearmMask.append(node('path', { d: removedPalm, fill: '#000' }))
  armDefs.append(armClip, forearmMask)
  armSVG.append(armDefs, node('image', { ...image, 'clip-path': `url(#${id}-arm)`, mask: `url(#${id}-forearm)` }))
  forearm.append(armSVG)
  const hand = layer(palmBounds, armBounds, WRIST)
  hand.dataset.greetingPalm = ''
  const handSVG = island(palmBounds)
  const handDefs = node('defs')
  const handClip = node('clipPath', { id: `${id}-palm`, clipPathUnits: 'userSpaceOnUse' })
  handClip.append(node('path', { d: movingPalm }))
  handDefs.append(handClip)
  handSVG.append(handDefs, node('image', { ...image, 'clip-path': `url(#${id}-palm)` }))
  hand.append(handSVG)
  forearm.append(hand)
  portrait.append(body, forearm)

  // Disabling blink omits all expression imagery, including the mouth patch.
  // This preserves the original portrait's face for the no-blink rollback.
  let eyes = null, mouth = null
  if (blink && typeof expressionURL === 'string' && expressionURL) {
    const patch = (part, regions, bounds, pivot = null) => {
      const patchSVG = island(bounds)
      const patchDefs = node('defs')
      const gradientID = `${id}-${part}-feather`
      const gradient = node('radialGradient', { id: gradientID })
      gradient.append(node('stop', { offset: '.68', 'stop-color': '#fff' }), node('stop', { offset: '1', 'stop-color': '#000' }))
      const maskID = `${id}-${part}`
      const mask = node('mask', {
        id: maskID, maskUnits: 'userSpaceOnUse',
        ...bounds, style: 'mask-type:luminance',
      })
      for (const [cx, cy, rx, ry] of regions) mask.append(node('ellipse', { cx, cy, rx, ry, fill: `url(#${gradientID})` }))
      patchDefs.append(gradient, mask)
      patchSVG.append(patchDefs, node('image', { href: expressionURL, width: WIDTH, height: HEIGHT, mask: `url(#${maskID})` }))
      const group = layer(bounds, full, pivot)
      group.dataset.expressionPart = part
      if (!pivot) group.style.willChange = 'opacity'
      group.append(patchSVG)
      portrait.append(group)
      return group
    }
    eyes = patch('blink-keyframe', [[514, 394, 77, 49], [650, 429, 80, 49]], { x: 435, y: 343, width: 297, height: 137 })
    mouth = patch('smile-keyframe', [[568, 491, 84, 61]], { x: 482, y: 428, width: 172, height: 126 }, { x: 568, y: 491 })
  }

  let disposed = false
  const previousChildren = [...container.childNodes]
  container.replaceChildren(portrait)
  function update(t) {
    if (disposed) return
    const elapsed = Number.isFinite(t) ? t : 0
    const u = clamp((elapsed - 1) / 1.35)
    const envelope = Math.sin(Math.PI * u)
    const wristAngle = 3.3 * Math.sin(4 * Math.PI * u) * envelope
    const armAngle = 1.23 * Math.sin(4 * Math.PI * u - .45) * envelope * envelope
    hand.style.transform = `rotate(${wristAngle.toFixed(4)}deg)`
    forearm.style.transform = `rotate(${armAngle.toFixed(4)}deg)`
    const blinkAmount = eyes ? smooth((elapsed - 1.36) / .13) * (1 - smooth((elapsed - 1.55) / .27)) : 0
    if (eyes) eyes.style.opacity = blinkAmount.toFixed(4)
    const lift = envelope * envelope
    if (mouth) mouth.style.transform = `translateY(${Number((-1.8 * lift).toFixed(3))/126*100}%) scale(${(1 + .018 * lift).toFixed(4)},${(1 + .035 * lift).toFixed(4)})`
    portrait.dataset.greetingAngle = wristAngle.toFixed(3)
    portrait.dataset.greetingForearmAngle = armAngle.toFixed(3)
    portrait.dataset.greetingTotalAngle = (wristAngle + armAngle).toFixed(3)
    portrait.dataset.blink = blinkAmount.toFixed(3)
    return { wristAngle, armAngle, blink: blinkAmount, lift }
  }
  function dispose() {
    if (disposed) return
    disposed = true
    if (portrait.parentNode === container) portrait.replaceWith(...previousChildren)
  }
  update(0)
  return { update, dispose }
}
