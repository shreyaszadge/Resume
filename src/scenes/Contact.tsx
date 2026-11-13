import { useRef } from 'react'
import { DATA } from '../data'
import { clamp, easeOutCubic, director } from '../engine/director'
import { reveal, sceneOf, useDirector } from '../engine/hooks'

/** BACK layer: red background revealed by the same blade maths as the canvas + giant LET'S TALK. */
export function ContactBack() {
  const bg = useRef<HTMLDivElement>(null)
  const big = useRef<HTMLDivElement>(null)
  useDirector((t) => {
    const H = t.vh
    const W = t.vw
    const skew = 0.2 * H
    const ct = t.active === 6 ? t.t : 0
    if (bg.current) {
      if (ct <= 0.0005) bg.current.style.visibility = 'hidden'
      else {
        const e = -skew + (W + 2 * skew) * ct
        bg.current.style.visibility = 'visible'
        bg.current.style.clipPath = `polygon(0 0, ${(e + skew).toFixed(1)}px 0, ${(e - skew).toFixed(1)}px 100%, 0 100%)`
      }
    }
    if (big.current) {
      const e = easeOutCubic(clamp((ct - 0.45) / 0.55))
      big.current.style.opacity = e.toFixed(3)
      big.current.style.transform = `translate3d(-50%,${((1 - e) * 8).toFixed(2)}vh,0)`
    }
  })
  return (
    <>
      <div className="contact-bg" ref={bg} />
      <div className="contact-big" ref={big} aria-hidden="true">
        <span>LET'S</span>
        <span>TALK</span>
      </div>
    </>
  )
}

export function Contact() {
  const mail = useRef<HTMLDivElement>(null)
  const links = useRef<HTMLDivElement>(null)
  const foot = useRef<HTMLDivElement>(null)
  const [local, domain] = DATA.email.split('@')

  useDirector((t) => {
    const s = sceneOf(t, 'contact')
    // content appears only once the blade has passed
    const fake = { ...s, enter: clamp((t.active === 6 ? t.t : 0) * 1.0 - 0.35) / 0.65 }
    reveal(mail.current, fake, 0.0, 40)
    reveal(links.current, fake, 0.12, 40)
    reveal(foot.current, fake, 0.24, 20)
  })

  return (
    <section className="scene" data-scene="contact" style={{ height: '240vh' }}>
      <div className="sticky">
        <div className="inner">
          <div className="contact-mail" ref={mail}>
            <a href={`mailto:${DATA.email}`} data-cursor="Write" className="mail-link">
              <span>{local}</span>
              <span className="dom">@{domain}</span>
            </a>
          </div>
          <div className="contact-links" ref={links}>
            {[
              ['GitHub', DATA.github, 'Open'],
              ['LinkedIn', DATA.linkedin, 'Open'],
              ['Résumé', DATA.resume, 'PDF'],
            ].map(([n, h, c]) => (
              <a key={n} href={h} target="_blank" rel="noreferrer" data-cursor={c} className="clink">
                <span>{n}</span>
                <i>↗</i>
              </a>
            ))}
          </div>
          <div className="contact-foot mono" ref={foot}>
            <span>
              © {new Date().getFullYear()} {DATA.fullName}
            </span>
            <button onClick={() => director.scrollTo('hero', 2.8)} data-cursor="Top">
              Back to top ↑
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
