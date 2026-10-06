import { mountWelcomeScene, prepareWelcomeAssets } from './welcome-scene.mjs'
import { MOTION_DEFAULTS, normalizeMotion } from './wallpaper-preferences.mjs'
import { mountMotionSettings } from './wallpaper-settings-view.mjs'
export const STORAGE_KEY = 'dsh.entrance.preferences.v2'

// No skin/pet dependency: the host owns the workspace, this controller owns
// only its dialog, input shield, local preferences and settings surface.
export function mountEntrance({ autoStart = true } = {}) {
  if (document.querySelector('[data-dsh-entrance-controller]')) return null
  const anchor = document.createElement('div')
  anchor.dataset.dshEntranceController = ''
  const root = anchor.attachShadow({ mode: 'open' })
  root.innerHTML = `<style>
  :host{all:initial;color-scheme:dark;font:14px/1.5 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif}
  button{font:inherit;min-height:44px;border:1px solid #a88b5d;border-radius:12px;background:#162e38;color:#edd3a3;cursor:pointer;padding:9px 13px}
  button:focus-visible{outline:2px solid #edcc8e;outline-offset:3px}
  .tools{position:fixed;right:18px;top:80px;display:flex;gap:8px;z-index:2147483400}
  .panel{position:fixed;right:18px;top:136px;width:410px;max-width:calc(100vw - 24px);height:min(800px,calc(100dvh - 152px));overflow:hidden;border:1px solid #a88b5d;border-radius:18px;background:#102731;box-shadow:0 20px 70px #0008;z-index:2147483401}
  [hidden]{display:none!important}
  @media(max-width:540px),(max-height:650px){.tools{top:12px;right:12px}.panel{top:68px;right:12px;height:calc(100dvh - 80px)}}
  </style><div class="tools"><button data-open>入场设置</button><button data-preview>重播入场</button></div><section class="panel" role="region" aria-label="入场动画设置" hidden></section>`
  document.body.append(anchor)
  const panel = root.querySelector('.panel')
  const media = matchMedia('(prefers-reduced-motion: reduce)')
  const listeners = new Set(), pointers = new Set(), keys = new Set()
  let preferences = { ...MOTION_DEFAULTS }, storageError = false
  try { preferences = normalizeMotion(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')) } catch { storageError = true }
  let intro = null, scene = null, restoreFocus = null, panelFocus = null, disposed = false, exitReady = false, releaseTimer = null, startupTimer = null
  let startupCancelled = false, startupResolved = false
  const emit = () => listeners.forEach(listener => listener())
  function stop() {
    const focus = intro && (document.activeElement === intro || document.activeElement === document.body) ? restoreFocus : null
    scene?.dispose(); scene = null
    intro?.remove(); intro = null
    restoreFocus = null; exitReady = false; pointers.clear()
    clearTimeout(releaseTimer); releaseTimer = null
    if (focus?.isConnected) focus.focus({ preventScroll: true })
    emit()
  }
  function closeSettings() {
    panel.hidden = true
    if (panelFocus?.isConnected) panelFocus.focus({ preventScroll: true })
  }
  function replay() {
    startupCancelled = true
    if (disposed || document.hidden) return false
    // Let the established local wallpaper plugin retain its own controller.
    if (document.querySelector('[data-yoimiya-entrance]')) return false
    stop(); closeSettings()
    restoreFocus = document.activeElement
    intro = document.createElement('div')
    intro.dataset.dshEntrance = ''
    intro.tabIndex = -1
    intro.setAttribute('role', 'dialog'); intro.setAttribute('aria-modal', 'true')
    intro.setAttribute('aria-label', '欢迎场景，点击或按任意键进入工作台')
    document.body.append(intro)
    scene = mountWelcomeScene(intro.attachShadow({ mode: 'open' }), {
      ...preferences, motion: preferences.welcomeMotion && !media.matches,
      fireworksEnabled: preferences.fireworks,
      onFailure: () => { stop(); emit() },
    })
    intro.focus({ preventScroll: true }); emit(); return true
  }
  function dismiss(point) {
    if (!intro || intro.hasAttribute('data-exiting')) return
    intro.dataset.exiting = ''
    if (media.matches || !preferences.welcomeMotion) {
      intro.style.opacity = '0'; exitReady = true
      if (!pointers.size) releaseTimer = setTimeout(stop, 0)
      return
    }
    scene.dismiss(point, () => { exitReady = true; if (!pointers.size) stop() })
  }
  function openSettings() {
    startupCancelled = true; stop()
    panelFocus = document.activeElement; panel.hidden = false
    root.querySelector('[data-close]')?.focus({ preventScroll: true })
  }
  function save(patch) {
    preferences = normalizeMotion({ ...preferences, ...patch })
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)); storageError = false } catch { storageError = true }
    stop(); emit()
  }
  const onKey = event => {
    startupCancelled = true
    if (intro || keys.has(event.code || event.key)) {
      keys.add(event.code || event.key); dismiss(); event.preventDefault(); event.stopImmediatePropagation(); return
    }
    if (event.altKey && event.shiftKey && event.code === 'KeyW') { event.preventDefault(); panel.hidden ? openSettings() : closeSettings() }
    if (event.key === 'Escape' && !panel.hidden) closeSettings()
  }
  const onKeyUp = event => { const consumed = keys.delete(event.code || event.key); if (intro || consumed) { event.preventDefault(); event.stopImmediatePropagation() } }
  const onDown = event => {
    startupCancelled = true
    if (intro) { pointers.add(event.pointerId); dismiss({ x: event.clientX, y: event.clientY }); event.preventDefault(); event.stopImmediatePropagation() }
    else if (!panel.hidden && !event.composedPath().includes(anchor)) closeSettings()
  }
  const onUp = event => {
    const consumed = pointers.delete(event.pointerId)
    if (!intro && !consumed) return
    event.preventDefault(); event.stopImmediatePropagation()
    if (exitReady && !pointers.size) releaseTimer = setTimeout(stop, 0)
  }
  const onClick = event => { if (intro) { dismiss(event.detail ? { x: event.clientX, y: event.clientY } : undefined); event.preventDefault(); event.stopImmediatePropagation() } }
  const onWheel = event => { startupCancelled = true; if (intro) { event.preventDefault(); event.stopImmediatePropagation() } }
  const interrupted = () => { keys.clear(); pointers.clear(); if (intro?.hasAttribute('data-exiting')) stop() }
  const onVisibility = () => { if (document.hidden) interrupted(); scene?.setPaused(document.hidden); emit(); if (!document.hidden) tryStartup() }
  const onMotion = () => { if (intro?.hasAttribute('data-exiting')) stop(); else scene?.setMotion(preferences.welcomeMotion && !media.matches); emit() }
  const onStorage = event => { if (event.key === STORAGE_KEY) { try { preferences = normalizeMotion(JSON.parse(event.newValue || '{}')); stop(); emit() } catch {} } }
  const events = [['keydown',onKey],['keyup',onKeyUp],['pointerdown',onDown],['pointerup',onUp],['pointercancel',onUp],['click',onClick],['wheel',onWheel]]
  events.forEach(([type, handler]) => document.addEventListener(type, handler, { capture: true, passive: false }))
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('blur', interrupted); window.addEventListener('storage', onStorage)
  media.addEventListener('change', onMotion)
  root.querySelector('[data-open]').addEventListener('click', openSettings)
  root.querySelector('[data-preview]').addEventListener('click', replay)
  document.addEventListener('dsh-entrance:replay', replay)
  document.addEventListener('dsh-entrance:settings', openSettings)
  const controller = {
    defaultPreferences: MOTION_DEFAULTS, getPreferences: () => preferences,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener) },
    save, replay, canReplay: () => !disposed && !document.hidden && !document.querySelector('[data-yoimiya-entrance]'),
    getStatus: () => ({ active: Boolean(intro), message: storageError ? '本机存储不可用，设置仅在本次会话生效。' : media.matches ? '系统减少动态已开启；当前保留静态画面。' : '50% 对应原有效果，设置在下次重播时生效。' }),
    dispose() {
      if (disposed) return
      disposed = true; clearTimeout(startupTimer); stop(); view.dispose(); anchor.remove(); listeners.clear(); keys.clear()
      events.forEach(([type, handler]) => document.removeEventListener(type, handler, true))
      document.removeEventListener('visibilitychange', onVisibility); window.removeEventListener('blur', interrupted); window.removeEventListener('storage', onStorage)
      document.removeEventListener('dsh-entrance:replay', replay); document.removeEventListener('dsh-entrance:settings', openSettings); media.removeEventListener('change', onMotion)
    },
  }
  const view = mountMotionSettings(panel, controller, { compact: true, welcomeOnly: true, onClose: closeSettings })
  function tryStartup() {
    if (!autoStart || disposed || startupCancelled || startupResolved || document.hidden) return
    startupResolved = true
    if (!preferences.entrance || document.querySelector('[data-yoimiya-controller],[role="dialog"],dialog[open]')) return
    replay()
  }
  prepareWelcomeAssets().then(() => { startupTimer = setTimeout(tryStartup, 0) }).catch(() => {})
  return controller
}
