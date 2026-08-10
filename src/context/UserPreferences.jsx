import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const UserPreferencesContext = createContext(null);

export const UserPreferencesProvider = ({ children }) => {
  const { user, setSettings } = useAuth();

  // Use local state, default to US standard + comfortable view
  const [unitSystem, setUnitSystemState] = useState('imperial');
  const [glucoseUnit, setGlucoseUnitState] = useState('mgdl');
  const [visualDensity, setVisualDensityState] = useState('comfortable');

  // Synchronize state with current active session
  useEffect(() => {
    if (user) {
      setUnitSystemState(user.unitSystem || 'imperial');
      setGlucoseUnitState(user.glucoseUnit || 'mgdl');
      setVisualDensityState(user.visualDensity || 'comfortable');
    }
  }, [user]);

  const setUnitSystem = (val) => {
    setUnitSystemState(val);
    if (user) {
      setSettings({ unitSystem: val });
    }
  };

  const setGlucoseUnit = (val) => {
    setGlucoseUnitState(val);
    if (user) {
      setSettings({ glucoseUnit: val });
    }
  };

  const setVisualDensity = (val) => {
    setVisualDensityState(val);
    if (user) {
      setSettings({ visualDensity: val });
    }
  };

  const updateAllSettings = (settings) => {
    if (settings.unitSystem !== undefined) setUnitSystemState(settings.unitSystem);
    if (settings.glucoseUnit !== undefined) setGlucoseUnitState(settings.glucoseUnit);
    if (settings.visualDensity !== undefined) setVisualDensityState(settings.visualDensity);
    
    if (user) {
      setSettings(settings);
    }
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        unitSystem,
        glucoseUnit,
        visualDensity,
        setUnitSystem,
        setGlucoseUnit,
        setVisualDensity,
        setSettings: updateAllSettings
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a UserPreferencesProvider');
  }
  return context;
};

export default UserPreferencesContext;
