import React from 'react'
import { mountEntrance } from './controller.mjs'
import { mountMotionSettings } from './wallpaper-settings-view.mjs'
export const name = 'dsh-entrance'
export const inject = ['slots']
export function apply(ctx) {
  const controller = mountEntrance()
  if (!controller) return () => {}
  let off
  function Settings() {
    const ref = React.useRef(null)
    React.useEffect(() => {
      const view = mountMotionSettings(ref.current, controller, { welcomeOnly: true })
      return () => view.dispose()
    }, [])
    return React.createElement('div', { ref })
  }
  try {
    const slots = ctx.slots
    if (slots?.inject && slots?.register) off = slots.inject('settings.section', () => slots.register({ name: 'settings.section', id: 'dsh-entrance', label: () => '入场动画', order: 125 }, Settings))
  } catch (error) { console.warn('[dsh-entrance] Settings slot unavailable; use the floating button', error) }
  let disposed = false
  const dispose = () => {
    if (disposed) return
    disposed = true
    if (typeof off === 'function') off()
    controller.dispose()
  }
  // Cordis constructs ordinary apply functions; own teardown through an effect.
  if (typeof ctx.effect === 'function') ctx.effect(() => dispose, 'dsh-entrance.client')
  return dispose
}
