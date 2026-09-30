import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Modal from './Modal.jsx';
import TaskForm from './TaskForm.jsx';
import Icon from './Icon.jsx';

export default function TaskSheet({
  open,
  mode = 'create',
  task = null,
  submitting = false,
  error,
  projectSuggestions = [],
  onClose,
  onSubmit,
}) {
  const [succeeded, setSucceeded] = useState(false);

  useEffect(() => {
    if (open) setSucceeded(false);
  }, [open, task?._id]);

  useEffect(() => {
    if (!succeeded) return undefined;
    const timer = setTimeout(() => {
      onClose?.();
    }, 1600);
    return () => clearTimeout(timer);
  }, [succeeded, onClose]);

  const handleSubmit = async (values) => {
    try {
      await onSubmit(values);
      setSucceeded(true);
    } catch {
      /* l’erreur est affichée par le parent via la prop `error` */
    }
  };

  const isCreate = mode === 'create';

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!submitting && !succeeded) onClose?.();
      }}
      title={succeeded ? undefined : isCreate ? 'Nouvelle tâche' : 'Modifier la tâche'}
      description={
        succeeded
          ? undefined
          : isCreate
            ? 'Décrivez votre prochaine étape — un pas de plus vers votre objectif.'
            : 'Mettez à jour les informations de cette tâche.'
      }
      size="lg"
    >
      {succeeded ? (
        <div className="sheet-success">
          <motion.span
            className="sheet-success-icon"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
          >
            <Icon name="check" size={30} />
          </motion.span>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <h3 className="sheet-success-title">
              {isCreate ? 'Tâche ajoutée' : 'Modifications enregistrées'}
            </h3>
            <p className="sheet-success-sub">
              Un pas de plus vers votre objectif. Continuez sur votre lancée.
            </p>
          </motion.div>
        </div>
      ) : (
        <TaskForm
          key={task?._id ?? 'create'}
          task={task}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={isCreate ? 'Créer la tâche' : 'Enregistrer les modifications'}
          projectSuggestions={projectSuggestions}
        />
      )}
    </Modal>
  );
}
