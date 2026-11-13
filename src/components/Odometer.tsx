import { forwardRef, useImperativeHandle, useRef } from 'react'
import { smoothstep, clamp } from '../engine/director'

export interface OdometerHandle {
  /** stat mode: q 0→1 rolls toward the target text; the lowest digit snaps with smoothstep .55–1 */
  set: (q: number) => void
  /** continuous mode: roll to an arbitrary number (year counters) */
  setNumber: (v: number) => void
}

/** Mechanical odometer: each digit is a column of 0–9,0 that is translated in em units. */
export const Odometer = forwardRef<OdometerHandle, { value: string; className?: string }>(function Odometer(
  { value, className },
  ref,
) {
  const cols = useRef<(HTMLSpanElement | null)[]>([])
  const chars = value.split('')
  const digitIdx = chars.map((c, i) => (/\d/.test(c) ? i : -1)).filter((i) => i >= 0)
  const lastDigit = digitIdx[digitIdx.length - 1]

  useImperativeHandle(ref, () => ({
    set(q: number) {
      q = clamp(q)
      chars.forEach((c, i) => {
        const el = cols.current[i]
        if (!el || !/\d/.test(c)) return
        const target = +c
        let pos: number
        if (i === lastDigit) pos = (target === 0 ? 10 : target) * smoothstep(0.55, 1, q)
        else pos = target * clamp(q / 0.55)
        el.style.transform = `translate3d(0,${(-pos).toFixed(3)}em,0)`
      })
    },
    setNumber(v: number) {
      const n = digitIdx.length
      digitIdx.forEach((ci, k) => {
        const el = cols.current[ci]
        if (!el) return
        const place = n - 1 - k // 0 = ones
        const whole = Math.floor(v / Math.pow(10, place)) % 10
        const low = place === 0 ? 0 : (v / Math.pow(10, place - 1)) % 10
        const carry = place === 0 ? v - Math.floor(v) : Math.max(0, low - 9)
        el.style.transform = `translate3d(0,${(-(whole + carry)).toFixed(3)}em,0)`
      })
    },
  }))

  return (
    <span className={'odo ' + (className || '')} aria-label={value}>
      {chars.map((c, i) =>
        /\d/.test(c) ? (
          <span className="odo-digit" key={i}>
            <span className="odo-col" ref={(el) => (cols.current[i] = el)}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, j) => (
                <span key={j}>{d}</span>
              ))}
            </span>
          </span>
        ) : (
          <span className="odo-sep" key={i}>
            {c}
          </span>
        ),
      )}
    </span>
  )
})
