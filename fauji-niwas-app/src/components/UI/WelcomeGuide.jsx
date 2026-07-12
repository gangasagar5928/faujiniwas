import React, { useState, useEffect } from 'react';
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

  if (!isVisible) return null;

  const current = steps[step];

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.stepCount}>Step {step + 1} of {steps.length}</span>
          <button className={styles.skip} onClick={dismiss}>Skip</button>
        </div>
        
        <div className={styles.body}>
          <div className={styles.icon}>{current.icon}</div>
          <h2 className={styles.title}>{current.title}</h2>
          <p className={styles.desc}>{current.desc}</p>
        </div>

        <div className={styles.footer}>
          <button className={styles.nextBtn} onClick={next}>
            {step === steps.length - 1 ? 'Get Started 🎖️' : 'Next Step →'}
          </button>
        </div>
      </div>
    </div>
  );
}
