import { useRef } from 'react'
import { DATA } from '../data'
import { clamp, easeInOut, easeOutCubic } from '../engine/director'
import { backVis, reveal, sceneOf, useDirector } from '../engine/hooks'

export function WorkBack() {
  const wrap = useRef<HTMLDivElement>(null)
  const plane = useRef<HTMLDivElement>(null)
  useDirector((t) => {
    const s = sceneOf(t, 'work')
    backVis(wrap.current, s)
    // grid lines travel toward the viewer with scroll
    if (plane.current) plane.current.style.backgroundPosition = `0 ${(s.p * 1400).toFixed(1)}px, 0 ${(s.p * 1400).toFixed(1)}px`
  })
  return (
    <div className="work-floor" ref={wrap}>
      <div className="work-plane" ref={plane} />
    </div>
  )
}

function Visual({ kind }: { kind: string }) {
  if (kind === 'gauge')
    return (
      <div className="vis vis-gauge">
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="46" className="g-track" />
          <circle cx="60" cy="60" r="46" className="g-arc" pathLength={100} />
        </svg>
        <div className="g-text">
          <b>86%</b>
          <span className="mono">In stock</span>
        </div>
      </div>
    )
  if (kind === 'heat')
    return (
      <div className="vis vis-heat">
        {Array.from({ length: 35 }).map((_, i) => (
          <i key={i} style={{ animationDelay: `${((i * 37) % 17) * 0.13}s` }} />
        ))}
      </div>
    )
  return (
    <div className="vis vis-chat">
      <div className="bub l">Order #2041 placed</div>
      <div className="bub r">Payment verified ✓</div>
      <div className="bub l">Packed &amp; shipped</div>
      <div className="bub r">Out for delivery</div>
    </div>
  )
}

export function Work() {
  const N = DATA.projects.length
  const head = useRef<HTMLDivElement>(null)
  const deck = useRef<HTMLDivElement>(null)
  const cards = useRef<(HTMLDivElement | null)[]>([])
  const counter = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLElement>(null)
  const lastIdx = useRef(-1)

  useDirector((t) => {
    const s = sceneOf(t, 'work')
    const vh = t.vh
    const fadeOut = Math.max(0, 1 - s.exit * 2.4)
    reveal(head.current, s, 0, 24)

    // deck rises from below with rotateY −25° on enter
    if (deck.current) {
      const e = easeOutCubic(s.enter)
      deck.current.style.opacity = (e * fadeOut).toFixed(3)
      deck.current.style.transform = `translate3d(0,${((1 - e) * 55).toFixed(2)}vh,0) rotateY(${(-25 * (1 - e)).toFixed(2)}deg)`
      deck.current.style.pointerEvents = e * fadeOut < 0.4 ? 'none' : ''
    }

    // dwell on each card: q = i + easeInOut(frac)
    const v = s.p * N
    const a = Math.min(N - 1, Math.floor(v))
    const frac = a === N - 1 ? 0 : clamp((v - a - 0.28) / 0.72)
    const q = a + easeInOut(frac)

    cards.current.forEach((c, i) => {
      if (!c) return
      const d = q - i
      let z: number, y: number, rx: number, o: number
      if (d <= 0) {
        // upcoming: sit behind, a little higher, fading
        z = d * 300
        y = d * 3.2 * vh * 0.01
        rx = 0
        o = clamp(1 + d * 0.55) * (d < -2.2 ? 0 : 1)
      } else {
        // leaving: fly toward the viewer and up, tilting back
        z = d * 900
        y = -12 * d * vh * 0.01
        rx = 28 * d
        o = clamp(1 - 1.8 * d)
      }
      c.style.opacity = o.toFixed(3)
      c.style.visibility = o < 0.01 ? 'hidden' : 'visible'
      c.style.zIndex = String(100 - Math.round(Math.abs(d) * 10) + (d > 0 ? 50 : 0))
      c.style.transform = `translate3d(0,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg)`
    })

    const idx = Math.min(N - 1, Math.round(q))
    if (idx !== lastIdx.current) {
      lastIdx.current = idx
      if (counter.current) counter.current.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0')
    }
    if (bar.current) bar.current.style.transform = `scaleX(${clamp(s.p * 1.05).toFixed(3)})`
  })

  return (
    <section className="scene" data-scene="work" style={{ height: '460vh' }}>
      <div className="sticky">
        <div className="inner">
          <div className="work-head" ref={head}>
            <div className="label">
              <i>(02)</i> — Work
            </div>
            <div className="work-count">
              <span className="num" ref={counter}>
                01 / 03
              </span>
              <i className="bar">
                <b ref={bar} />
              </i>
            </div>
          </div>
          <div className="deck-wrap">
            <div className="deck" ref={deck}>
              {DATA.projects.map((p, i) => (
                <div className="pcard" key={p.n} ref={(el) => (cards.current[i] = el)}>
                  <div className="pc-left">
                    <div>
                      <div className="mono pc-cat">
                        <i>{p.n}</i> — {p.cat}
                      </div>
                      <h3 className="pc-title">{p.title}</h3>
                      <p className="pc-desc">{p.desc}</p>
                      <div className="chips">
                        {p.chips.map((c) => (
                          <span key={c}>{c}</span>
                        ))}
                      </div>
                    </div>
                    <a className="pc-link" href={DATA.github} target="_blank" rel="noreferrer" data-cursor="Open">
                      View on GitHub ↗
                    </a>
                  </div>
                  <div className="pc-right">
                    <Visual kind={p.visual} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
