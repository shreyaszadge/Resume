import { useEffect, useRef } from 'react'
import { DATA } from '../data'
import { lerp } from '../engine/director'
import { reveal, sceneOf, useDirector } from '../engine/hooks'

const N = DATA.skills.length
// Fibonacci sphere
const PTS = DATA.skills.map((_, i) => {
  const y = 1 - (i / (N - 1)) * 2
  const r = Math.sqrt(1 - y * y)
  const th = i * Math.PI * (3 - Math.sqrt(5))
  return { x: Math.cos(th) * r, y, z: Math.sin(th) * r }
})

const orbit = { mx: 0, my: 0, smx: 0, smy: 0, scroll: 0 }

/** BACK layer: chips with z < 0 (behind the person). */
export function SkillsBack() {
  const wrap = useRef<HTMLDivElement>(null)
  const chips = useRef<(HTMLSpanElement | null)[]>([])
  useDirector((t) => {
    const s = sceneOf(t, 'skills')
    const vis = Math.max(0, Math.min(1, s.vis))
    if (wrap.current) wrap.current.style.visibility = vis < 0.005 ? 'hidden' : 'visible'
    if (vis < 0.005) return
    const mobile = t.vw < 820
    const R = mobile ? Math.min(t.vw * 0.42, t.vh * 0.3) : Math.min(t.vw * 0.27, t.vh * 0.46)
    const cx = t.vw * 0.5
    const cy = t.vh * (mobile ? 0.5 : 0.54)
    orbit.smx = lerp(orbit.smx, orbit.mx, 0.05)
    orbit.smy = lerp(orbit.smy, orbit.my, 0.05)
    const A = t.time * 0.28 + t.y * 0.0042 + orbit.smx * 0.7
    const T = -0.28 + orbit.smy * 0.22
    const cA = Math.cos(A),
      sA = Math.sin(A),
      cT = Math.cos(T),
      sT = Math.sin(T)
    PTS.forEach((p, i) => {
      const x1 = p.x * cA + p.z * sA
      const z1 = -p.x * sA + p.z * cA
      const y2 = p.y * cT - z1 * sT
      const z2 = p.y * sT + z1 * cT
      const X = cx + x1 * R
      const Y = cy + y2 * R * 0.78
      const el = chips.current[i]
      if (!el) return
      if (z2 < 0) {
        const sc = 0.72 + 0.28 * (z2 + 1)
        el.style.opacity = (vis * (0.35 + 0.5 * (z2 + 1))).toFixed(3)
        el.style.transform = `translate3d(${X.toFixed(1)}px,${Y.toFixed(1)}px,0) translate(-50%,-50%) scale(${sc.toFixed(3)})`
      } else el.style.opacity = '0'
    })
  })
  return (
    <div className="orbit-layer" ref={wrap}>
      {DATA.skills.map((s, i) => (
        <span className="chip chip-back" key={i} ref={(el) => (chips.current[i] = el)}>
          {s}
        </span>
      ))}
    </div>
  )
}

/** FRONT layer: chips with z > 0 (in front of the person). */
export function SkillsFront() {
  const wrap = useRef<HTMLDivElement>(null)
  const chips = useRef<(HTMLSpanElement | null)[]>([])
  useEffect(() => {
    const m = (e: MouseEvent) => {
      orbit.mx = (e.clientX / innerWidth - 0.5) * 2
      orbit.my = (e.clientY / innerHeight - 0.5) * 2
    }
    addEventListener('mousemove', m)
    return () => removeEventListener('mousemove', m)
  }, [])
  useDirector((t) => {
    const s = sceneOf(t, 'skills')
    const vis = Math.max(0, Math.min(1, s.vis))
    if (wrap.current) wrap.current.style.visibility = vis < 0.005 ? 'hidden' : 'visible'
    if (vis < 0.005) return
    const mobile = t.vw < 820
    const R = mobile ? Math.min(t.vw * 0.42, t.vh * 0.3) : Math.min(t.vw * 0.27, t.vh * 0.46)
    const cx = t.vw * 0.5
    const cy = t.vh * (mobile ? 0.5 : 0.54)
    const A = t.time * 0.28 + t.y * 0.0042 + orbit.smx * 0.7
    const T = -0.28 + orbit.smy * 0.22
    const cA = Math.cos(A),
      sA = Math.sin(A),
      cT = Math.cos(T),
      sT = Math.sin(T)
    PTS.forEach((p, i) => {
      const x1 = p.x * cA + p.z * sA
      const z1 = -p.x * sA + p.z * cA
      const y2 = p.y * cT - z1 * sT
      const z2 = p.y * sT + z1 * cT
      const X = cx + x1 * R
      const Y = cy + y2 * R * 0.78
      const el = chips.current[i]
      if (!el) return
      if (z2 >= 0) {
        const sc = 0.9 + 0.3 * z2
        el.style.opacity = (vis * (0.8 + 0.2 * z2)).toFixed(3)
        el.style.transform = `translate3d(${X.toFixed(1)}px,${Y.toFixed(1)}px,0) translate(-50%,-50%) scale(${sc.toFixed(3)})`
      } else el.style.opacity = '0'
    })
  })
  return (
    <div className="orbit-layer" ref={wrap}>
      {DATA.skills.map((s, i) => (
        <span className="chip chip-front" key={i} ref={(el) => (chips.current[i] = el)}>
          {s}
        </span>
      ))}
    </div>
  )
}

export function Skills() {
  const label = useRef<HTMLDivElement>(null)
  const title = useRef<HTMLDivElement>(null)
  const tape = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const half = useRef(0)

  useDirector((t) => {
    const s = sceneOf(t, 'skills')
    reveal(label.current, s, 0.1, 24)
    reveal(title.current, s, 0.2, 40)
    if (tape.current) {
      const e = Math.max(0, Math.min(1, s.vis))
      tape.current.style.opacity = e.toFixed(3)
      tape.current.style.transform = `translate3d(0,${((1 - e) * 14).toFixed(1)}vh,0) rotate(-2deg)`
    }
    if (track.current) {
      if (!half.current || half.current < 10) half.current = track.current.scrollWidth / 2
      const off = (t.y * 0.45) % (half.current || 1)
      track.current.style.transform = `translate3d(${(-off).toFixed(1)}px,0,0)`
    }
  })

  const row = DATA.skills.map((s) => s).concat(DATA.skills)
  return (
    <section className="scene" data-scene="skills" style={{ height: '280vh' }}>
      <div className="sticky">
        <div className="inner">
          <div className="skills-head">
            <div className="label" ref={label}>
              <i>(04)</i> — Toolkit
            </div>
            <h2 className="h2" ref={title}>
              EVERYTHING
              <br />
              <span className="red">IN ORBIT.</span>
            </h2>
          </div>
          <div className="tape" ref={tape}>
            <div className="tape-track" ref={track}>
              {row.concat(row).map((s, i) => (
                <span key={i}>
                  {s} <em>✦</em>{' '}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
