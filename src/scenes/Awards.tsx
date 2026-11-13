import { useRef } from 'react'
import { DATA } from '../data'
import { clamp, easeOutCubic } from '../engine/director'
import { reveal, sceneOf, useDirector } from '../engine/hooks'

const N = DATA.cards.length

export function Awards() {
  const col = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLDivElement>(null)
  const cnt = useRef<(HTMLDivElement | null)[]>([])
  const nums = useRef<(HTMLSpanElement | null)[]>([])
  const cyl = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useDirector((t) => {
    const s = sceneOf(t, 'awards')
    const mobile = t.vw < 820
    if (col.current) {
      const o = Math.max(0, 1 - s.exit * 2.4)
      col.current.style.opacity = o.toFixed(3)
      col.current.style.pointerEvents = o < 0.4 ? 'none' : ''
    }
    reveal(label.current, s, 0.05, 24)

    // flip-in counters (rotateX −100° → 0), staggered; numbers count up
    cnt.current.forEach((c, i) => {
      if (!c) return
      const e = easeOutCubic(clamp((s.enter * 0.7 + s.p * 2.2 - 0.12 - i * 0.14) / 0.45))
      c.style.opacity = Math.min(1, e * 1.6).toFixed(3)
      c.style.transform = `perspective(900px) rotateX(${(-100 * (1 - e)).toFixed(2)}deg)`
      const d = DATA.counters[i]
      const el = nums.current[i]
      if (el) el.textContent = (d.n * e).toFixed(d.dec) + d.suffix
    })

    if (ring.current) {
      const e = easeOutCubic(clamp(s.enter * 1.1))
      ring.current.style.opacity = e.toFixed(3)
    }
    if (cyl.current) {
      const base = 380
      cyl.current.style.transform = `translateZ(${-base}px) rotateX(-14deg) rotateY(${(-s.p * (360 - 360 / N)).toFixed(2)}deg)`
    }
  })

  const R = 380
  return (
    <section className="scene" data-scene="awards" style={{ height: '320vh' }}>
      <div className="sticky">
        <div className="inner">
          <div className="awards-col" ref={col}>
            <div className="label" ref={label}>
              <i>(05)</i> — Training &amp; numbers
            </div>
            <div className="counters">
              {DATA.counters.map((c, i) => (
                <div key={i} className={'counter ' + (i % 2 === 0 ? 'c-red' : 'c-ink')} ref={(el) => (cnt.current[i] = el)}>
                  <span className="c-num" ref={(el) => (nums.current[i] = el)}>
                    0
                  </span>
                  <span className="c-label mono">{c.label}</span>
                </div>
              ))}
            </div>
            <div className="cyl-wrap" ref={ring}>
              <div className="cyl" ref={cyl}>
                {DATA.cards.map((c, i) => (
                  <div
                    className="cc"
                    key={i}
                    style={{ transform: `rotateY(${(360 / N) * i}deg) translateZ(${R}px)` }}
                  >
                    <div className={'cc-face cc-front' + (i % 3 === 2 ? ' red' : '')}>
                      <div className="cc-title">{c.title}</div>
                      <div className="cc-issuer mono">{c.issuer}</div>
                      <span className="cc-seal">✓</span>
                    </div>
                    <div className="cc-face cc-back" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
