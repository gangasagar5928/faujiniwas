import React, { Suspense, lazy, useState, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { useListings } from './hooks/useListings';
import { useAuth } from './hooks/useAuth';
import { useFilterStore } from './store/filterStore';
import AppShell from './components/AppShell/AppShell';
import Loader from './components/UI/Loader';
import Toast from './components/UI/Toast';

// Lazy-load heavy modals — off critical path
const DetailModal    = lazy(() => import('./components/Modals/DetailModal'));
const PostModal      = lazy(() => import('./components/Modals/PostModal'));
const ProfileModal   = lazy(() => import('./components/Modals/ProfileModal'));
const ReportModal    = lazy(() => import('./components/Modals/ReportModal'));
const TransfersModal = lazy(() => import('./components/Modals/TransfersModal'));
const CompareModal   = lazy(() => import('./components/Modals/CompareModal'));
const FoodPanel      = lazy(() => import('./components/Food/FoodPanel'));

export const ModalContext = React.createContext(null);

export default function App() {
  useListings(); // subscribe Firestore → Zustand
  const { loading: authLoading } = useAuth();
  const setActiveView = useFilterStore((s) => s.setActiveView);

  const [toast, setToast] = useState(null);
  const [openModal, setOpenModal] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [foodCity, setFoodCity] = useState(null);

  // Read ?view=dorms (or ?listing=id) from landing page CTAs
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'dorms') setActiveView('dorms');
    else if (view === 'market') setActiveView('market');
  }, [setActiveView]);

  // Handle hardware back button using History API
  useEffect(() => {
    const handlePopState = () => {
      setOpenModal(null);
      setFoodCity(null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
    if (openModal || foodCity) window.history.back();
  };

  const ctxValue = {
    showToast,
    openDetail: (id) => { pushModalState(); setDetailId(id); setOpenModal('detail'); },
    openPost:   ()   => { pushModalState(); setOpenModal('post'); },
    openProfile:()   => { pushModalState(); setOpenModal('profile'); },
    openReport: (id) => { pushModalState(); setReportId(id); setOpenModal('report'); },
    openTransfers:() => { pushModalState(); setOpenModal('transfers'); },
    openCompare: () => { pushModalState(); setOpenModal('compare'); },
    openFood:   (city) => { pushModalState(); setFoodCity(city); },
    closeFood:  closeModal,
    closeAll:   closeModal,
  };

  if (authLoading) return <Loader />;

  return (
    <HelmetProvider>
      <ModalContext.Provider value={ctxValue}>
        <AppShell />

        <Suspense fallback={null}>
          {openModal === 'detail'    && <DetailModal     id={detailId}  onClose={closeModal} />}
          {openModal === 'post'      && <PostModal       onClose={closeModal} />}
          {openModal === 'profile'   && <ProfileModal    onClose={closeModal} />}
          {openModal === 'report'    && <ReportModal     id={reportId}  onClose={closeModal} />}
          {openModal === 'transfers' && <TransfersModal  onClose={closeModal} />}
          {openModal === 'compare'   && <CompareModal    onClose={closeModal} />}
          {foodCity                  && <FoodPanel       city={foodCity} onClose={closeModal} />}
        </Suspense>

        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </ModalContext.Provider>
    </HelmetProvider>
  );
}
