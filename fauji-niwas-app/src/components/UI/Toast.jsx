import { motion } from 'framer-motion';
import styles from './Toast.module.css';

export default function Toast({ msg, type = 'ok' }) {
  return (
    <motion.div
      className={`${styles.toast} ${styles[type]} liquid-glass`}
      initial={{ y: 40, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22, mass: 0.8 }}
    >
      {msg}
    </motion.div>
  );
}
