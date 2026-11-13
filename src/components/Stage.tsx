import { useEffect, useRef } from 'react'
import { director, lerp, CONTACT } from '../engine/director'
import type { Layer, Tick } from '../engine/director'
import { frames } from '../engine/frames'

const RED = '#ff1f1f'

/** Fixed full-viewport canvas that paints the person. Only redraws when its input key changes. */
export function Stage() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current!
    const ctx = cv.getContext('2d')!
    let W = innerWidth
    let H = innerHeight
    let dpr = 1
    let lastKey = ''
    let mx = 0,
      my = 0,
      px = 0,
      py = 0

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      W = innerWidth
      H = innerHeight
      cv.width = Math.round(W * dpr)
      cv.height = Math.round(H * dpr)
      cv.style.width = W + 'px'
      cv.style.height = H + 'px'
      lastKey = ''
    }
    resize()
    addEventListener('resize', resize)
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / W - 0.5) * 2
      my = (e.clientY / H - 0.5) * 2
    }
    addEventListener('mousemove', onMove)

    const drawFrameIdx = (idx: number, L: Layer, alpha: number) => {
      const m = frames.manifest
      if (!m) return
      const img = frames.get(idx)
      if (!img) return
      const shot = m.shots[frames.shotOf(idx)]
      const [bx, by, bw, bh] = shot.box
      const mobile = W < 820
      const scale = mobile ? Math.min((H * 0.74) / 900, (W * 1.05) / bw) : (H * L.k) / 900
      const x = mobile ? 0.5 : L.x
      const offY = H - 900 * scale
      const offX = x * W - shot.cx * 1600 * scale
      ctx.globalAlpha = alpha
      ctx.drawImage(img, offX + bx * scale + px, offY + by * scale + py, bw * scale, bh * scale)
      ctx.globalAlpha = 1
    }

    const drawLayer = (L: Layer) => {
      const m = frames.manifest
      if (!m) return
      const f = Math.max(0, Math.min(m.count - 1, L.frame))
      const i = Math.floor(f)
      const frac = f - i
      drawFrameIdx(i, L, 1)
      // fractional frame: next frame on top at alpha = frac (same shot only) → silky motion
      if (frac > 0.002 && i + 1 < m.count && frames.shotOf(i + 1) === frames.shotOf(i)) drawFrameIdx(i + 1, L, frac)
    }

    const poly = (pts: number[][]) => {
      ctx.beginPath()
      ctx.moveTo(pts[0][0], pts[0][1])
      for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1])
      ctx.closePath()
    }

    const draw = (tk: Tick) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      if (!frames.manifest) return
      const { a, b, t } = tk
      if (!b) {
        drawLayer(a)
        return
      }
      const skew = 0.2 * H
      const e = -skew + (W + 2 * skew) * t

      // outgoing shot: right of the blade
      ctx.save()
      poly([[e + skew, 0], [W + 200, 0], [W + 200, H], [e - skew, H]])
      ctx.clip()
      ctx.globalAlpha = 1 - 0.35 * t
      ctx.translate(60 * t, 0)
      drawLayer(b)
      ctx.restore()

      // incoming shot: left of the blade
      ctx.save()
      poly([[-200, 0], [e + skew, 0], [e - skew, H], [-200, H]])
      ctx.clip()
      ctx.translate(-60 * (1 - t), 0)
      drawLayer(a)
      ctx.restore()

      // blade
      if (t > 0.001 && t < 0.999) {
        const col = tk.active === CONTACT ? '#ffffff' : RED
        // 90px trail
        const g = ctx.createLinearGradient(e, 0, e - 90, 0)
        g.addColorStop(0, tk.active === CONTACT ? 'rgba(255,255,255,0.35)' : 'rgba(255,31,31,0.35)')
        g.addColorStop(1, tk.active === CONTACT ? 'rgba(255,255,255,0)' : 'rgba(255,31,31,0)')
        ctx.fillStyle = g
        poly([[e + skew, 0], [e + skew - 90, 0], [e - skew - 90, H], [e - skew, H]])
        ctx.fill()
        // line + 24px glow
        ctx.save()
        ctx.strokeStyle = col
        ctx.lineWidth = 3
        ctx.shadowColor = col
        ctx.shadowBlur = 24
        ctx.beginPath()
        ctx.moveTo(e + skew, 0)
        ctx.lineTo(e - skew, H)
        ctx.stroke()
        ctx.restore()
      }
    }

    const off = director.subscribe((tk) => {
      px = lerp(px, -mx * 14, 0.06)
      py = lerp(py, -my * 14, 0.06)
      const key = [
        frames.loaded,
        W,
        H,
        tk.a.frame.toFixed(2),
        tk.a.x,
        tk.a.k,
        tk.b ? tk.b.frame.toFixed(2) : '-',
        tk.t.toFixed(3),
        px.toFixed(1),
        py.toFixed(1),
      ].join('|')
      if (key === lastKey) return
      lastKey = key
      draw(tk)
    })

    return () => {
      off()
      removeEventListener('resize', resize)
      removeEventListener('mousemove', onMove)
    }
  }, [])

  return <canvas ref={ref} className="stage" />
}
