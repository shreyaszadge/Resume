import { useRef } from 'react'
import type { ReactNode } from 'react'

/** Glass card that 3D-tilts toward the cursor (±14°) with a moving radial glare. */
export function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const el = useRef<HTMLDivElement>(null)
  const glare = useRef<HTMLDivElement>(null)

  const move = (e: React.MouseEvent) => {
    const r = el.current!.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width
    const ny = (e.clientY - r.top) / r.height
    el.current!.style.transition = 'transform .08s linear'
    el.current!.style.transform = `perspective(900px) rotateX(${((0.5 - ny) * 28).toFixed(2)}deg) rotateY(${((nx - 0.5) * 28).toFixed(2)}deg) translateZ(0)`
    glare.current!.style.opacity = '1'
    glare.current!.style.background = `radial-gradient(260px circle at ${nx * 100}% ${ny * 100}%, rgba(255,255,255,.85), rgba(255,255,255,0) 60%)`
  }
  const leave = () => {
    el.current!.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1)'
    el.current!.style.transform = 'perspective(900px) rotateX(0) rotateY(0)'
    glare.current!.style.opacity = '0'
  }
  return (
    <div className={'glass tilt ' + className} ref={el} onMouseMove={move} onMouseLeave={leave}>
      <div className="glare" ref={glare} />
      {children}
    </div>
  )
}
