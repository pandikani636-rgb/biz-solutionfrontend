import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SiteProvider, useSite } from './context/SiteContext';
import { LanguageProvider } from './context/LanguageContext';
import { AppRoutes } from './routes/AppRoutes';
import { AIChatbotWidget } from './components/common/AIChatbotWidget';
import { TechPreloader } from './components/common/TechPreloader';
import { ScrollToTop } from './components/common/ScrollToTop';

function AppContent() {
  const { showPreloader, setShowPreloader } = useSite();

  return (
    <>
      {showPreloader && <TechPreloader onFinish={() => setShowPreloader(false)} />}
      <AppRoutes />
      {!showPreloader && <AIChatbotWidget />}
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
            <AppContent />
          </SiteProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
