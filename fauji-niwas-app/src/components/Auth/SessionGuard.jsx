import { useEffect, useState } from 'react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../hooks/useAuth';
import { isSessionExpired, getSessionTimeRemaining } from '../../security/sessionSecurity';
import DeviceLoginAlert from './DeviceLoginAlert';

/**
 * SessionGuard
 * Protects the app by enforcing session expiry limits.
 * Also renders global authentication notifications (like new device detection).
 */
export default function SessionGuard({ children }) {
  const { user, newDeviceAlert, clearNewDeviceAlert } = useAuth();
  const [expired, setExpired] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }

    let isMounted = true;

    // Check Firebase ID Token claims for auth_time
    user.getIdTokenResult().then((idTokenResult) => {
      if (!isMounted) return;
      
      const authTimeSeconds = idTokenResult.claims.auth_time;
      if (authTimeSeconds) {
        const authTime = new Date(authTimeSeconds * 1000);
        if (isSessionExpired(authTime)) {
          setExpired(true);
        }
      }
      setChecking(false);
    }).catch((e) => {
      console.warn('[SessionGuard] Failed to get token result:', e);
      setChecking(false);
    });

    return () => { isMounted = false; };
  }, [user]);

  // Handle forcing the user out if expired
  useEffect(() => {
    if (expired && user) {
      // Sign out natively
      signOut(auth).then(() => {
        // You might want to show a toast or redirect here using ModalContext,
        // but SessionGuard sits high in the tree, so a simple alert or page reload works.
        // For now, it silently signs out the user. The app reacts automatically.
      });
    }
  }, [expired, user]);

  return (
    <>
      {children}
      {newDeviceAlert && (
        <DeviceLoginAlert 
          device={newDeviceAlert.device} 
          browser={newDeviceAlert.browser} 
          onDismiss={clearNewDeviceAlert} 
        />
      )}
    </>
  );
}
