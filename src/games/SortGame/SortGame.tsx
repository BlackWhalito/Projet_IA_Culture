import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import type { SortContent } from '../../types/game'
import type { GameCompleteResult } from '../gameTypes'
import { shuffle } from '../../engine/shuffle'
import { elapsedSince } from '../../engine/timing'
import styles from './SortGame.module.css'

interface SortGameProps {
  content: SortContent
  onComplete: (result: GameCompleteResult) => void
}

export function SortGame({ content, onComplete }: SortGameProps) {
  const [itemOrder] = useState<number[]>(() => shuffle(content.items.map((_, i) => i)))
  const [assigned, setAssigned] = useState<Record<number, string>>({})
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [rejectCategoryId, setRejectCategoryId] = useState<string | null>(null)
  const mistakesRef = useRef(0)
  const startedAtRef = useRef(0)

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

  function handleCategoryTap(categoryId: string) {
    if (selectedItem === null || rejectCategoryId) return
    const item = content.items[selectedItem]
    if (item.categoryId === categoryId) {
      const nextAssigned = { ...assigned, [selectedItem]: categoryId }
      setAssigned(nextAssigned)
      setSelectedItem(null)
      if (Object.keys(nextAssigned).length === content.items.length) {
        const timeMs = elapsedSince(startedAtRef.current)
        window.setTimeout(() => onComplete({ correct: mistakesRef.current === 0, timeMs }), 400)
      }
      return
    }
    mistakesRef.current += 1
    setRejectCategoryId(categoryId)
    window.setTimeout(() => {
      setRejectCategoryId(null)
      setSelectedItem(null)
    }, 500)
  }

  const unassignedIndices = itemOrder.filter((i) => assigned[i] === undefined)

  return (
    <div className={styles.game}>
      <div className={styles.categories}>
        {content.categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={clsx(styles.category, { [styles.reject]: rejectCategoryId === category.id })}
            onClick={() => handleCategoryTap(category.id)}
          >
            <span className={styles.categoryLabel}>{category.label}</span>
            <span className={styles.categoryItems}>
              {content.items
                .map((item, i) => ({ item, i }))
                .filter(({ i }) => assigned[i] === category.id)
                .map(({ item, i }) => (
                  <span key={i} className={styles.categoryItem}>
                    {item.label}
                  </span>
                ))}
            </span>
          </button>
        ))}
      </div>
      <div className={styles.pool}>
        {unassignedIndices.map((i) => (
          <button
            key={i}
            type="button"
            className={clsx(styles.item, { [styles.selected]: selectedItem === i })}
            onClick={() => setSelectedItem(i)}
          >
            {content.items[i].label}
          </button>
        ))}
      </div>
    </div>
  )
}
