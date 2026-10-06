// One schema for both settings surfaces and the scene controller. Old `motion`
// records governed both scenes; migrate that intent only when welcomeMotion is absent.
export const MOTION_DEFAULTS = Object.freeze({
  motion: true, entrance: true, intensity: 70, speed: 45, duration: 3.2, sunset: 35,
  welcomeMotion: true, fireworks: true, ribbonMotion: true, riverMotion: true,
  fireworkIntensity: 100,
})

export function normalizeMotion(value = {}) {
  if (!value || typeof value !== 'object') value = {}
  const boolean = key => typeof value[key] === 'boolean' ? value[key] : MOTION_DEFAULTS[key]
  const number = (key, min, max) => typeof value[key] === 'number' && Number.isFinite(value[key])
    ? Math.min(max, Math.max(min, value[key])) : MOTION_DEFAULTS[key]
  return {
    motion: boolean('motion'), entrance: boolean('entrance'),
    intensity: number('intensity', 0, 100), speed: number('speed', 10, 100),
    duration: number('duration', 1.5, 5), sunset: number('sunset', 0, 100),
    welcomeMotion: typeof value.welcomeMotion === 'boolean' ? value.welcomeMotion : value.motion !== false,
    fireworks: boolean('fireworks'), ribbonMotion: boolean('ribbonMotion'), riverMotion: boolean('riverMotion'),
    fireworkIntensity: number('fireworkIntensity', 0, 100),
  }
}

// Presets intentionally leave automatic welcome and every work-wallpaper field alone.
export const WELCOME_PRESETS = Object.freeze([
  Object.freeze({ id: 'quiet', label: '静谧', description: '留一缕微风', values: Object.freeze({
    welcomeMotion: true, fireworks: false, ribbonMotion: true, riverMotion: false,
    fireworkIntensity: 35, duration: 2.4,
  }) }),
  Object.freeze({ id: 'soft', label: '轻盈', description: '柔光与水意', values: Object.freeze({
    welcomeMotion: true, fireworks: true, ribbonMotion: true, riverMotion: true,
    fireworkIntensity: 60, duration: 2.8,
  }) }),
  Object.freeze({ id: 'festival', label: '祭典', description: '烟花正盛时', values: Object.freeze({
    welcomeMotion: true, fireworks: true, ribbonMotion: true, riverMotion: true,
    fireworkIntensity: 100, duration: 3.2,
  }) }),
])
