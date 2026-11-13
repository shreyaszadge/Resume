import { useMemo, useRef } from 'react'
import { DATA } from '../data'
import { clamp, easeOutCubic } from '../engine/director'
import { backVis, reveal, sceneOf, useDirector } from '../engine/hooks'
import { Odometer } from '../components/Odometer'
import type { OdometerHandle } from '../components/Odometer'
import { TiltCard } from '../components/TiltCard'

export function AboutBack() {
  const el = useRef<HTMLDivElement>(null)
  useDirector((t) => {
    const s = sceneOf(t, 'about')
    backVis(el.current, s, `translate3d(${((1 - clamp(s.vis)) * -60).toFixed(1)}px,0,0)`)
  })
  return <div className="about-shade" ref={el} />
}

type W = { w: string; red: boolean }
function parse(text: string): W[] {
  const out: W[] = []
  text.split(/(\*[^*]+\*)/).forEach((chunk) => {
    const red = chunk.startsWith('*')
    chunk
      .replace(/\*/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .forEach((w) => out.push({ w, red }))
  })
  return out
}

export function About() {
  const words = useMemo(() => parse(DATA.manifesto), [])
  const label = useRef<HTMLDivElement>(null)
  const wEls = useRef<(HTMLSpanElement | null)[]>([])
  const cards = useRef<(HTMLDivElement | null)[]>([])
  const odos = useRef<(OdometerHandle | null)[]>([])
  const col = useRef<HTMLDivElement>(null)

  useDirector((t) => {
    const s = sceneOf(t, 'about')
    // whole column: fast fade on exit so sections never overlap
    if (col.current) {
      const o = Math.max(0, 1 - s.exit * 2.4)
      col.current.style.opacity = o.toFixed(3)
      col.current.style.pointerEvents = o < 0.4 ? 'none' : ''
    }
    reveal(label.current, s, 0.2, 24)

    const n = words.length
    const r = clamp(s.enter * 0.12 + s.p / 0.42)
    wEls.current.forEach((el, j) => {
      if (!el) return
      const local = clamp((r * (n + 4) - j) / 4)
      const e = easeOutCubic(local)
      el.style.opacity = (0.1 + 0.9 * e).toFixed(3)
      el.style.transform = `translate3d(0,${((1 - e) * 0.25).toFixed(3)}em,0)`
      el.style.filter = `blur(${((1 - e) * 4).toFixed(2)}px)`
    })

    const q = clamp((s.p - 0.22) / 0.5)
    cards.current.forEach((c, i) => {
      reveal(c, s, 0.35 + i * 0.12, 60)
      odos.current[i]?.set(easeOutCubic(q))
    })
  })

  return (
    <section className="scene" data-scene="about" style={{ height: '280vh' }}>
      <div className="sticky">
        <div className="inner">
          <div className="about-col" ref={col}>
            <div>
              <div className="label" ref={label}>
                <i>(01)</i> — About me
              </div>
              <p className="manifesto">
                {words.map((w, j) => (
                  <span key={j} className={'mw' + (w.red ? ' red' : '')} ref={(el) => (wEls.current[j] = el)}>
                    {w.w}
                  </span>
                ))}
              </p>
            </div>
            <div className="stats">
              {DATA.stats.map((st, i) => (
                <div key={i} className="stat-wrap" ref={(el) => (cards.current[i] = el)}>
                  <TiltCard className="stat">
                    <div className="stat-num">
                      <Odometer value={st.value} ref={(h: OdometerHandle | null) => (odos.current[i] = h)} />
                    </div>
                    <div className="stat-label">{st.label}</div>
                    <div className="stat-sub mono">{st.sub}</div>
                  </TiltCard>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
