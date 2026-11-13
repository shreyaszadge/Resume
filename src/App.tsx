import { useEffect } from 'react'
import { director } from './engine/director'
import { loadFrames } from './engine/frames'
import { Stage } from './components/Stage'
import { Cursor, HUD, Preloader, loadBus } from './components/Chrome'
import { Hero, HeroBack } from './scenes/Hero'
import { About, AboutBack } from './scenes/About'
import { Work, WorkBack } from './scenes/Work'
import { Journey, JourneyBack } from './scenes/Journey'
import { Skills, SkillsBack, SkillsFront } from './scenes/Skills'
import { Awards } from './scenes/Awards'
import { Contact, ContactBack } from './scenes/Contact'

export function App() {
  useEffect(() => {
    director.init()
    loadFrames((p) => (loadBus.p = p)).then(
      () => {
        loadBus.p = 1
        loadBus.done = true
      },
      () => {
        loadBus.p = 1
        loadBus.done = true
      },
    )
  }, [])

  return (
    <>
      {/* z0: everything that sits BEHIND the person (sticky creates stacking contexts, so these live here) */}
      <div className="layer-back">
        <ContactBack />
        <AboutBack />
        <WorkBack />
        <JourneyBack />
        <SkillsBack />
        <HeroBack />
      </div>
      {/* z1: the person */}
      <Stage />
      {/* z2: front half of the skills orbit */}
      <div className="layer-front">
        <SkillsFront />
      </div>
      {/* z3: content */}
      <main>
        <Hero />
        <About />
        <Work />
        <Journey />
        <Skills />
        <Awards />
        <Contact />
      </main>
      {/* z50+: HUD, cursor, preloader */}
      <HUD />
      <Cursor />
      <Preloader />
    </>
  )
}
