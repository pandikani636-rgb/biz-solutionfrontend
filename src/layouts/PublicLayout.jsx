import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const PublicLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-pageBg">
      <Navbar />
      <main key={location.pathname} className="flex-1 animate-fadeIn">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
