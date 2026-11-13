import { useRef } from 'react'
import { DATA } from '../data'
import { clamp, easeOutCubic, lerp } from '../engine/director'
import { backVis, reveal, sceneOf, useDirector } from '../engine/hooks'
import { Odometer } from '../components/Odometer'
import type { OdometerHandle } from '../components/Odometer'

export function JourneyBack() {
  const el = useRef<HTMLDivElement>(null)
  const odo = useRef<OdometerHandle>(null)
  useDirector((t) => {
    const s = sceneOf(t, 'journey')
    backVis(el.current, s)
    // year rolls start → graduation/latest year with scroll
    const v = lerp(DATA.journey.startYear, DATA.journey.endYear, easeOutCubic(clamp(s.p * 1.25)))
    odo.current?.setNumber(v)
  })
  return (
    <div className="journey-year" ref={el} aria-hidden="true">
      <Odometer value={String(DATA.journey.startYear)} ref={odo} className="outline" />
    </div>
  )
}

export function Journey() {
  const col = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLDivElement>(null)
  const title = useRef<HTMLDivElement>(null)
  const line = useRef<SVGPathElement>(null)
  const rows = useRef<(HTMLDivElement | null)[]>([])
  const items = DATA.journey.items

  useDirector((t) => {
    const s = sceneOf(t, 'journey')
    if (col.current) {
      const o = Math.max(0, 1 - s.exit * 2.4)
      col.current.style.opacity = o.toFixed(3)
      col.current.style.pointerEvents = o < 0.4 ? 'none' : ''
    }
    reveal(label.current, s, 0.1, 24)
    reveal(title.current, s, 0.2, 40)

    // red line draws from the bottom up
    const draw = clamp((s.p - 0.04) / 0.66)
    if (line.current) line.current.style.strokeDashoffset = String((1 - draw).toFixed(4))

    // oldest (bottom) reveals first
    rows.current.forEach((row, i) => {
      if (!row) return
      const order = items.length - 1 - i // 0 = oldest
      const start = 0.06 + order * 0.24
      const e = easeOutCubic(clamp((s.p + s.enter * 0.1 - start) / 0.2))
      row.style.opacity = e.toFixed(3)
      row.style.transform = `perspective(900px) translate3d(0,${((1 - e) * 60).toFixed(1)}px,0) rotateY(${(-55 * (1 - e)).toFixed(2)}deg)`
      // node fills when the red line has reached it
      const reach = (order + 0.5) / items.length
      row.classList.toggle('on', draw >= reach * 0.92)
    })
  })

  return (
    <section className="scene" data-scene="journey" style={{ height: '240vh' }}>
      <div className="sticky">
        <div className="inner">
          <div className="journey-col" ref={col}>
            <div className="label" ref={label}>
              <i>(03)</i> — Journey
            </div>
            <h2 className="h2" ref={title}>
              LEARNING
              <br />
              <span className="red">OUT LOUD.</span>
            </h2>
            <div className="timeline">
              <i className="tl-track" />
              <svg className="tl-line" viewBox="0 0 2 100" preserveAspectRatio="none">
                <path
                  ref={line}
                  d="M1 100 V0"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              {items.map((it, i) => (
                <div className="tl-item" key={i} ref={(el) => (rows.current[i] = el)}>
                  <span className="tl-node" />
                  <div className="tl-year mono">{it.year}</div>
                  <div className="tl-title">{it.title}</div>
                  <div className="tl-org">{it.org}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
