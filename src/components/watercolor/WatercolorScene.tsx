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
  /**
   * Comment la peinture occupe la place qu'on lui donne.
   *
   * `largeur` (défaut) : elle prend toute la largeur disponible et garde
   * ses proportions — le cas d'une illustration dans le flux.
   *
   * `remplir` : elle s'étire pour couvrir son conteneur, proportions
   * comprises. Réservé aux fonds d'écran, où la déformation ne se voit pas
   * (une paroi de grotte n'a ni horizontale ni verticale de référence) et
   * où laisser un bord non couvert se verrait, lui, tout de suite.
   */
  fit?: 'largeur' | 'remplir'
}

/**
 * Rend une scène aquarelle dans un canvas, une seule fois au montage.
 *
 * Le canvas plutôt que le SVG : une scène fait plusieurs milliers de
 * polygones translucides, ce qui étoufferait le DOM. Ici c'est un seul
 * élément, peint une fois, jamais recalculé — donc aucun coût pendant le jeu
 * (règle de coût de rendu de la skill `aquarelle`).
 */
export function WatercolorScene({ paint, width, height, seed, className, alt, fit = 'largeur' }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = width * ratio
    canvas.height = height * ratio
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
      style={
        fit === 'remplir'
          ? { width: '100%', height: '100%', display: 'block' }
          : { width: '100%', height: 'auto', aspectRatio: `${width} / ${height}` }
      }
      role={alt ? 'img' : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
    />
  )
}
