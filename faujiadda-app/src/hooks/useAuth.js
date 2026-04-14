import { useEffect, useState } from 'react';
import { auth, db, doc, onSnapshot } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { setDoc, getDoc } from 'firebase/firestore';

export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [dbUser, setDbUser] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => setUser(prev => prev === undefined ? null : prev), 4000);
    
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      clearTimeout(timeout);
      setUser(u);

      if (u) {
        // Sync with Firestore user doc
        const userRef = doc(db, 'users', u.uid);
        const unsubDb = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            setDbUser(snap.data());
          } else {
            // Initialize user doc
            setDoc(userRef, { 
              uid: u.uid, 
              phone: u.phoneNumber || '', 
              points: 0,
              createdAt: Date.now() 
            }, { merge: true });
          }
        });
        return () => unsubDb();
      } else {
        setDbUser(null);
      }
    });

    return () => { unsubAuth(); clearTimeout(timeout); };
  }, []);

  const ADMIN_PHONES = ['+919999999999', '+911234567890', '+911234567891']; // Placeholder
  const isAdmin = user && ADMIN_PHONES.includes(user.phoneNumber);

  return { 
    user, 
    dbUser, // Contains points, etc.
    loading: user === undefined, 
    isAdmin 
  };
}

