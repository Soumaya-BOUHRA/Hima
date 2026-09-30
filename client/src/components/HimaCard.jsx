import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon.jsx';

const QUOTES = [
  'Commence petit. Avance chaque jour.',
  'Une tâche terminée, c’est un pas de plus.',
  'Ton élan d’aujourd’hui construit demain.',
  'Clarté d’abord, le reste suivra.',
];

export default function HimaCard({ doneToday = 0 }) {
  const quote = useMemo(() => {
    const day = new Date().getDate();
    return QUOTES[day % QUOTES.length];
  }, []);

  return (
    <motion.section
      className="hima-card"
      aria-label="Votre Hima du jour"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut', delay: 0.12 }}
    >
      <span className="hima-kicker">
        <Icon name="sparkles" size={14} />
        Votre Hima du jour
      </span>
      <p className="hima-quote">« {quote} »</p>
      <p className="hima-sub">
        {doneToday > 0
          ? `${doneToday} tâche${doneToday > 1 ? 's' : ''} terminée${doneToday > 1 ? 's' : ''} — gardez cet élan.`
          : 'Chaque journée commence par une première tâche.'}
      </p>
    </motion.section>
  );
}
