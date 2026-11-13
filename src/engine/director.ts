import gsap from 'gsap'
import Lenis from 'lenis'

/* ───────────────── math helpers ───────────────── */
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp(t), 3)
export const easeOutQuart = (t: number) => 1 - Math.pow(1 - clamp(t), 4)
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * clamp(t)) - 1) / 2
export const easeInOut = (t: number) => {
  t = clamp(t)
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/* ───────────────── scenes ───────────────── */
// The source clip is one continuous shot, so it is split into four pose
// segments (S1 stand/turn, S2 sit down, S3 typing, S4 stand up & face camera).
export const SHOTS: [number, number][] = [
  [0, 59],
  [60, 119],
  [120, 179],
  [180, 239],
]

export interface Scene {
  id: string
  from: number
  to: number // to < from plays in reverse
  x: number
  k: number
  label: string
  vh: number // section height in vh
}

export const SCENES: Scene[] = [
  { id: 'hero', from: 0, to: 59, x: 0.7, k: 1.0, label: 'Hello', vh: 230 },
  { id: 'about', from: 60, to: 119, x: 0.27, k: 1.0, label: 'About', vh: 280 },
  { id: 'work', from: 120, to: 179, x: 0.77, k: 0.86, label: 'Work', vh: 460 },
  { id: 'journey', from: 180, to: 216, x: 0.26, k: 1.0, label: 'Journey', vh: 240 },
  { id: 'skills', from: 216, to: 231, x: 0.5, k: 0.98, label: 'Toolkit', vh: 280 },
  { id: 'awards', from: 231, to: 239, x: 0.75, k: 1.0, label: 'Training', vh: 320 },
  { id: 'contact', from: 59, to: 0, x: 0.5, k: 1.0, label: 'Contact', vh: 240 }, // S1 reversed
]
export const CONTACT = SCENES.length - 1

export interface SceneState {
  id: string
  i: number
  top: number
  h: number
  enter: number
  p: number
  exit: number
  vis: number
}
export interface Layer {
  frame: number
  x: number
  k: number
}
export interface Tick {
  y: number
  vw: number
  vh: number
  time: number
  scenes: SceneState[]
  active: number
  t: number // blade progress into the active scene (1 = settled)
  a: Layer // current / incoming
  b: Layer | null // outgoing (only while the blade is moving)
  contactT: number
  progress: number
}

type Sub = (t: Tick) => void

/* ───────────────── director ───────────────── */
class Director {
  lenis: Lenis | null = null
  subs = new Set<Sub>()
  tick: Tick | null = null
  secs: HTMLElement[] = []
  tops: number[] = []
  hs: number[] = []
  vw = innerWidth
  vh = innerHeight
  docH = 1
  ro: ResizeObserver | null = null
  ready = false
  started = false

  init() {
    if (this.ready) return
    this.ready = true
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    this.secs = SCENES.map((s) => document.querySelector(`section[data-scene="${s.id}"]`) as HTMLElement)
    this.measure()
    this.ro = new ResizeObserver(() => this.measure())
    this.secs.forEach((s) => s && this.ro!.observe(s))
    this.ro.observe(document.body)
    addEventListener('resize', this.measure)

    this.lenis = new Lenis({ lerp: 0.075, smoothWheel: true, wheelMultiplier: 0.9, touchMultiplier: 1.4 })
    this.lenis.stop() // stays stopped until the preloader finishes
    gsap.ticker.lagSmoothing(0)
    gsap.ticker.add(this.loop)
  }

  measure = () => {
    this.vw = innerWidth
    this.vh = innerHeight
    const sy = window.scrollY
    this.tops = this.secs.map((el) => (el ? el.getBoundingClientRect().top + sy : 0))
    this.hs = this.secs.map((el) => (el ? el.offsetHeight : 0))
    this.docH = document.documentElement.scrollHeight
  }

  start() {
    this.started = true
    this.lenis?.start()
  }

  subscribe(fn: Sub) {
    this.subs.add(fn)
    if (this.tick) fn(this.tick)
    return () => {
      this.subs.delete(fn)
    }
  }

  scrollTo(id: string, duration = 2.2) {
    const i = SCENES.findIndex((s) => s.id === id)
    if (i < 0 || !this.lenis) return
    // land slightly inside the section so the blade has fully settled
    const target = this.tops[i] + (i === 0 ? 0 : 4)
    this.lenis.scrollTo(target, { duration, easing: easeOutQuart })
  }

  loop = (timeSec: number) => {
    this.lenis?.raf(timeSec * 1000)
    const y = this.lenis ? this.lenis.scroll : window.scrollY
    const { vh, vw, tops, hs } = this
    if (!tops.length) return

    const scenes: SceneState[] = SCENES.map((s, i) => {
      const top = tops[i]
      const h = hs[i] || vh
      const enter = clamp((y - (top - vh)) / vh)
      const p = clamp((y - top) / Math.max(1, h - vh))
      const exit = clamp((y - (top + h - vh)) / vh)
      const vis = clamp(Math.min(enter * 1.6, 1 - exit * 2.2))
      return { id: s.id, i, top, h, enter, p, exit, vis }
    })

    const lead = 0.78 * vh
    const span = 0.62 * vh
    let active = 0
    for (let i = 0; i < SCENES.length; i++) if (y >= tops[i] - lead) active = i

    const sc = SCENES[active]
    const p = scenes[active].p
    const a: Layer = { frame: sc.from + (sc.to - sc.from) * p, x: sc.x, k: sc.k }
    let b: Layer | null = null
    let t = 1
    if (active > 0) {
      t = easeInOutSine(clamp((y - (tops[active] - lead)) / span))
      if (t < 1) {
        const pv = SCENES[active - 1]
        b = { frame: pv.to, x: pv.x, k: pv.k }
        a.frame = sc.from
      }
    }
    const contactT = active === CONTACT ? t : 0
    const progress = clamp(y / Math.max(1, this.docH - vh))

    const tk: Tick = { y, vw, vh, time: timeSec, scenes, active, t, a, b, contactT, progress }
    this.tick = tk
    this.subs.forEach((fn) => fn(tk))
  }
}

export const director = new Director()
