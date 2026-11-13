# Shreyas Zadge — scroll-driven portfolio

Vite + React + TypeScript. Canvas video-frame engine, CSS 3D only (no three.js).

```bash
npm install
npm run dev      # development
npm run build    # typecheck + production build (base './')
```

* All copy lives in `src/data.ts` (taken from the résumé).
* Scroll engine: `src/engine/director.ts` · frame loader: `src/engine/frames.ts`.
* Frames: `public/frames/{lg,sm}/fNNN.webp` + `manifest.json` (4 pose segments of one continuous clip).
* `public/resume.pdf` is the résumé.
