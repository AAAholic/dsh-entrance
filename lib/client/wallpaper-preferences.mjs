// One schema for both settings surfaces and the scene controller. Old `motion`
// records governed both scenes; migrate that intent only when welcomeMotion is absent.
export const MOTION_DEFAULTS = Object.freeze({
  motion: true, entrance: true, intensity: 70, speed: 45, duration: 3.2, sunset: 35,
  welcomeMotion: true, fireworks: true, ribbonMotion: true, riverMotion: true,
  welcomeScaleVersion: 2, fireworkIntensity: 50,
  handAmplitude: 50, handSpeed: 50, ribbonAmplitude: 50, ribbonSpeed: 50,
  riverAmplitude: 50, riverSpeed: 50, fishCount: 3,
})

export function normalizeMotion(value = {}) {
  if (!value || typeof value !== 'object') value = {}
  const boolean = key => typeof value[key] === 'boolean' ? value[key] : MOTION_DEFAULTS[key]
  const number = (key, min, max) => typeof value[key] === 'number' && Number.isFinite(value[key])
    ? Math.min(max, Math.max(min, value[key])) : MOTION_DEFAULTS[key]
  // Unversioned stored records used 100 for the original fireworks. Once the
  // record is normalized it carries its scale, so reads and saves are idempotent.
  const legacyFireworks = value.welcomeScaleVersion !== 2 &&
    typeof value.fireworkIntensity === 'number' && Number.isFinite(value.fireworkIntensity)
  return {
    motion: boolean('motion'), entrance: boolean('entrance'),
    intensity: number('intensity', 0, 100), speed: number('speed', 10, 100),
    duration: number('duration', 1.5, 5), sunset: number('sunset', 0, 100),
    welcomeMotion: typeof value.welcomeMotion === 'boolean' ? value.welcomeMotion : value.motion !== false,
    fireworks: boolean('fireworks'), ribbonMotion: boolean('ribbonMotion'), riverMotion: boolean('riverMotion'),
    welcomeScaleVersion: 2,
    fireworkIntensity: legacyFireworks ? number('fireworkIntensity', 0, 100) / 2 : number('fireworkIntensity', 0, 100),
    handAmplitude: number('handAmplitude', 0, 100), handSpeed: number('handSpeed', 0, 100),
    ribbonAmplitude: number('ribbonAmplitude', 0, 100), ribbonSpeed: number('ribbonSpeed', 0, 100),
    riverAmplitude: number('riverAmplitude', 0, 100), riverSpeed: number('riverSpeed', 0, 100),
    fishCount: Math.round(number('fishCount', 2, 3)),
  }
}

// Presets intentionally leave automatic welcome and every work-wallpaper field alone.
export const WELCOME_PRESETS = Object.freeze([
  Object.freeze({ id: 'quiet', label: '静谧', description: '留一缕微风', values: Object.freeze({
    welcomeScaleVersion: 2,
    welcomeMotion: true, fireworks: false, ribbonMotion: true, riverMotion: false,
    fireworkIntensity: 17.5, handAmplitude: 25, handSpeed: 30,
    ribbonAmplitude: 25, ribbonSpeed: 30, riverAmplitude: 25, riverSpeed: 30, fishCount: 2, duration: 2.4,
  }) }),
  Object.freeze({ id: 'soft', label: '轻盈', description: '柔光与水意', values: Object.freeze({
    welcomeScaleVersion: 2,
    welcomeMotion: true, fireworks: true, ribbonMotion: true, riverMotion: true,
    fireworkIntensity: 30, handAmplitude: 35, handSpeed: 40,
    ribbonAmplitude: 35, ribbonSpeed: 40, riverAmplitude: 35, riverSpeed: 40, fishCount: 3, duration: 2.8,
  }) }),
  Object.freeze({ id: 'festival', label: '祭典', description: '烟花正盛时', values: Object.freeze({
    welcomeScaleVersion: 2,
    welcomeMotion: true, fireworks: true, ribbonMotion: true, riverMotion: true,
    fireworkIntensity: 50, handAmplitude: 50, handSpeed: 50,
    ribbonAmplitude: 50, ribbonSpeed: 50, riverAmplitude: 50, riverSpeed: 50, fishCount: 3, duration: 3.2,
  }) }),
])
