import React from 'react';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserPreferencesProvider } from './context/UserPreferences';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <UserPreferencesProvider>
          <AppRoutes />
        </UserPreferencesProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
