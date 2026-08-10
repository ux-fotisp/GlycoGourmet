import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Default localization + accessibility preferences
const DEFAULT_SETTINGS = {
  unitSystem: 'imperial',      // 'imperial' | 'metric'
  glucoseUnit: 'mgdl',         // 'mgdl' | 'mmoll'
  visualDensity: 'comfortable', // 'comfortable' | 'compact'
  favorites: [],
  onboarded: false,
};

// Pre-seed demo user in localStorage if not exists
const preseedDemoUser = () => {
  const users = JSON.parse(localStorage.getItem('glyco_users') || '{}');
  if (!users['demo@glyco.com']) {
    users['demo@glyco.com'] = {
      name: 'Chef Julian',
      email: 'demo@glyco.com',
      password: 'demo123',
      preferences: ['Type 2 Diabetic', 'High Protein', 'Low GI'],
      onboarded: true,
      favorites: [],
      unitSystem: 'imperial',
      glucoseUnit: 'mgdl',
      visualDensity: 'comfortable',
    };
    localStorage.setItem('glyco_users', JSON.stringify(users));
  }
};

// Build a clean session object from a stored user record
const buildSession = (u) => ({
  name: u.name,
  email: u.email,
  preferences: u.preferences || [],
  onboarded: u.onboarded !== undefined ? u.onboarded : true,
  favorites: u.favorites || [],
  unitSystem: u.unitSystem || DEFAULT_SETTINGS.unitSystem,
  glucoseUnit: u.glucoseUnit || DEFAULT_SETTINGS.glucoseUnit,
  visualDensity: u.visualDensity || DEFAULT_SETTINGS.visualDensity,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    preseedDemoUser();
    const activeSession = localStorage.getItem('glyco_session');
    if (activeSession) {
      try {
        const userData = JSON.parse(activeSession);
        // Backfill any missing fields for sessions created before this update
        const hydrated = { ...DEFAULT_SETTINGS, ...userData };
        setUser(hydrated);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('glyco_session');
      }
    }
    setIsLoading(false);
  }, []);

  // --- Swappable Adapters Placeholder ---
  // Replace below with Firebase / JWT calls to connect a real backend.

  const login = async (email, password) => {
    setIsLoading(true);
    const users = JSON.parse(localStorage.getItem('glyco_users') || '{}');
    const existingUser = users[email.toLowerCase()];

    if (existingUser && existingUser.password === password) {
      const sessionUser = buildSession(existingUser);
      localStorage.setItem('glyco_session', JSON.stringify(sessionUser));
      setUser(sessionUser);
      setIsAuthenticated(true);
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: 'Invalid email or password. Hint: Try demo@glyco.com / demo123' };
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    const users = JSON.parse(localStorage.getItem('glyco_users') || '{}');
    const lowerEmail = email.toLowerCase();

    if (users[lowerEmail]) {
      setIsLoading(false);
      return { success: false, error: 'User already exists' };
    }

    const newUser = {
      name,
      email: lowerEmail,
      password,
      preferences: [],
      onboarded: false,
      favorites: [],
      unitSystem: DEFAULT_SETTINGS.unitSystem,
      glucoseUnit: DEFAULT_SETTINGS.glucoseUnit,
      visualDensity: DEFAULT_SETTINGS.visualDensity,
    };

    users[lowerEmail] = newUser;
    localStorage.setItem('glyco_users', JSON.stringify(users));

    const sessionUser = buildSession(newUser);
    localStorage.setItem('glyco_session', JSON.stringify(sessionUser));
    setUser(sessionUser);
    setIsAuthenticated(true);
    setIsLoading(false);
    return { success: true };
  };

  const logout = async () => {
    localStorage.removeItem('glyco_session');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Save dietary preference selections + mark onboarding complete
  const setPreferences = (prefs) => {
    if (!user) return;
    const updatedUser = { ...user, preferences: prefs, onboarded: true };
    _persistUser(updatedUser);
  };

  // Save all localization + accessibility settings at once
  const setSettings = ({ unitSystem, glucoseUnit, visualDensity }) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      ...(unitSystem !== undefined && { unitSystem }),
      ...(glucoseUnit !== undefined && { glucoseUnit }),
      ...(visualDensity !== undefined && { visualDensity }),
    };
    _persistUser(updatedUser);
  };

  // Auto-favorite a recipe by ID (called immediately on Admin publish)
  const addFavorite = (recipeId) => {
    if (!user || !recipeId) return;
    const currentFavs = user.favorites || [];
    if (currentFavs.includes(recipeId)) return; // idempotent
    const updatedUser = { ...user, favorites: [...currentFavs, recipeId] };
    _persistUser(updatedUser);
  };

  const removeFavorite = (recipeId) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      favorites: (user.favorites || []).filter((id) => id !== recipeId),
    };
    _persistUser(updatedUser);
  };

  // Internal: write updated user to both session and user store
  const _persistUser = (updatedUser) => {
    localStorage.setItem('glyco_session', JSON.stringify(updatedUser));
    const users = JSON.parse(localStorage.getItem('glyco_users') || '{}');
    if (users[updatedUser.email]) {
      users[updatedUser.email] = {
        ...users[updatedUser.email],
        preferences: updatedUser.preferences,
        onboarded: updatedUser.onboarded,
        favorites: updatedUser.favorites,
        unitSystem: updatedUser.unitSystem,
        glucoseUnit: updatedUser.glucoseUnit,
        visualDensity: updatedUser.visualDensity,
      };
      localStorage.setItem('glyco_users', JSON.stringify(users));
    }
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        setPreferences,
        setSettings,
        addFavorite,
        removeFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
