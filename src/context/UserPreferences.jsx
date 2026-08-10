import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const UserPreferencesContext = createContext(null);

export const UserPreferencesProvider = ({ children }) => {
  const { user, setSettings } = useAuth();

  // Use local state, default to US standard + comfortable view + clinical targets
  const [unitSystem, setUnitSystemState] = useState('imperial');
  const [glucoseUnit, setGlucoseUnitState] = useState('mgdl');
  const [visualDensity, setVisualDensityState] = useState('comfortable');
  const [dailyGlTarget, setDailyGlTargetState] = useState(45);
  const [maxNetCarbsPerMeal, setMaxNetCarbsPerMealState] = useState(30);
  const [targetDailyCalories, setTargetDailyCaloriesState] = useState(2000);
  const [diabeticProfiles, setDiabeticProfilesState] = useState(['Type 2']);
  const [dietaryRestrictions, setDietaryRestrictionsState] = useState(['Gluten-Free']);

  // Synchronize state with current active session or localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('glyco_user_preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.unitSystem) setUnitSystemState(parsed.unitSystem);
        if (parsed.glucoseUnit) setGlucoseUnitState(parsed.glucoseUnit);
        if (parsed.visualDensity) setVisualDensityState(parsed.visualDensity);
        if (parsed.dailyGlTarget) setDailyGlTargetState(parsed.dailyGlTarget);
        if (parsed.maxNetCarbsPerMeal) setMaxNetCarbsPerMealState(parsed.maxNetCarbsPerMeal);
        if (parsed.targetDailyCalories) setTargetDailyCaloriesState(parsed.targetDailyCalories);
        if (parsed.diabeticProfiles) setDiabeticProfilesState(parsed.diabeticProfiles);
        if (parsed.dietaryRestrictions) setDietaryRestrictionsState(parsed.dietaryRestrictions);
      }
    } catch (e) {
      // ignore JSON parse fallback
    }

    if (user) {
      if (user.unitSystem) setUnitSystemState(user.unitSystem);
      if (user.glucoseUnit) setGlucoseUnitState(user.glucoseUnit);
      if (user.visualDensity) setVisualDensityState(user.visualDensity);
      if (user.dailyGlTarget) setDailyGlTargetState(user.dailyGlTarget);
    }
  }, [user]);

  const saveToStorage = (updated) => {
    try {
      const current = JSON.parse(localStorage.getItem('glyco_user_preferences') || '{}');
      const merged = { ...current, ...updated };
      localStorage.setItem('glyco_user_preferences', JSON.stringify(merged));
    } catch (e) {
      // ignore storage error
    }
  };

  const setUnitSystem = (val) => {
    setUnitSystemState(val);
    saveToStorage({ unitSystem: val });
    if (user) setSettings({ unitSystem: val });
  };

  const setGlucoseUnit = (val) => {
    setGlucoseUnitState(val);
    saveToStorage({ glucoseUnit: val });
    if (user) setSettings({ glucoseUnit: val });
  };

  const setVisualDensity = (val) => {
    setVisualDensityState(val);
    saveToStorage({ visualDensity: val });
    if (user) setSettings({ visualDensity: val });
  };

  const setDailyGlTarget = (val) => {
    const num = Math.max(1, Number(val) || 45);
    setDailyGlTargetState(num);
    saveToStorage({ dailyGlTarget: num });
    if (user) setSettings({ dailyGlTarget: num });
  };

  const setMaxNetCarbsPerMeal = (val) => {
    const num = Math.max(1, Number(val) || 30);
    setMaxNetCarbsPerMealState(num);
    saveToStorage({ maxNetCarbsPerMeal: num });
  };

  const setTargetDailyCalories = (val) => {
    const num = Math.max(1, Number(val) || 2000);
    setTargetDailyCaloriesState(num);
    saveToStorage({ targetDailyCalories: num });
  };

  const setDiabeticProfiles = (profiles) => {
    setDiabeticProfilesState(profiles);
    saveToStorage({ diabeticProfiles: profiles });
  };

  const setDietaryRestrictions = (restrictions) => {
    setDietaryRestrictionsState(restrictions);
    saveToStorage({ dietaryRestrictions: restrictions });
  };

  const updateAllSettings = (settings) => {
    if (settings.unitSystem !== undefined) setUnitSystemState(settings.unitSystem);
    if (settings.glucoseUnit !== undefined) setGlucoseUnitState(settings.glucoseUnit);
    if (settings.visualDensity !== undefined) setVisualDensityState(settings.visualDensity);
    if (settings.dailyGlTarget !== undefined) setDailyGlTargetState(settings.dailyGlTarget);
    if (settings.maxNetCarbsPerMeal !== undefined) setMaxNetCarbsPerMealState(settings.maxNetCarbsPerMeal);
    if (settings.targetDailyCalories !== undefined) setTargetDailyCaloriesState(settings.targetDailyCalories);
    if (settings.diabeticProfiles !== undefined) setDiabeticProfilesState(settings.diabeticProfiles);
    if (settings.dietaryRestrictions !== undefined) setDietaryRestrictionsState(settings.dietaryRestrictions);

    saveToStorage(settings);
    if (user) setSettings(settings);
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        unitSystem,
        glucoseUnit,
        visualDensity,
        dailyGlTarget,
        maxNetCarbsPerMeal,
        targetDailyCalories,
        diabeticProfiles,
        dietaryRestrictions,
        setUnitSystem,
        setGlucoseUnit,
        setVisualDensity,
        setDailyGlTarget,
        setMaxNetCarbsPerMeal,
        setTargetDailyCalories,
        setDiabeticProfiles,
        setDietaryRestrictions,
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
