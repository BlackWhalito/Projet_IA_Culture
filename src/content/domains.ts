import type { Domain, DomainId } from '../types/content'

export const DOMAINS: Record<DomainId, Domain> = {
  histoire: {
    id: 'histoire',
    label: 'Histoire',
    color: 'var(--color-domain-histoire)',
    icon: '🏛️',
  },
  geographie: {
    id: 'geographie',
    label: 'Géographie',
    color: 'var(--color-domain-geographie)',
    icon: '🌍',
  },
  sciences: {
    id: 'sciences',
    label: 'Sciences',
    color: 'var(--color-domain-sciences)',
    icon: '🔬',
  },
  francais: {
    id: 'francais',
    label: 'Français',
    color: 'var(--color-domain-francais)',
    icon: '📖',
  },
}

export const DOMAIN_LIST: Domain[] = Object.values(DOMAINS)
