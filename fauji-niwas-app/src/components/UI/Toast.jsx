import styles from './Toast.module.css';

export default function Toast({ msg, type = 'ok' }) {
  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      {msg}
    </div>
  );
}
