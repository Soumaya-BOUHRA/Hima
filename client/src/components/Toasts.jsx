import { AnimatePresence, motion } from 'framer-motion';
import Icon from './Icon.jsx';

export default function Toasts({ notice }) {
  return (
    <div className="toast-stack" aria-live="polite">
      <AnimatePresence>
        {notice ? (
          <motion.div
            key={notice}
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22 }}
          >
            <span className="toast-icon">
              <Icon name="check" size={13} />
            </span>
            {notice}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
