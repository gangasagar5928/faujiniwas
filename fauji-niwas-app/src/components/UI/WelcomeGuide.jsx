import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './WelcomeGuide.module.css';

const steps = [
  {
    icon: '🪖',
    title: 'Welcome Guide',
    desc: 'Welcome to India\'s most trusted map for defence housing. Find verified rentals near Cantonments and SSB Centers.'
  },
  {
    icon: '🎯',
    title: 'Quick Navigation',
    desc: 'Tap the floating GOLD button at the bottom center to instantly access the Map, Marketplace, or your Profile.'
  },
  {
    icon: '🎖️',
    title: 'Verified for Trust',
    desc: 'Look for the "Verified Fauji" badge on listings. These owners have vetted their military IDs for your security.'
  }
];

export default function WelcomeGuide() {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if guide was already shown
    const shown = localStorage.getItem('fauji_guide_shown');
    if (!shown) {
      // Small delay for entrance effect
      setTimeout(() => setIsVisible(true), 1500);
    }
  }, []);

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      dismiss();
    }
  };

  const dismiss = () => {
    localStorage.setItem('fauji_guide_shown', 'true');
    setIsVisible(false);
  };

  const current = steps[step];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={`${styles.card} liquid-glass-deep`}
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24, mass: 0.9 }}
          >
            <div className={styles.header}>
              <span className={styles.stepCount}>Step {step + 1} of {steps.length}</span>
              <button className={styles.skip} onClick={dismiss}>Skip</button>
            </div>

            <div className={styles.body}>
              <motion.div
                className={styles.icon}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {current.icon}
              </motion.div>
              <h2 className={styles.title}>{current.title}</h2>
              <p className={styles.desc}>{current.desc}</p>
            </div>

            <div className={styles.footer}>
              <motion.button
                className={`${styles.nextBtn} fluid-press`}
                onClick={next}
                whileTap={{ scale: 0.96 }}
              >
                {step === steps.length - 1 ? 'Get Started 🎖️' : 'Next Step →'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
