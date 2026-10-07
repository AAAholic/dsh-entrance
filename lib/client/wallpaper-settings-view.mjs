import { MOTION_DEFAULTS, normalizeMotion, WELCOME_PRESETS } from './wallpaper-preferences.mjs'

export const MOTION_SETTINGS_CSS = `
[data-motion-settings]{--yms-ink:#f4e7cf;--yms-muted:#b5bec0;--yms-gold:#edcc8e;--yms-line:#a78b5f40;--yms-bg:#142730;--yms-surface:#192e36;width:100%;max-width:760px;min-width:0;box-sizing:border-box;padding:24px;color:var(--yms-ink);background:var(--yms-bg);border:1px solid var(--yms-line);border-radius:18px;font:14px/1.5 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;color-scheme:dark}
[data-motion-settings] *,[data-motion-settings] *:before,[data-motion-settings] *:after{box-sizing:border-box}
[data-motion-settings] [hidden]{display:none!important}
[data-motion-settings] h2,[data-motion-settings] h3,[data-motion-settings] p{margin:0}
[data-motion-settings] button,[data-motion-settings] input{font:inherit;color:inherit;min-width:0}
[data-motion-settings] button{appearance:none;min-height:44px;border:1px solid var(--yms-line);border-radius:10px;padding:10px 14px;background:var(--yms-surface);cursor:pointer;line-height:1.4}
[data-motion-settings] button:hover:not(:disabled){background:#243b42;border-color:#edcc8e85}
[data-motion-settings] button:focus-visible,[data-motion-settings] input:focus-visible,[data-motion-settings] [role=tabpanel]:focus-visible{outline:2px solid var(--yms-gold);outline-offset:3px}
[data-motion-settings] button:disabled,[data-motion-settings] input:disabled{cursor:not-allowed;opacity:.48}
[data-motion-settings] .yms-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:20px}
[data-motion-settings] h2{font:600 24px/1.3 "Songti SC","STSong",serif;letter-spacing:.6px;color:var(--yms-gold)}
[data-motion-settings] .yms-description{color:var(--yms-muted);font-size:12px;margin-top:7px;max-width:42em}
[data-motion-settings] .yms-close{display:grid;place-items:center;flex:none;width:44px;height:44px;min-height:44px;font-size:25px;line-height:1;padding:0;border-color:transparent;background:transparent;margin:-8px -8px 0 0;color:var(--yms-muted)}
[data-motion-settings] .yms-tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px;background:#0e1f28;border-radius:12px;margin-bottom:20px}
[data-motion-settings] .yms-tab{border-color:transparent;background:transparent;color:var(--yms-muted);font-weight:550}
[data-motion-settings] .yms-tab[aria-selected=true]{background:#2a3b3c;border-color:#dfbc7855;color:var(--yms-gold);box-shadow:inset 0 -2px #d8b776}
[data-motion-settings] .yms-panel{min-width:0}
[data-motion-settings] .yms-heading{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:10px}
[data-motion-settings] h3{font-size:13px;font-weight:600}
[data-motion-settings] .yms-preset-state{color:var(--yms-muted);font-size:11px}
[data-motion-settings] .yms-presets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:18px}
[data-motion-settings] .yms-preset{position:relative;text-align:left;min-height:72px;padding:10px 12px;background:transparent;display:flex;flex-direction:column;justify-content:center;gap:3px}
[data-motion-settings] .yms-preset strong{font-size:14px;font-weight:550}
[data-motion-settings] .yms-preset span{font-size:11px;color:var(--yms-muted);white-space:nowrap}
[data-motion-settings] .yms-preset[aria-pressed=true]{background:#3b3d315c;border-color:#dfbc7899;box-shadow:inset 0 0 0 1px #dfbc7838}
[data-motion-settings] .yms-preset[aria-pressed=true] strong{color:var(--yms-gold)}
[data-motion-settings] .yms-fields{border-top:1px solid var(--yms-line)}
[data-motion-settings] .yms-toggle{display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:60px;margin:0;padding:9px 0;cursor:pointer}
[data-motion-settings] .yms-toggle+.yms-toggle{border-top:1px solid #ffffff09}
[data-motion-settings] .yms-label{display:block;font-size:13px;font-weight:500}
[data-motion-settings] .yms-hint{display:block;font-size:11px;font-weight:400;color:var(--yms-muted);margin-top:3px;line-height:1.6}
[data-motion-settings] .yms-toggle[data-disabled=true],[data-motion-settings] .yms-range[data-disabled=true]{color:#8b9599}
[data-motion-settings] .yms-toggle[data-disabled=true]{cursor:default}
[data-motion-settings] .yms-toggle[data-disabled=true] .yms-hint,[data-motion-settings] .yms-range[data-disabled=true] .yms-scale{color:#8b9599}
[data-motion-settings] .yms-switch{appearance:none;display:block;position:relative;width:44px;height:44px;min-width:44px;min-height:44px;flex:none;padding:0;margin:0;background:transparent;border:0;border-radius:7px;cursor:pointer}
[data-motion-settings] .yms-switch:before{content:"";position:absolute;left:2px;top:10px;width:40px;height:24px;border-radius:14px;background:#45555a;border:1px solid #89999e7a}
[data-motion-settings] .yms-switch:after{content:"";position:absolute;left:6px;top:14px;width:16px;height:16px;border-radius:50%;background:#d9dfdb;transition:transform .15s ease}
[data-motion-settings] .yms-switch:checked:before{background:var(--yms-gold);border-color:var(--yms-gold)}
[data-motion-settings] .yms-switch:checked:after{background:#243337;transform:translateX(16px)}
[data-motion-settings] .yms-subfields{margin-top:4px;padding:0 14px;background:#0e202852;border:1px solid #ffffff0b;border-radius:12px}
[data-motion-settings] .yms-range{padding:15px 0 4px}
[data-motion-settings] .yms-range+.yms-range{margin-top:6px}
[data-motion-settings] .yms-range-heading{display:flex;justify-content:space-between;align-items:center;gap:12px}
[data-motion-settings] .yms-range-heading label{display:block;margin:0;font-size:13px;font-weight:500;color:inherit}
[data-motion-settings] output{font-size:12px;font-variant-numeric:tabular-nums;color:var(--yms-gold);white-space:nowrap}
[data-motion-settings] input[type=range]{display:block;width:100%;height:44px;min-height:44px;margin:0;padding:0;accent-color:var(--yms-gold);cursor:pointer;background:transparent}
[data-motion-settings] input[type=range]:disabled{cursor:not-allowed}
[data-motion-settings] .yms-scale{display:flex;justify-content:space-between;gap:10px;color:var(--yms-muted);font-size:11px;margin-top:-7px}
[data-motion-settings] .yms-duration-note{margin:11px 0 2px;font-size:11px;line-height:1.6;color:var(--yms-muted)}
[data-motion-settings] .yms-work-note{color:var(--yms-muted);font-size:12px;margin-bottom:15px}
[data-motion-settings] .yms-actions{display:flex;gap:9px;flex-wrap:wrap;padding-top:20px;margin-top:18px;border-top:1px solid var(--yms-line)}
[data-motion-settings] .yms-primary{background:var(--yms-gold);color:#1d3036;border-color:var(--yms-gold);font-weight:600}
[data-motion-settings] .yms-primary:hover:not(:disabled){background:#f7ddb0;border-color:#f7ddb0}
[data-motion-settings] .yms-reset{background:transparent;color:var(--yms-muted)}
[data-motion-settings] .yms-status{margin-top:12px;min-height:18px;color:var(--yms-muted);font-size:11px;line-height:1.6;overflow-wrap:anywhere}
[data-motion-settings] .yms-error{margin-top:8px;color:#ffd4bb;font-size:12px;border-left:2px solid #da9b74;padding-left:9px}
[data-motion-settings] .yms-note{margin-top:8px;color:var(--yms-muted);font-size:11px;line-height:1.7}
[data-motion-settings] .yms-reduced{margin-top:10px;padding:8px 10px;border-radius:8px;background:#d6b57512;color:#deca9f;font-size:11px}
[data-motion-settings] .yms-sr{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
[data-motion-settings].yms-compact{max-width:none;height:100%;display:flex;flex-direction:column;overflow:hidden;padding:20px;border:0;border-radius:0;background:transparent}
[data-motion-settings].yms-compact>*{flex-shrink:0}
[data-motion-settings].yms-compact .yms-panel{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;padding-right:6px}
[data-motion-settings].yms-compact .yms-actions{padding-top:12px;margin-top:12px}
[data-motion-settings].yms-compact .yms-tabs{margin-bottom:14px}
[data-motion-settings].yms-compact .yms-head{margin-bottom:16px}
[data-motion-settings].yms-compact h2{font-size:23px}
@media(max-width:480px){[data-motion-settings]{padding:18px 16px}[data-motion-settings].yms-compact{padding:18px 16px}[data-motion-settings] .yms-presets{gap:6px}[data-motion-settings] .yms-preset{padding:9px 8px}[data-motion-settings] .yms-subfields{padding:0 11px}[data-motion-settings] .yms-actions{gap:8px}[data-motion-settings] .yms-actions button{flex:1}}
@media(prefers-reduced-motion:reduce){[data-motion-settings] *:before,[data-motion-settings] *:after{transition:none!important}}
`

let sequence = 0

/** The controller owns persistence, subscriptions, scene activity and replay. */
export function mountMotionSettings(container, controller, { compact = false, welcomeOnly = false, onClose } = {}) {
  if (!container?.ownerDocument) throw new TypeError('A motion settings container is required')
  const document = container.ownerDocument
  const id = `yoimiya-motion-${++sequence}`
  const element = (tag, className, text) => {
    const node = document.createElement(tag)
    if (className) node.className = className
    if (text !== undefined) node.textContent = text
    return node
  }
  const section = element('section', compact ? 'yms-compact' : '')
  section.dataset.motionSettings = ''
  section.setAttribute('aria-label', welcomeOnly ? '动画设置' : '场景动效设置')
  const style = element('style', '', MOTION_SETTINGS_CSS)
  const head = element('div', 'yms-head')
  const title = element('div')
  title.append(element('h2', '', welcomeOnly ? '动画设置' : '场景动效'), element('p', 'yms-description', welcomeOnly ? '欢迎时的光与风，由你调整。' : '欢迎时的光与风，工作时的安静陪伴。'))
  head.append(title)
  const close = compact && typeof onClose === 'function' ? element('button', 'yms-close close', '×') : null
  if (close) {
    close.type = 'button'
    close.dataset.close = ''
    close.setAttribute('aria-label', welcomeOnly ? '关闭动画设置' : '关闭场景动效设置')
    close.addEventListener('click', onClose)
    head.append(close)
  }
  const tabs = element('div', 'yms-tabs')
  tabs.setAttribute('role', 'tablist')
  tabs.setAttribute('aria-label', '动效场景')
  tabs.hidden = welcomeOnly
  const panels = new Map(), tabButtons = new Map()
  for (const [key, label] of welcomeOnly ? [['welcome', '欢迎场景']] : [['welcome', '欢迎场景'], ['wallpaper', '工作壁纸']]) {
    const button = element('button', 'yms-tab', label)
    button.type = 'button'
    button.id = `${id}-tab-${key}`
    button.dataset.tab = key
    button.setAttribute('role', 'tab')
    button.setAttribute('aria-controls', `${id}-panel-${key}`)
    const panel = element('div', 'yms-panel')
    panel.id = `${id}-panel-${key}`
    panel.setAttribute('role', welcomeOnly ? 'region' : 'tabpanel')
    panel.setAttribute(welcomeOnly ? 'aria-label' : 'aria-labelledby', welcomeOnly ? label : button.id)
    panel.tabIndex = 0
    panels.set(key, panel)
    tabButtons.set(key, button)
    tabs.append(button)
  }
  section.append(style, head, tabs, ...panels.values())
  const welcome = panels.get('welcome'), wallpaper = panels.get('wallpaper')
  const presetHeading = element('div', 'yms-heading')
  const presetState = element('span', 'yms-preset-state')
  presetHeading.append(element('h3', '', '欢迎氛围'), presetState)
  const presetRow = element('div', 'yms-presets')
  presetRow.setAttribute('role', 'group')
  presetRow.setAttribute('aria-label', '欢迎场景预设')
  const presetButtons = new Map()
  for (const preset of WELCOME_PRESETS) {
    const button = element('button', 'yms-preset')
    button.type = 'button'
    button.dataset.preset = preset.id
    button.append(element('strong', '', preset.label), element('span', '', preset.description))
    presetRow.append(button)
    presetButtons.set(preset.id, button)
  }
  welcome.append(presetHeading, presetRow)
  const fields = new Map()
  function toggle(parent, key, label, hint, disabledWhen = () => false) {
    const row = element('label', 'yms-toggle')
    const copy = element('span')
    copy.append(element('span', 'yms-label', label))
    if (hint) copy.append(element('span', 'yms-hint', hint))
    const input = element('input', 'yms-switch')
    input.type = 'checkbox'
    input.dataset.field = key
    input.setAttribute('role', 'switch')
    input.setAttribute('aria-label', label)
    const output = element('output', 'yms-sr')
    output.dataset.value = key
    row.append(copy, input, output)
    parent.append(row)
    fields.set(key, { input, output, row, disabledWhen })
  }
  function slider(parent, key, label, min, max, step, left, right, suffix, disabledWhen = () => false) {
    const row = element('div', 'yms-range')
    const heading = element('div', 'yms-range-heading')
    const input = element('input')
    input.type = 'range'
    input.id = `${id}-${key}`
    input.dataset.field = key
    input.min = String(min); input.max = String(max); input.step = String(step)
    const text = element('label', '', label)
    text.htmlFor = input.id
    const output = element('output')
    output.htmlFor = input.id
    output.dataset.value = key
    heading.append(text, output)
    const scale = element('div', 'yms-scale')
    scale.setAttribute('aria-hidden', 'true')
    scale.append(element('span', '', left), element('span', '', right))
    row.append(heading, input, scale)
    parent.append(row)
    fields.set(key, { input, output, row, disabledWhen, suffix })
  }
  const welcomeMain = element('div', 'yms-fields')
  toggle(welcomeMain, 'welcomeMotion', '欢迎动画', '控制场景展开、烟花、飘带与游鱼。')
  toggle(welcomeMain, 'entrance', '自动欢迎', '打开应用时显示欢迎场景。')
  const welcomeDetails = element('div', 'yms-subfields')
  toggle(welcomeDetails, 'fireworks', '烟花绽放', '', p => !p.welcomeMotion)
  toggle(welcomeDetails, 'ribbonMotion', '飘带随风', '', p => !p.welcomeMotion)
  toggle(welcomeDetails, 'riverMotion', '游鱼跃水', '', p => !p.welcomeMotion)
  const welcomeRanges = element('div')
  welcomeRanges.append(element('p', 'yms-duration-note', '亮度、幅度与速度的 50% 为原版效果，100% 为双倍；0% 保持静止或熄灭。'))
  slider(welcomeRanges, 'fireworkIntensity', '烟花亮度', 0, 100, .5, '熄灭', '增强', '%', p => !p.welcomeMotion || !p.fireworks)
  slider(welcomeRanges, 'handAmplitude', '挥手幅度', 0, 100, 1, '静止', '明显', '%', p => !p.welcomeMotion)
  slider(welcomeRanges, 'handSpeed', '挥手速度', 0, 100, 1, '静止', '轻快', '%', p => !p.welcomeMotion || p.handAmplitude === 0)
  slider(welcomeRanges, 'ribbonAmplitude', '左侧飘带摆幅', 0, 100, 1, '静止', '明显', '%', p => !p.welcomeMotion || !p.ribbonMotion)
  slider(welcomeRanges, 'ribbonSpeed', '左侧飘带速度', 0, 100, 1, '静止', '轻快', '%', p => !p.welcomeMotion || !p.ribbonMotion || p.ribbonAmplitude === 0)
  slider(welcomeRanges, 'fishCount', '游鱼数量', 2, 3, 1, '两条', '三条', ' 条')
  slider(welcomeRanges, 'riverAmplitude', '游鱼跃起幅度', 0, 100, 1, '静止', '明显', '%', p => !p.welcomeMotion || !p.riverMotion)
  slider(welcomeRanges, 'riverSpeed', '游鱼速度', 0, 100, 1, '静止', '轻快', '%', p => !p.welcomeMotion || !p.riverMotion || p.riverAmplitude === 0)
  slider(welcomeRanges, 'duration', '展开时长', 1.5, 5, .1, '利落', '从容', ' 秒', p => !p.welcomeMotion)
  welcome.append(welcomeMain, welcomeDetails, welcomeRanges,
    element('p', 'yms-duration-note', '展开时长不包含停留与 2.2 秒水波退场。'))
  if (!welcomeOnly) {
    wallpaper.append(element('p', 'yms-work-note', '进入工作台后的环境光影，调整即时生效。'))
    const workFields = element('div', 'yms-fields')
    toggle(workFields, 'motion', '环境动态', '关闭后保持静止，仍可调整亮度与暖色夕照。')
    slider(workFields, 'intensity', '环境光亮度', 0, 100, 1, '柔和', '明亮', '%')
    slider(workFields, 'speed', '运动速度', 10, 100, 1, '舒缓', '活跃', '%', p => !p.motion)
    slider(workFields, 'sunset', '暖色夕照', 0, 100, 1, '关闭', '温暖', '%')
    wallpaper.append(workFields)
  }
  const actions = element('div', 'yms-actions')
  const replay = element('button', 'yms-primary', welcomeOnly ? '重播动画' : '预览欢迎场景')
  replay.type = 'button'; replay.dataset.replay = ''
  const reset = element('button', 'yms-reset', '恢复默认')
  reset.type = 'button'; reset.dataset.reset = ''
  actions.append(replay, reset)
  const status = element('p', 'yms-status')
  status.setAttribute('role', 'status')
  const error = element('p', 'yms-error')
  error.setAttribute('role', 'alert'); error.hidden = true
  const reduced = element('p', 'yms-reduced', '系统已开启“减少动态效果”，当前保留静态画面。')
  reduced.hidden = true
  section.append(actions, status, error, reduced,
    element('p', 'yms-note', welcomeOnly ? '设置保存在本机，于下次预览生效。' : '设置保存在本机。欢迎场景的调整于下次预览生效；工作壁纸即时生效。'))
  container.append(section)

  let disposed = false, activeTab = 'welcome', saveSequence = 0
  let off = null
  function showError(message = '') {
    if (disposed) return
    error.textContent = message
    error.hidden = !message
  }
  function read() {
    try {
      const rawStatus = controller.getStatus()
      const state = rawStatus && typeof rawStatus === 'object' ? rawStatus : { message: String(rawStatus || '') }
      return { preferences: normalizeMotion(controller.getPreferences()), state, canReplay: controller.canReplay() === true }
    } catch {
      return { preferences: MOTION_DEFAULTS, state: { message: '暂时无法读取场景状态，请稍后重试。', active: false }, canReplay: false }
    }
  }
  function refresh() {
    if (disposed) return
    const { preferences, state, canReplay } = read()
    const inactive = state.active === false
    for (const [key, field] of fields) {
      const value = preferences[key]
      field.input.disabled = inactive || field.disabledWhen(preferences)
      field.row.dataset.disabled = String(field.input.disabled)
      if (field.input.type === 'checkbox') {
        field.input.checked = value
        field.input.setAttribute('aria-checked', String(value))
        field.output.textContent = value ? '已开启' : '已关闭'
      } else {
        field.input.value = String(value)
        const formatted = `${key === 'duration' ? value.toFixed(1) : value}${field.suffix}`
        field.output.textContent = formatted
        field.input.setAttribute('aria-valuetext', formatted)
      }
    }
    const selected = WELCOME_PRESETS.find(preset => Object.entries(preset.values).every(([key, value]) => preferences[key] === value))
    presetState.textContent = selected ? `已选 · ${selected.label}` : '自定义'
    for (const [key, button] of presetButtons) {
      button.disabled = inactive
      button.setAttribute('aria-pressed', String(selected?.id === key))
    }
    replay.disabled = !canReplay
    reset.disabled = inactive
    status.textContent = String(state.message || '')
    reduced.hidden = !state.reducedMotion
  }
  function save(patch) {
    if (disposed) return
    const thisSave = ++saveSequence
    showError()
    try {
      const result = controller.save(patch)
      refresh()
      if (result && typeof result.then === 'function') Promise.resolve(result).then(() => {
        if (!disposed && thisSave === saveSequence) refresh()
      }, () => {
        if (!disposed && thisSave === saveSequence) { showError('设置未能保存，请重试。'); refresh() }
      })
    } catch { showError('设置未能保存，请重试。'); refresh() }
  }
  function selectTab(key, focus = false) {
    activeTab = key
    for (const [name, button] of tabButtons) {
      const selected = name === key
      button.setAttribute('aria-selected', String(selected))
      button.tabIndex = selected ? 0 : -1
      panels.get(name).hidden = !selected
    }
    if (focus) tabButtons.get(key)?.focus()
  }
  function onTabKey(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const next = event.key === 'Home' ? 'welcome' : event.key === 'End' ? 'wallpaper' : activeTab === 'welcome' ? 'wallpaper' : 'welcome'
    selectTab(next, true)
  }
  tabs.addEventListener('keydown', onTabKey)
  for (const [key, button] of tabButtons) button.addEventListener('click', () => selectTab(key))
  for (const [key, field] of fields) field.input.addEventListener('input', () => {
    if (!field.input.disabled) save({ [key]: field.input.type === 'checkbox' ? field.input.checked : Number(field.input.value) })
  })
  for (const preset of WELCOME_PRESETS) presetButtons.get(preset.id).addEventListener('click', () => save({ ...preset.values }))
  reset.addEventListener('click', () => save(normalizeMotion(controller.defaultPreferences ?? MOTION_DEFAULTS)))
  replay.addEventListener('click', () => {
    showError()
    const failed = () => { showError('暂时无法预览欢迎场景，请查看当前状态后重试。'); refresh() }
    try {
      const result = controller.replay()
      if (result && typeof result.then === 'function') Promise.resolve(result).then(value => { if (value === false) failed(); else refresh() }, failed)
      else if (result === false) failed()
      else refresh()
    } catch { failed() }
  })
  selectTab('welcome')
  refresh()
  try { off = controller.subscribe(refresh) } catch { showError('状态更新暂时不可用，可关闭后重新打开设置。') }

  function dispose() {
    if (disposed) return
    disposed = true
    if (typeof off === 'function') off()
    section.remove()
  }
  return { refresh, dispose }
}
