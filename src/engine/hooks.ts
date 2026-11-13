import { useEffect, useRef } from 'react'
import { director, easeOutCubic, clamp, SCENES } from './director'
import type { Tick, SceneState } from './director'

/** Subscribe to the scroll director. The callback mutates the DOM via refs — never React state. */
export function useDirector(fn: (t: Tick) => void) {
  const ref = useRef(fn)
  ref.current = fn
  useEffect(() => director.subscribe((t) => ref.current(t)), [])
}

export const sceneIndex = (id: string) => SCENES.findIndex((s) => s.id === id)
export const sceneOf = (t: Tick, id: string): SceneState => t.scenes[sceneIndex(id)]

/**
 * Standard reveal for a text block: fades/translates in on enter (easeOutCubic),
 * fades out fast on exit so neighbouring sections never overlap.
 */
export function reveal(el: HTMLElement | null, s: SceneState, delay = 0, dy = 40, dx = 0, extra = '') {
  if (!el) return
  const e = easeOutCubic(clamp((s.enter - delay) / (1 - delay)))
  const o = e * Math.max(0, 1 - s.exit * 2.4)
  el.style.opacity = o.toFixed(3)
  el.style.transform = `translate3d(${(dx * (1 - e)).toFixed(1)}px,${(dy * (1 - e)).toFixed(1)}px,0) ${extra}`
  el.style.pointerEvents = o < 0.4 ? 'none' : ''
}

/** Back-layer element: opacity follows scene visibility. */
export function backVis(el: HTMLElement | null, s: SceneState, extra = '') {
  if (!el) return
  const o = Math.max(0, Math.min(1, s.vis))
  el.style.opacity = o.toFixed(3)
  el.style.visibility = o < 0.005 ? 'hidden' : 'visible'
  if (extra) el.style.transform = extra
}
