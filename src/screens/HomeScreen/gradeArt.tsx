import type { ReactNode } from 'react'
import type { GradeId } from '../../types/content'

/**
 * Un petit motif peint par niveau scolaire, en progression : de l'outil le
 * plus simple (un crayon, au CP) au diplôme (3e). Purement décoratif — vit
 * ici plutôt que dans src/content/ parce que ce n'est pas une notion
 * pédagogique, seulement l'habillage visuel de l'accueil.
 *
 * Chaque motif dessine dans un viewBox 0 0 100 100, en traits à main levée
 * (voir la skill aquarelle : jamais de ligne droite parfaite).
 */
export const GRADE_ART: Record<GradeId, ReactNode> = {
  cp: (
    <>
      <path
        d="M32,72 Q46,52 61,30"
        fill="none"
        stroke="var(--encre)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M61,30 L71,19 L67,33 Z" fill="var(--encre)" />
      <circle cx="30" cy="73" r="7" fill="var(--_accent)" stroke="var(--encre)" strokeWidth="2" />
    </>
  ),
  ce1: (
    <>
      <path
        d="M50,26 C32,19 21,28 21,63 C33,58 46,60 50,71 Z"
        fill="var(--papier)"
        stroke="var(--encre)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M50,26 C68,19 79,28 79,63 C67,58 54,60 50,71 Z"
        fill="var(--papier)"
        stroke="var(--encre)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M50,27 L50,70" stroke="var(--encre)" strokeWidth="2" />
    </>
  ),
  ce2: (
    <>
      <rect
        x="18"
        y="42"
        width="64"
        height="16"
        rx="3"
        fill="var(--_accent)"
        opacity="0.5"
        stroke="var(--encre)"
        strokeWidth="3"
        transform="rotate(-4 50 50)"
      />
      <g transform="rotate(-4 50 50)" stroke="var(--encre)" strokeWidth="2" strokeLinecap="round">
        <line x1="28" y1="42" x2="28" y2="52" />
        <line x1="40" y1="42" x2="40" y2="52" />
        <line x1="52" y1="42" x2="52" y2="52" />
        <line x1="64" y1="42" x2="64" y2="52" />
      </g>
    </>
  ),
  cm1: (
    <>
      <circle cx="50" cy="50" r="27" fill="var(--_accent)" opacity="0.35" />
      <circle cx="50" cy="50" r="27" fill="none" stroke="var(--encre)" strokeWidth="3" />
      <ellipse cx="50" cy="50" rx="27" ry="9" fill="none" stroke="var(--encre)" strokeWidth="2" />
      <path d="M50,23 Q33,50 50,77" fill="none" stroke="var(--encre)" strokeWidth="2" />
      <path d="M50,23 Q67,50 50,77" fill="none" stroke="var(--encre)" strokeWidth="2" />
    </>
  ),
  cm2: (
    <>
      <circle cx="41" cy="41" r="21" fill="var(--_accent)" opacity="0.3" />
      <circle cx="41" cy="41" r="21" fill="none" stroke="var(--encre)" strokeWidth="5" />
      <path d="M57,57 Q68,68 78,78" stroke="var(--encre)" strokeWidth="7" strokeLinecap="round" />
    </>
  ),
  '6e': (
    <>
      <circle cx="50" cy="24" r="4" fill="var(--encre)" />
      <path d="M50,24 Q40,52 27,77" fill="none" stroke="var(--encre)" strokeWidth="5" strokeLinecap="round" />
      <path d="M50,24 Q60,52 73,77" fill="none" stroke="var(--encre)" strokeWidth="5" strokeLinecap="round" />
      <path
        d="M27,77 Q50,88 73,77"
        fill="none"
        stroke="var(--_accent)"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
    </>
  ),
  '5e': (
    <>
      <path
        d="M41,14 L41,58 Q41,74 50,74 Q59,74 59,58 L59,14"
        fill="none"
        stroke="var(--encre)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M41,48 Q41,67 50,67 Q59,67 59,48 Z" fill="var(--_accent)" opacity="0.55" />
      <line x1="36" y1="14" x2="64" y2="14" stroke="var(--encre)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="47" cy="55" r="2.5" fill="var(--papier)" />
    </>
  ),
  '4e': (
    <>
      <g stroke="var(--encre)" strokeWidth="4" strokeLinecap="round">
        <line x1="50" y1="16" x2="50" y2="26" />
        <line x1="50" y1="74" x2="50" y2="84" />
        <line x1="16" y1="50" x2="26" y2="50" />
        <line x1="74" y1="50" x2="84" y2="50" />
        <line x1="26" y1="26" x2="33" y2="33" />
        <line x1="67" y1="67" x2="74" y2="74" />
        <line x1="74" y1="26" x2="67" y2="33" />
        <line x1="33" y1="67" x2="26" y2="74" />
      </g>
      <circle cx="50" cy="50" r="22" fill="var(--_accent)" opacity="0.35" stroke="var(--encre)" strokeWidth="3" />
      <circle cx="50" cy="50" r="8" fill="var(--papier)" stroke="var(--encre)" strokeWidth="2" />
    </>
  ),
  '3e': (
    <>
      <rect x="24" y="36" width="52" height="28" fill="var(--papier)" stroke="var(--encre)" strokeWidth="3" />
      <circle cx="24" cy="50" r="8" fill="var(--papier)" stroke="var(--encre)" strokeWidth="3" />
      <circle cx="76" cy="50" r="8" fill="var(--papier)" stroke="var(--encre)" strokeWidth="3" />
      <path
        d="M44,64 L50,80 L56,64"
        fill="var(--_accent)"
        stroke="var(--encre)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </>
  ),
}
