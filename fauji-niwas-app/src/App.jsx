import React, { Suspense, lazy, useState, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { useListings } from './hooks/useListings';
import { useAuth } from './hooks/useAuth';
import { useFilterStore } from './store/filterStore';
import UnifiedBentoDashboard from './components/AppShell/UnifiedBentoDashboard';
import Loader from './components/UI/Loader';
import Toast from './components/UI/Toast';
import WelcomeGuide from './components/UI/WelcomeGuide';
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

export const ModalContext = React.createContext(null);

export default function App() {
  useListings(); // subscribe Firestore → Zustand
  const { loading: authLoading } = useAuth();
  const setActiveView = useFilterStore((s) => s.setActiveView);

  const [toast, setToast] = useState(null);
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

  // Read ?view=dorms (or ?listing=id) from landing page CTAs
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'dorms') setActiveView('dorms');
    else if (view === 'market') setActiveView('market');
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

  const showToast = (msg, type = 'ok', duration = 3000) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), duration);
  };

  const pushModalState = () => {
    // Only push if we aren't already replacing the modal
    if (!openModal && !foodCity) {
      window.history.pushState({ modalOpen: true }, '');
    }
  };

  const closeModal = () => {
    if (openModal) {
      setOpenModal(null);
      setDetailId(null);
      setReportId(null);
      setChatConfig(null);
      window.history.back();
    }
  };

  const closeFoodOnly = () => {
    if (foodCity) {
      setFoodCity(null);
      window.history.back();
    }
  };

  const ctxValue = {
    showToast,
    openDetail: (id) => { window.history.pushState({ modal: 'detail' }, ''); setDetailId(id); setOpenModal('detail'); },
    openPost:   ()   => { window.history.pushState({ modal: 'post' }, '');   setOpenModal('post'); },
    openProfile:()   => { window.history.pushState({ modal: 'profile' }, ''); setOpenModal('profile'); },
    openReport: (id) => { window.history.pushState({ modal: 'report' }, ''); setReportId(id); setOpenModal('report'); },
    openTransfers:() => { window.history.pushState({ modal: 'transfers' }, ''); setOpenModal('transfers'); },
    openCompare: () => { window.history.pushState({ modal: 'compare' }, ''); setOpenModal('compare'); },
    openFood:   (city) => { window.history.pushState({ modal: 'food' }, ''); setFoodCity(city); },
    openLegal:  ()   => { window.history.pushState({ modal: 'legal' }, ''); setOpenModal('legal'); },
    openChat:   (config) => { window.history.pushState({ modal: 'chat' }, ''); setChatConfig(config); setOpenModal('chat'); },
    openAdmin:  ()   => { window.history.pushState({ modal: 'admin' }, ''); setOpenModal('admin'); },
    openRelocation:() => { window.history.pushState({ modal: 'relocation' }, ''); setOpenModal('relocation'); },
    closeFood:  closeFoodOnly,
    closeAll:   closeModal,
  };

  // Expose API for external widgets (like chatbot.js)
  useEffect(() => {
    window.openDetailModal = ctxValue.openDetail;
    window.openFoodModal = ctxValue.openFood;
    window.openRelocationModal = ctxValue.openRelocation;
    return () => {
      delete window.openDetailModal;
      delete window.openFoodModal;
      delete window.openRelocationModal;
    };
  }, [ctxValue.openDetail, ctxValue.openFood, ctxValue.openRelocation]);

  if (authLoading && !isInitTimedOut) return <Loader />;

  return (
    <HelmetProvider>
      <ModalContext.Provider value={ctxValue}>
        <SessionGuard>
          <ErrorBoundary>
            <UnifiedBentoDashboard />
            <WelcomeGuide />
          </ErrorBoundary>

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
          {openModal === 'admin' && <AdminModal onClose={closeModal} />}
        </Suspense>
        <Suspense fallback={null}>
          {openModal === 'relocation' && <RelocationModal onClose={closeModal} />}
        </Suspense>

        {toast && <Toast msg={toast.msg} type={toast.type} />}
        </SessionGuard>
      </ModalContext.Provider>
    </HelmetProvider>
  );
}
