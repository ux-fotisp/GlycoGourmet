import React from 'react';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserPreferencesProvider } from './context/UserPreferences';
import AppRoutes from './routes/AppRoutes';
import PwaUpdater from './components/common/PwaUpdater';
import NetworkStatusToast from './components/common/NetworkStatusToast';

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <UserPreferencesProvider>
          <AppRoutes />
          <PwaUpdater />
          <NetworkStatusToast />
        </UserPreferencesProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
