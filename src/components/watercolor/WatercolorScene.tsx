import { useEffect, useRef } from 'react'
import { grain, makeRng } from './engine'

export type PaintScene = (ctx: CanvasRenderingContext2D, w: number, h: number, rng: () => number) => void

interface Props {
  paint: PaintScene
  width: number
  height: number
  seed: number
  className?: string
  /** Décrit la peinture pour un lecteur d'écran ; omis = purement décoratif. */
  alt?: string
}

/**
 * Rend une scène aquarelle dans un canvas, une seule fois au montage.
 *
 * Le canvas plutôt que le SVG : une scène fait plusieurs milliers de
 * polygones translucides, ce qui étoufferait le DOM. Ici c'est un seul
 * élément, peint une fois, jamais recalculé — donc aucun coût pendant le jeu
 * (règle de coût de rendu de la skill `aquarelle`).
 */
export function WatercolorScene({ paint, width, height, seed, className, alt }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    // La résolution se règle sur la taille RÉELLEMENT affichée, pas sur les
    // dimensions demandées. Un tableau de 1500x1150 posé dans un cadre de
    // 390px de large peignait 3000x2300 pixels sur téléphone — sept fois trop,
    // et 1,4 s de fil principal bloqué au chargement (cartes non cliquables).
    // On ne monte jamais au-dessus de la résolution demandée : c'est un
    // plafond, pas un facteur d'agrandissement.
    const cadre = canvas.getBoundingClientRect()
    const affichage =
      cadre.width > 0 && cadre.height > 0
        ? // `max` et non `min` : le canvas peut être rogné (`object-fit: cover`),
          // auquel cas c'est la dimension qui déborde qui fixe la finesse utile.
          Math.min(1, Math.max(cadre.width / width, cadre.height / height))
        : 1
    const ratio = Math.min(window.devicePixelRatio || 1, 2) * affichage
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(ratio, ratio)
    const rng = makeRng(seed)
    ctx.globalCompositeOperation = 'multiply'
    paint(ctx, width, height, rng)
    // Le grain se pose en pixels réels, pas en pixels CSS : on annule l'échelle
    // écran sinon il est étiré et perd sa finesse.
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    grain(ctx, canvas.width, canvas.height, rng)
  }, [paint, width, height, seed])

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ width: '100%', height: 'auto', aspectRatio: `${width} / ${height}` }}
      role={alt ? 'img' : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
    />
  )
}
