import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import OfflineBanner from '../ui/OfflineBanner';

export const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Offline Connectivity Status Bar */}
      <OfflineBanner />

      <div className="flex flex-col md:flex-row flex-grow min-h-screen">
        {/* Persistent left-hand navigation sidebar */}
        <Navbar />

        {/* Page Content area */}
        <div className="flex-grow flex flex-col min-h-screen overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
