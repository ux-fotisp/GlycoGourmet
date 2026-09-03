import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const UserPreferencesContext = createContext(null);

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  careReminders: {
    enabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
  },
  promotedDietitians: {
    enabled: false,
    frequencyCap: 'weekly',
  },
};

export const UserPreferencesProvider = ({ children }) => {
  const { user, setSettings } = useAuth();

  // Use local state, default to US standard + comfortable view + clinical targets
  const [unitSystem, setUnitSystemState] = useState('imperial');
  const [glucoseUnit, setGlucoseUnitState] = useState('mgdl');
  const [visualDensity, setVisualDensityState] = useState('comfortable');
  const [dailyGlTarget, setDailyGlTargetState] = useState(45);
  const [maxNetCarbsPerMeal, setMaxNetCarbsPerMealState] = useState(30);
  const [targetDailyCalories, setTargetDailyCaloriesState] = useState(2000);
  const [diabeticProfiles, setDiabeticProfilesState] = useState(['T2D']);
  const [dietaryRestrictions, setDietaryRestrictionsState] = useState(['Gluten-Free']);
  const [notificationPreferences, setNotificationPreferencesState] = useState(DEFAULT_NOTIFICATION_PREFERENCES);

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
        if (parsed.notificationPreferences) {
          setNotificationPreferencesState({
            ...DEFAULT_NOTIFICATION_PREFERENCES,
            ...parsed.notificationPreferences,
            careReminders: {
              ...DEFAULT_NOTIFICATION_PREFERENCES.careReminders,
              ...(parsed.notificationPreferences.careReminders || {}),
            },
            promotedDietitians: {
              ...DEFAULT_NOTIFICATION_PREFERENCES.promotedDietitians,
              ...(parsed.notificationPreferences.promotedDietitians || {}),
            },
          });
        }
      }
    } catch (_e) {
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
    } catch (_e) {
      // ignore storage error
    }
  };

  const setUnitSystem = (val) => {
    setUnitSystemState(val);
    saveToStorage({ unitSystem: val });
    if (user && setSettings) setSettings({ unitSystem: val });
  };

  const setGlucoseUnit = (val) => {
    setGlucoseUnitState(val);
    saveToStorage({ glucoseUnit: val });
    if (user && setSettings) setSettings({ glucoseUnit: val });
  };

  const setVisualDensity = (val) => {
    setVisualDensityState(val);
    saveToStorage({ visualDensity: val });
    if (user && setSettings) setSettings({ visualDensity: val });
  };

  const setDailyGlTarget = (val) => {
    const num = Math.max(1, Number(val) || 45);
    setDailyGlTargetState(num);
    saveToStorage({ dailyGlTarget: num });
    if (user && setSettings) setSettings({ dailyGlTarget: num });
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

  const setNotificationPreferences = (prefs) => {
    const updated = typeof prefs === 'function' ? prefs(notificationPreferences) : prefs;
    const merged = {
      ...notificationPreferences,
      ...updated,
    };
    setNotificationPreferencesState(merged);
    saveToStorage({ notificationPreferences: merged });

    // Live Strapi persistence attempt with graceful local fallback
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('glyco_jwt') : null;
      if (merged.careReminders) {
        fetch('/api/notification-preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            data: {
              category: 'care_reminders',
              enabled: merged.careReminders.enabled !== false,
              quietHoursStart: merged.careReminders.quietHoursStart || '22:00',
              quietHoursEnd: merged.careReminders.quietHoursEnd || '07:00',
            },
          }),
        }).catch(() => {});
      }
      if (merged.promotedDietitians) {
        fetch('/api/notification-preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            data: {
              category: 'promoted_dietitians',
              enabled: !!merged.promotedDietitians.enabled,
              frequencyCap: merged.promotedDietitians.frequencyCap || 'weekly',
            },
          }),
        }).catch(() => {});
      }
    } catch (_e) {
      // Graceful fallback
    }
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
    if (settings.notificationPreferences !== undefined) setNotificationPreferencesState(settings.notificationPreferences);

    saveToStorage(settings);
    if (user && setSettings) setSettings(settings);
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
        notificationPreferences,
        setUnitSystem,
        setGlucoseUnit,
        setVisualDensity,
        setDailyGlTarget,
        setMaxNetCarbsPerMeal,
        setTargetDailyCalories,
        setDiabeticProfiles,
        setDietaryRestrictions,
        setNotificationPreferences,
        setSettings: updateAllSettings,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    return {
      unitSystem: 'imperial',
      glucoseUnit: 'mgdl',
      visualDensity: 'comfortable',
      dailyGlTarget: 45,
      maxNetCarbsPerMeal: 30,
      targetDailyCalories: 2000,
      diabeticProfiles: ['T2D'],
      dietaryRestrictions: ['Gluten-Free'],
      notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
      setUnitSystem: () => {},
      setGlucoseUnit: () => {},
      setVisualDensity: () => {},
      setDailyGlTarget: () => {},
      setMaxNetCarbsPerMeal: () => {},
      setTargetDailyCalories: () => {},
      setDiabeticProfiles: () => {},
      setDietaryRestrictions: () => {},
      setNotificationPreferences: () => {},
      setSettings: () => {},
    };
  }
  return context;
};

export default UserPreferencesContext;