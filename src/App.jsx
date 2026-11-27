import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SiteProvider, useSite } from './context/SiteContext';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { AppRoutes } from './routes/AppRoutes';
import { AIChatbotWidget } from './components/common/AIChatbotWidget';
import { TechPreloader } from './components/common/TechPreloader';
import { ScrollToTop } from './components/common/ScrollToTop';
import { AdvertisementModal } from './components/common/AdvertisementModal';
import { BackButton } from './components/common/BackButton';
import { CartModal } from './components/common/CartModal';

function AppContent() {
  const { showPreloader, setShowPreloader } = useSite();

  return (
    <>
      {showPreloader && <TechPreloader onFinish={() => setShowPreloader(false)} />}
      <AppRoutes />
      {!showPreloader && (
        <>
          <BackButton />
          <CartModal />
          <AIChatbotWidget />
          <AdvertisementModal />
        </>
      )}
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <LanguageProvider>
        <AuthProvider>
          <SiteProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </SiteProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
