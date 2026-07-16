import { useEffect, useState } from 'react';
import { auth, db, doc, onSnapshot } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { setDoc } from 'firebase/firestore';
import { registerDeviceSession } from '../security/sessionSecurity';

export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [dbUser, setDbUser] = useState(null);
  const [session, setSession] = useState(null);
  const [newDeviceAlert, setNewDeviceAlert] = useState(null);

  useEffect(() => {
    // Check for mock user local bypass
    const mockUserStr = localStorage.getItem('fn_mock_user');
    if (mockUserStr) {
      try {
        const mu = JSON.parse(mockUserStr);
        setUser(mu);
        setDbUser({
          uid: mu.uid,
          name: mu.displayName || 'Lt. Col. Sandeep Mehta (Retd.)',
          phone: mu.phoneNumber || '+919999999999',
          points: 120,
          verified: true
        });
        return;
      } catch (_) {}
    }

    let unsubDb = () => {};
    const timeout = setTimeout(() => setUser(prev => prev === undefined ? null : prev), 4000);
    
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      clearTimeout(timeout);
      setUser(u);

      if (u) {
        // Register device securely
        try {
          const sessionInfo = await registerDeviceSession(u.uid);
          setSession(sessionInfo);
          if (sessionInfo && sessionInfo.isNewDevice) {
             setNewDeviceAlert(sessionInfo);
          }
        } catch (e) {
          console.warn('[useAuth] registerDeviceSession failed:', e);
        }

        // Sync with Firestore user doc
        const userRef = doc(db, 'users', u.uid);
        unsubDb = onSnapshot(userRef, (snap) => {
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
      } else {
        setDbUser(null);
        setSession(null);
        unsubDb();
      }
    });

    return () => { unsubAuth(); unsubDb(); clearTimeout(timeout); };
  }, []);

  const ADMIN_PHONES = ['+919999999999', '+911234567890', '+911234567891']; // Placeholder
  const isAdmin = user && ADMIN_PHONES.includes(user.phoneNumber);

  return { 
    user, 
    dbUser,
    session,
    newDeviceAlert,
    clearNewDeviceAlert: () => setNewDeviceAlert(null),
    loading: user === undefined, 
    isAdmin 
  };
}

