import React from 'react'
import { mountEntrance } from './controller.mjs'
import { mountMotionSettings } from './wallpaper-settings-view.mjs'
export const name = 'dsh-entrance'
export function apply(ctx) {
  const controller = mountEntrance()
  if (!controller) return () => {}
  let off
  const slots = ctx.slots ?? ctx.get?.('slots')
  function Settings() {
    const ref = React.useRef(null)
    React.useEffect(() => {
      const view = mountMotionSettings(ref.current, controller, { welcomeOnly: true })
      return () => view.dispose()
    }, [])
    return React.createElement('div', { ref })
  }
  try {
    if (slots?.inject && slots?.register) off = slots.inject('settings.section', () => slots.register({ name: 'settings.section', id: 'dsh-entrance', label: () => '入场动画', order: 125 }, Settings))
  } catch (error) { console.warn('[dsh-entrance] Settings slot unavailable; use the floating button', error) }
  const dispose = () => { if (typeof off === 'function') off(); controller.dispose() }
  ctx.on?.('dispose', dispose)
  return dispose
}
