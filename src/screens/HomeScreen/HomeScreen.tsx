import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { GRADE_LEVELS } from '../../content/grades'
import { getLevelsByGrade } from '../../content/levels'
import { WatercolorScene } from '../../components/watercolor/WatercolorScene'
import { GradeVignette } from './GradeVignette'
import { oceanScene } from './scenes'
import styles from './HomeScreen.module.css'
import { useModeTest } from '../../state/modeTest'

/**
 * L'accueil : les neuf classes, et un seul tableau.
 *
 * Les deux tableaux latéraux et le bandeau ont été retirés au profit d'une
 * unique aquarelle ancrée au bas de la page. La raison tient en une phrase :
 * trois tableaux sur un écran, c'est trois horizons à trois hauteurs et trois
 * échelles — l'œil ne sait plus lequel regarder, et le cadre symétrique
 * gauche/droite promettait un point focal au centre où il n'y avait qu'une
 * grille de cartes égales. Une page, un tableau.
 *
 * `citeEngloutieScene` et `bandeauScene` restent dans `scenes.ts` : elles ne
 * sont plus employées ici, mais elles attendent un autre écran.
 */
export function HomeScreen() {
  return (
    <div className={styles.home}>
      <h1 className={styles.title}>Jeu Culture</h1>
      <p className={styles.subtitle}>Choisis un niveau scolaire pour commencer à jouer.</p>

      <div className={styles.grid}>
        {GRADE_LEVELS.map((grade) => {
          const nombre = getLevelsByGrade(grade.id).length
          const contenu = (
            <>
              <span className={styles.art}>
                <GradeVignette gradeId={grade.id} ouvert={grade.enabled} />
              </span>
              <span className={styles.ligne}>
                <span className={styles.label}>{grade.label}</span>
                {grade.enabled ? (
                  <span className={styles.niveaux}>
                    {nombre} niveau{nombre > 1 ? 'x' : ''}
                  </span>
                ) : (
                  <span className={styles.soon}>Bientôt disponible</span>
                )}
              </span>
            </>
          )

          return grade.enabled ? (
            <Link key={grade.id} to={`/${grade.id}`} className={clsx(styles.card, styles.enabled)}>
              {contenu}
            </Link>
          ) : (
            <div key={grade.id} className={clsx(styles.card, styles.disabled)}>
              {contenu}
            </div>
          )
        })}
      </div>

      {/*
        Le rivage : l'unique tableau, ancré au bas de la page et débordant
        sous son bord. Il monte derrière la grille en se dissolvant dans le
        papier — c'est ce fondu, et non un cadre, qui le fait appartenir à la
        page plutôt qu'être posé dessus.
      */}
      {/*
        Le bac à sable. Il vit sur l'accueil, écrit en toutes lettres et éteint
        par défaut : un mode de test caché derrière un geste secret finit
        toujours par rester allumé sans qu'on s'en aperçoive, et fausse tout ce
        qu'on croit observer ensuite.
      */}
      <ModeTestBouton />

      <div className={styles.rivage} aria-hidden="true">
        <WatercolorScene paint={oceanScene} width={1500} height={1150} seed={1847} />
      </div>
    </div>
  )
}

function ModeTestBouton() {
  const actif = useModeTest((etat) => etat.actif)
  const basculer = useModeTest((etat) => etat.basculer)

  return (
    <div className={styles.bacASable}>
      <button
        type="button"
        className={actif ? styles.bacActif : styles.bacEteint}
        onClick={basculer}
        aria-pressed={actif}
      >
        Bac à sable {actif ? 'allumé' : 'éteint'}
      </button>
      {actif ? (
        <p className={styles.bacNote}>
          Tous les niveaux sont ouverts, et chaque jeu peut être passé. Rien de ce qui est
          passé n’est enregistré.
        </p>
      ) : null}
    </div>
  )
}
