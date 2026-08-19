import '@testing-library/jest-dom/vitest'

/**
 * jsdom n'implémente pas `matchMedia`. Plusieurs composants le lisent une seule fois au
 * montage pour respecter `prefers-reduced-motion` (voir la skill `aquarelle`) — sans ce
 * polyfill minimal, leur rendu en test échoue avant même d'atteindre la logique testée.
 */
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}
