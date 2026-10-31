import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SiteProvider } from './context/SiteContext';
import { LanguageProvider } from './context/LanguageContext';
import { AppRoutes } from './routes/AppRoutes';
import { AIChatbotWidget } from './components/common/AIChatbotWidget';
import { TechPreloader } from './components/common/TechPreloader';
import { ScrollToTop } from './components/common/ScrollToTop';

export function App() {
  const [showPreloader, setShowPreloader] = useState(true);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <LanguageProvider>
        <AuthProvider>
          <SiteProvider>
            {showPreloader && <TechPreloader onFinish={() => setShowPreloader(false)} />}
            <AppRoutes />
            <AIChatbotWidget />
          </SiteProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
