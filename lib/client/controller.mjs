import { mountWelcomeScene, prepareWelcomeAssets } from './welcome-scene.mjs'
import { MOTION_DEFAULTS, normalizeMotion } from './wallpaper-preferences.mjs'
import { mountMotionSettings } from './wallpaper-settings-view.mjs'
export const STORAGE_KEY = 'dsh.entrance.preferences.v2'
function focusedElement() {
  let element = document.activeElement
  while (element?.shadowRoot?.activeElement) element = element.shadowRoot.activeElement
  return element
}

// No skin/pet dependency: the host owns the workspace, this controller owns
// only its dialog, input shield, local preferences and settings surface.
export function mountEntrance({ autoStart = true } = {}) {
  if (document.querySelector('[data-dsh-entrance-controller]')) return null
  const anchor = document.createElement('div')
  anchor.dataset.dshEntranceController = ''
  const root = anchor.attachShadow({ mode: 'open' })
  root.innerHTML = `<style>
  :host{all:initial;color-scheme:dark;font:14px/1.5 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif}
  .tools{position:fixed;right:18px;top:80px;z-index:2147483400}
  .settings-trigger{display:flex;align-items:center;gap:8px;min-height:44px;padding:10px 16px;border:1px solid var(--dsw-alias-border-l2,#ffffff12);border-radius:999px;background:var(--dsw-alias-bg-layer-2,#25262a);color:var(--dsw-alias-label-secondary,#c3c6ce);font:500 13px/1.5 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;cursor:pointer;white-space:nowrap;transition:background-color .15s ease,border-color .15s ease}
  .settings-trigger svg{width:17px;height:17px;flex:none;color:var(--dsw-alias-label-tertiary,#aab0bf)}
  .settings-trigger:hover,.settings-trigger[aria-expanded=true]{background:var(--dsw-alias-bg-layer-3,#303238);border-color:var(--dsw-alias-border-l3,#ffffff24)}
  .settings-trigger:focus-visible{outline:2px solid var(--dsw-alias-label-tertiary,#aab0bf);outline-offset:3px}
  .panel{position:fixed;right:18px;top:136px;width:410px;max-width:calc(100vw - 24px);height:min(800px,calc(100dvh - 152px));overflow:hidden;border:1px solid #a88b5d;border-radius:18px;background:#102731;box-shadow:0 20px 70px #0008;z-index:2147483401}
  [hidden]{display:none!important}
  @media(max-width:540px),(max-height:650px){.tools{top:64px;right:12px}.panel{top:120px;right:12px;height:calc(100dvh - 132px)}}
  @media(prefers-reduced-motion:reduce){.settings-trigger{transition:none}}
  </style><div class="tools"><button class="settings-trigger" type="button" data-open aria-expanded="false" aria-controls="dsh-entrance-settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 6h7m4 0h5M4 12h2m4 0h10M4 18h10m4 0h2M11 3v6M6 9v6M14 15v6"/></svg><span>动画设置</span></button></div><section id="dsh-entrance-settings" class="panel" role="region" aria-label="动画设置" hidden></section>`
  document.body.append(anchor)
  const panel = root.querySelector('.panel')
  const settingsButton = root.querySelector('[data-open]')
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
  function closeSettings({ returnFocus = true } = {}) {
    if (panel.hidden) return
    panel.hidden = true
    settingsButton.setAttribute('aria-expanded', 'false')
    if (returnFocus && panelFocus?.isConnected) panelFocus.focus({ preventScroll: true })
    panelFocus = null
  }
  function replay() {
    startupCancelled = true
    if (disposed || document.hidden) return false
    // Let the established local wallpaper plugin retain its own controller.
    if (document.querySelector('[data-yoimiya-entrance]')) return false
    const fromSettings = !panel.hidden
    stop(); closeSettings({ returnFocus: false })
    // The panel's replay control is now hidden. Restore to its visible launcher.
    restoreFocus = fromSettings ? settingsButton : focusedElement()
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
    if (panel.hidden) panelFocus = focusedElement()
    panel.hidden = false
    settingsButton.setAttribute('aria-expanded', 'true')
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
    if (event.altKey && event.shiftKey && event.code === 'KeyW') { event.preventDefault(); event.stopImmediatePropagation(); panel.hidden ? openSettings() : closeSettings() }
    if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); event.stopImmediatePropagation(); closeSettings() }
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
  settingsButton.addEventListener('click', () => panel.hidden ? openSettings() : closeSettings())
  document.addEventListener('dsh-entrance:replay', replay)
  document.addEventListener('dsh-entrance:settings', openSettings)
  const controller = {
    defaultPreferences: MOTION_DEFAULTS, getPreferences: () => preferences,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener) },
    save, replay, canReplay: () => !disposed && !document.hidden && !document.querySelector('[data-yoimiya-entrance]'),
    getStatus: () => ({ active: !disposed, sceneActive: Boolean(intro), message: storageError ? '本机存储不可用，设置仅在本次会话生效。' : media.matches ? '系统减少动态已开启；当前保留静态画面。' : '50% 对应原有效果，设置在下次重播时生效。' }),
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
