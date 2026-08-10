import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export const AppLayout = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Persistent left-hand navigation sidebar */}
      <Navbar />

      {/* Page Content area */}
      <div className="flex-grow flex flex-col min-h-screen overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
