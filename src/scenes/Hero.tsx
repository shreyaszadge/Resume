import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { DATA } from '../data'
import { clamp, director } from '../engine/director'
import { sceneOf, useDirector } from '../engine/hooks'
import { Button } from '../components/Chrome'

/** BACK layer: giant red first name behind the head, like a magazine cover. */
export function HeroBack() {
  const wrap = useRef<HTMLDivElement>(null)
  const outer = useRef<(HTMLSpanElement | null)[]>([])
  const inner = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const els = inner.current.filter(Boolean) as HTMLElement[]
    gsap.set(els, { yPercent: 115, rotateX: -80, transformPerspective: 800, transformOrigin: '50% 100%' })
    const on = () => gsap.to(els, { yPercent: 0, rotateX: 0, stagger: 0.07, duration: 1.6, ease: 'expo.out' })
    window.addEventListener('intro', on, { once: true })
    return () => window.removeEventListener('intro', on)
  }, [])

  useDirector((t) => {
    const s = sceneOf(t, 'hero')
    if (wrap.current) {
      const o = Math.max(0, 1 - s.exit * 2.4)
      wrap.current.style.opacity = o.toFixed(3)
      wrap.current.style.visibility = o < 0.005 ? 'hidden' : 'visible'
    }
    outer.current.forEach((el, i) => {
      if (el) el.style.transform = `translate3d(0,${((i % 2 ? 1 : -1) * s.p * 3.2).toFixed(2)}vh,0)`
    })
  })

  return (
    <div className="hero-name" ref={wrap} aria-hidden="true">
      {DATA.first.split('').map((c, i) => (
        <span className="hn-out" key={i} ref={(el) => (outer.current[i] = el)}>
          <span className="hn-mask">
            <span className="hn-in" ref={(el) => (inner.current[i] = el)}>
              {c}
            </span>
          </span>
        </span>
      ))}
    </div>
  )
}

export function Hero() {
  const copy = useRef<HTMLDivElement>(null)
  const hl = useRef<HTMLSpanElement>(null)
  const lines = useRef<(HTMLSpanElement | null)[]>([])
  const items = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const ls = lines.current.filter(Boolean) as HTMLElement[]
    const its = items.current.filter(Boolean) as HTMLElement[]
    gsap.set(ls, { yPercent: 112 })
    gsap.set(its, { opacity: 0, y: 28 })
    const on = () => {
      gsap.to(ls, { yPercent: 0, stagger: 0.12, duration: 1.4, ease: 'expo.out', delay: 0.15 })
      gsap.to(its, { opacity: 1, y: 0, stagger: 0.12, duration: 1.2, ease: 'expo.out', delay: 0.5 })
    }
    window.addEventListener('intro', on, { once: true })
    return () => window.removeEventListener('intro', on)
  }, [])

  useDirector((t) => {
    const s = sceneOf(t, 'hero')
    if (copy.current) {
      const o = Math.max(0, 1 - s.exit * 2.4)
      copy.current.style.opacity = o.toFixed(3)
      copy.current.style.transform = `translate3d(0,${(-s.exit * 6).toFixed(2)}vh,0)`
      copy.current.style.pointerEvents = o < 0.4 ? 'none' : ''
    }
    // red highlighter grows with scroll — as if the person "reads" the copy
    if (hl.current) hl.current.style.backgroundSize = `${(clamp(s.p * 1.7) * 100).toFixed(1)}% 0.42em`
  })

  return (
    <section className="scene" data-scene="hero" style={{ height: '230vh' }}>
      <div className="sticky">
        <div className="inner">
          <div className="hero-copy" ref={copy}>
            <p className="hi" ref={(el) => (items.current[0] = el)}>
              Hi, I'm <b>{DATA.name}</b> —
            </p>
            <h1 className="hero-title">
              <span className="mask">
                <span ref={(el) => (lines.current[0] = el)}>{DATA.role[0]}</span>
              </span>
              <span className="mask red">
                <span ref={(el) => (lines.current[1] = el)}>{DATA.role[1]}</span>
              </span>
            </h1>
            <p className="hero-desc" ref={(el) => (items.current[1] = el)}>
              <span className="hl" ref={hl}>
                {DATA.tagline}
              </span>
            </p>
            <div className="btn-row" ref={(el) => (items.current[2] = el)}>
              <Button variant="red" cursor="Go" onClick={() => director.scrollTo('work')}>
                See my work ↘
              </Button>
              <Button variant="line" cursor="PDF" href={DATA.resume} newTab>
                Download résumé
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
