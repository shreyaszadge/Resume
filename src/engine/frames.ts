import { SHOTS } from './director'

export interface Shot {
  from: number
  to: number
  box: [number, number, number, number]
  cx: number
}
export interface Manifest {
  w: number
  h: number
  count: number
  shots: Shot[]
}

export const frames = {
  manifest: null as Manifest | null,
  imgs: [] as (HTMLImageElement | null)[],
  loaded: 0,
  mobile: false,
  shotOf(i: number) {
    for (let s = 0; s < SHOTS.length; s++) if (i >= SHOTS[s][0] && i <= SHOTS[s][1]) return s
    return SHOTS.length - 1
  },
  /** exact frame, or the nearest loaded frame inside the same shot */
  get(i: number): HTMLImageElement | null {
    const m = this.manifest
    if (!m) return null
    i = Math.max(0, Math.min(m.count - 1, Math.round(i)))
    if (this.imgs[i]) return this.imgs[i]
    const [a, b] = SHOTS[this.shotOf(i)]
    for (let d = 1; d <= b - a; d++) {
      if (i - d >= a && this.imgs[i - d]) return this.imgs[i - d]
      if (i + d <= b && this.imgs[i + d]) return this.imgs[i + d]
    }
    return null
  },
}

const pad = (n: number) => String(n).padStart(3, '0')

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      const done = () => res(img)
      if (img.decode) img.decode().then(done, done)
      else done()
    }
    img.onerror = () => res(null)
    img.src = src
  })
}

/** Loads the manifest and the frames. Resolves once the first quarter is in; the rest streams on. */
export async function loadFrames(onProgress: (p: number) => void): Promise<void> {
  const base = import.meta.env.BASE_URL
  const res = await fetch(`${base}frames/manifest.json`)
  const m: Manifest = await res.json()
  frames.manifest = m
  frames.imgs = new Array(m.count).fill(null)
  frames.mobile = innerWidth < 820
  const dir = frames.mobile ? 'sm' : 'lg'

  // stride order 8 → 4 → 2 → 1, shot boundaries first
  const order: number[] = []
  const seen = new Set<number>()
  const add = (i: number) => {
    if (i >= 0 && i < m.count && !seen.has(i)) {
      seen.add(i)
      order.push(i)
    }
  }
  SHOTS.forEach(([a, b]) => {
    add(a)
    add(b)
  })
  for (const s of [8, 4, 2, 1]) for (let i = 0; i < m.count; i += s) add(i)

  const quarter = Math.ceil(m.count / 4)
  let cursor = 0
  let resolveQuarter!: () => void
  const quarterDone = new Promise<void>((r) => (resolveQuarter = r))

  const worker = async () => {
    while (cursor < order.length) {
      const i = order[cursor++]
      const img = await loadImg(`${base}frames/${dir}/f${pad(i)}.webp`)
      if (img) frames.imgs[i] = img
      frames.loaded++ // failures count too so the preloader never stalls; get() falls back
      onProgress(Math.min(1, frames.loaded / quarter))
      if (frames.loaded >= quarter) resolveQuarter()
    }
  }
  const pool = Array.from({ length: 8 }, worker)
  await quarterDone
  void Promise.all(pool)
}
