import React, { Suspense, lazy, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { useListings } from './hooks/useListings';
import { useAuth } from './hooks/useAuth';
import { useFilterStore } from './store/filterStore';
import UnifiedBentoDashboard from './components/AppShell/UnifiedBentoDashboard';
import Loader from './components/UI/Loader';
import Toast from './components/UI/Toast';
import ErrorBoundary from './components/UI/ErrorBoundary';
import SessionGuard from './components/Auth/SessionGuard';

// Lazy-load heavy modals — off critical path
const DetailModal    = lazy(() => import('./components/Modals/DetailModal'));
const PostModal      = lazy(() => import('./components/Modals/PostModal'));
const ProfileModal   = lazy(() => import('./components/Modals/ProfileModal'));
const ReportModal    = lazy(() => import('./components/Modals/ReportModal'));
const TransfersModal = lazy(() => import('./components/Modals/TransfersModal'));
const CompareModal   = lazy(() => import('./components/Modals/CompareModal'));
const FoodPanel      = lazy(() => import('./components/Food/FoodPanel'));
const LegalModal     = lazy(() => import('./components/Modals/LegalModal'));
const ChatModal      = lazy(() => import('./components/Modals/ChatModal'));
const AdminModal     = lazy(() => import('./components/Modals/AdminModal'));
const RelocationModal = lazy(() => import('./components/Modals/RelocationModal'));
const AccessibilityModal = lazy(() => import('./components/Modals/AccessibilityModal'));

export const ModalContext = React.createContext(null);

export default function App() {
  useListings(); // subscribe Firestore → Zustand
  const { loading: authLoading, isAdmin } = useAuth();
  const setActiveView = useFilterStore((s) => s.setActiveView);

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const [openModal, setOpenModal] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [chatConfig, setChatConfig] = useState(null);
  const [foodCity, setFoodCity] = useState(null);
  const [isInitTimedOut, setIsInitTimedOut] = useState(false);

  // Safety Timeout for Native Shells (Fixes "Blur Screen" hang)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (authLoading) {
        console.warn("Auth initialization timed out. Force-rendering UI.");
        setIsInitTimedOut(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [authLoading]);

  // Read URL params from landing page / SEO city CTAs
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'dorms') setActiveView('dorms');
    else if (view === 'market') setActiveView('market');

    const search = params.get('search') || params.get('city');
    if (search) useFilterStore.getState().setSmartSearchQ(search);

    const listingId = params.get('listing');
    if (listingId) {
      const timer = setTimeout(() => {
        window.history.replaceState({ modal: 'detail' }, '');
        setDetailId(listingId);
        setOpenModal('detail');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [setActiveView]);

  // Handle hardware back button using History API
  useEffect(() => {
    const handlePopState = (e) => {
      const state = e.state;
      if (state?.modal === 'food' || (!state?.modal && foodCity)) {
        setFoodCity(null);
      } else {
        setOpenModal(null);
        setDetailId(null);
        setReportId(null);
        setChatConfig(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [foodCity]);

  const showToast = useCallback((msg, type = 'ok', duration = 3000) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, type });
    toastTimerRef.current = setTimeout(() => setToast(null), duration);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const closeModal = useCallback(() => {
    setOpenModal(null);
    setDetailId(null);
    setReportId(null);
    setChatConfig(null);
    if (window.history.state?.modal) window.history.back();
  }, []);

  const closeFoodOnly = useCallback(() => {
    setFoodCity(null);
    if (window.history.state?.modal) window.history.back();
  }, []);

  const openDetail = useCallback((id) => { window.history.pushState({ modal: 'detail' }, ''); setDetailId(id); setOpenModal('detail'); }, []);
  const openPost = useCallback(() => { window.history.pushState({ modal: 'post' }, ''); setOpenModal('post'); }, []);
  const openProfile = useCallback(() => { window.history.pushState({ modal: 'profile' }, ''); setOpenModal('profile'); }, []);
  const openReport = useCallback((id) => { window.history.pushState({ modal: 'report' }, ''); setReportId(id); setOpenModal('report'); }, []);
  const openTransfers = useCallback(() => { window.history.pushState({ modal: 'transfers' }, ''); setOpenModal('transfers'); }, []);
  const openCompare = useCallback(() => { window.history.pushState({ modal: 'compare' }, ''); setOpenModal('compare'); }, []);
  const openFood = useCallback((city) => { window.history.pushState({ modal: 'food' }, ''); setFoodCity(city); }, []);
  const openLegal = useCallback(() => { window.history.pushState({ modal: 'legal' }, ''); setOpenModal('legal'); }, []);
  const openChat = useCallback((config) => { window.history.pushState({ modal: 'chat' }, ''); setChatConfig(config); setOpenModal('chat'); }, []);
  const openAdmin = useCallback(() => { window.history.pushState({ modal: 'admin' }, ''); setOpenModal('admin'); }, []);
  const openRelocation = useCallback(() => { window.history.pushState({ modal: 'relocation' }, ''); setOpenModal('relocation'); }, []);
  const openAccessibility = useCallback(() => { window.history.pushState({ modal: 'accessibility' }, ''); setOpenModal('accessibility'); }, []);

  const ctxValue = useMemo(() => ({
    showToast,
    openDetail,
    openPost,
    openProfile,
    openReport,
    openTransfers,
    openCompare,
    openFood,
    openLegal,
    openChat,
    openAdmin,
    openRelocation,
    openAccessibility,
    closeFood: closeFoodOnly,
    closeAll: closeModal,
    isAdmin,
  }), [showToast, openDetail, openPost, openProfile, openReport, openTransfers, openCompare, openFood, openLegal, openChat, openAdmin, openRelocation, openAccessibility, closeFoodOnly, closeModal, isAdmin]);

  // Expose API for external widgets (like chatbot.js)
  useEffect(() => {
    window.openDetailModal = ctxValue.openDetail;
    window.openFoodModal = ctxValue.openFood;
    window.openRelocationModal = ctxValue.openRelocation;
    window.openAccessibilityModal = ctxValue.openAccessibility;
    return () => {
      delete window.openDetailModal;
      delete window.openFoodModal;
      delete window.openRelocationModal;
      delete window.openAccessibilityModal;
    };
  }, [ctxValue.openDetail, ctxValue.openFood, ctxValue.openRelocation, ctxValue.openAccessibility]);

  if (authLoading && !isInitTimedOut) return <Loader />;

  return (
    <HelmetProvider>
      <ModalContext.Provider value={ctxValue}>
        <SessionGuard>
          <ErrorBoundary>
            <UnifiedBentoDashboard />

            {/* Separate Suspense boundaries prevent sibling lazy-loads from unmounting each other */}
            <Suspense fallback={null}>
              {openModal === 'detail' && <DetailModal id={detailId} onClose={closeModal} />}
            </Suspense>
            <Suspense fallback={null}>
              {openModal === 'post' && <PostModal onClose={closeModal} />}
            </Suspense>
            <Suspense fallback={null}>
              {openModal === 'profile' && <ProfileModal onClose={closeModal} />}
            </Suspense>
            <Suspense fallback={null}>
              {openModal === 'report' && <ReportModal id={reportId} onClose={closeModal} />}
            </Suspense>
            <Suspense fallback={null}>
              {openModal === 'transfers' && <TransfersModal onClose={closeModal} />}
            </Suspense>
            <Suspense fallback={null}>
              {openModal === 'compare' && <CompareModal onClose={closeModal} />}
            </Suspense>
            <Suspense fallback={null}>
              {openModal === 'legal' && <LegalModal onClose={closeModal} />}
            </Suspense>
            <Suspense fallback={null}>
              {foodCity && <FoodPanel city={foodCity} onClose={closeFoodOnly} />}
            </Suspense>
            <Suspense fallback={null}>
              {openModal === 'chat' && chatConfig && <ChatModal config={chatConfig} onClose={closeModal} />}
            </Suspense>
            <Suspense fallback={null}>
              {openModal === 'admin' && isAdmin && <AdminModal onClose={closeModal} />}
            </Suspense>
            <Suspense fallback={null}>
              {openModal === 'relocation' && <RelocationModal onClose={closeModal} />}
            </Suspense>
            <Suspense fallback={null}>
              {openModal === 'accessibility' && <AccessibilityModal onClose={closeModal} />}
            </Suspense>

            {toast && <Toast msg={toast.msg} type={toast.type} />}
          </ErrorBoundary>
        </SessionGuard>
      </ModalContext.Provider>
    </HelmetProvider>
  );
}
