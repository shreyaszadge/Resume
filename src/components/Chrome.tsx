import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import gsap from 'gsap'
import { director, SCENES, CONTACT, lerp } from '../engine/director'
import { useDirector } from '../engine/hooks'
import { DATA, NAV } from '../data'

/** Shared with App: frame-loading progress for the preloader. */
export const loadBus = { p: 0, done: false }

/* ───────────────────────── Preloader ───────────────────────── */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null)
  const top = useRef<HTMLDivElement>(null)
  const bot = useRef<HTMLDivElement>(null)
  const num = useRef<HTMLDivElement>(null)
  const l1 = useRef<HTMLDivElement>(null)
  const l2 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cur = 0
    let raf = 0
    let finished = false
    const t0 = performance.now()

    const finish = () => {
      finished = true
      const tl = gsap.timeline({ onComplete: () => root.current && (root.current.style.display = 'none') })
      tl.to([l1.current, l2.current], { yPercent: -140, opacity: 0, duration: 0.55, ease: 'expo.in' })
      tl.to(num.current, { opacity: 0, duration: 0.35 }, '<')
      tl.to(top.current, { yPercent: -100, duration: 1.2, ease: 'expo.inOut' }, '>-0.05')
      tl.to(bot.current, { yPercent: 100, duration: 1.2, ease: 'expo.inOut' }, '<')
      tl.add(() => {
        window.dispatchEvent(new Event('intro'))
        director.start()
      }, '<+0.35')
    }

    const step = () => {
      const target = loadBus.p * 100
      cur = lerp(cur, target, 0.1)
      if (target >= 99.9 && cur > 99.4) cur = 100
      if (num.current) num.current.textContent = String(Math.round(cur)).padStart(3, '0')
      const minTime = performance.now() - t0 > 1500
      if (!finished && cur >= 100 && loadBus.done && minTime) finish()
      if (!finished) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="pre" ref={root}>
      <div className="pre-half pre-top" ref={top} />
      <div className="pre-half pre-bot" ref={bot} />
      <div className="pre-center">
        <div className="pre-line mono" ref={l1}>
          (00) — Loading portfolio
        </div>
        <div className="pre-num" ref={num}>
          000
        </div>
        <div className="pre-line mono" ref={l2}>
          {DATA.fullName} · Junior Java Developer
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── HUD ───────────────────────── */
export function HUD() {
  const root = useRef<HTMLElement>(null)
  const items = useRef<(HTMLButtonElement | null)[]>([])
  const pct = useRef<HTMLSpanElement>(null)
  const fill = useRef<HTMLElement>(null)
  const last = useRef({ active: -1, red: false })

  useDirector((t) => {
    if (last.current.active !== t.active) {
      last.current.active = t.active
      items.current.forEach((el, i) => el && el.classList.toggle('on', i === t.active))
    }
    const red = t.active === CONTACT && t.t > 0.6 // only after the blade has passed
    if (last.current.red !== red) {
      last.current.red = red
      root.current?.classList.toggle('on-red', red)
    }
    if (pct.current) pct.current.textContent = String(Math.round(t.progress * 100)).padStart(2, '0') + '%'
    if (fill.current) fill.current.style.transform = `scaleY(${t.progress.toFixed(4)})`
  })

  return (
    <header className="hud" ref={root}>
      <button className="logo" onClick={() => director.scrollTo('hero')} data-cursor="Top">
        {DATA.name.split(' ')[0]}
        <span>®</span>
      </button>
      <nav className="pill">
        {NAV.map((n, i) => (
          <button key={n.id} ref={(el) => (items.current[i] = el)} onClick={() => director.scrollTo(n.id)}>
            {SCENES[i].label}
          </button>
        ))}
      </nav>
      <div className="prog">
        <span className="mono" ref={pct}>
          00%
        </span>
        <i className="rail">
          <b ref={fill} />
        </i>
      </div>
    </header>
  )
}

/* ───────────────────────── Cursor (desktop only) ───────────────────────── */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    document.documentElement.classList.add('has-cursor')
    let mx = innerWidth / 2,
      my = innerHeight / 2,
      rx = mx,
      ry = my,
      size = 42,
      targetSize = 42
    const move = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      const hit = (e.target as HTMLElement | null)?.closest?.('[data-cursor]') as HTMLElement | null
      if (hit) {
        targetSize = 92
        ring.current!.classList.add('big')
        label.current!.textContent = hit.dataset.cursor || ''
      } else {
        targetSize = 42
        ring.current!.classList.remove('big')
      }
    }
    addEventListener('mousemove', move)
    const tick = () => {
      rx = lerp(rx, mx, 0.16)
      ry = lerp(ry, my, 0.16)
      size = lerp(size, targetSize, 0.18)
      if (dot.current) dot.current.style.transform = `translate3d(${mx - 4}px,${my - 4}px,0)`
      if (ring.current) {
        ring.current.style.width = ring.current.style.height = size.toFixed(1) + 'px'
        ring.current.style.transform = `translate3d(${rx - size / 2}px,${ry - size / 2}px,0)`
      }
    }
    gsap.ticker.add(tick)
    return () => {
      removeEventListener('mousemove', move)
      gsap.ticker.remove(tick)
    }
  }, [])

  return (
    <>
      <div className="cur-ring" ref={ring}>
        <span ref={label} />
      </div>
      <div className="cur-dot" ref={dot} />
    </>
  )
}

/* ───────────────────────── Button ───────────────────────── */
export function Button({
  children,
  href,
  variant = 'red',
  cursor,
  onClick,
  newTab,
}: {
  children: ReactNode
  href?: string
  variant?: 'red' | 'line'
  cursor?: string
  onClick?: () => void
  newTab?: boolean
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    const el = ref.current!
    const xTo = gsap.quickTo(el, 'x', { duration: 1, ease: 'elastic.out(1, 0.35)' })
    const yTo = gsap.quickTo(el, 'y', { duration: 1, ease: 'elastic.out(1, 0.35)' })
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * 0.35)
      yTo((e.clientY - (r.top + r.height / 2)) * 0.35)
    }
    const leave = () => {
      xTo(0)
      yTo(0)
    }
    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)
    return () => {
      el.removeEventListener('mousemove', move)
      el.removeEventListener('mouseleave', leave)
    }
  }, [])
  const text = typeof children === 'string' ? children : ''
  return (
    <a
      ref={ref}
      className={'btn btn-' + variant}
      href={href || '#'}
      data-cursor={cursor}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noreferrer' : undefined}
      onClick={(e: { preventDefault(): void }) => {
        if (onClick) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <span className="btn-fill" />
      <span className="btn-roll">
        <span>{text || children}</span>
        <span aria-hidden="true">{text || children}</span>
      </span>
    </a>
  )
}
