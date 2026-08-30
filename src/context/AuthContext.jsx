import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEFAULT_SETTINGS = {
  unitSystem: 'imperial',
  glucoseUnit: 'mgdl',
  visualDensity: 'comfortable',
};

const preseedDemoUser = () => {
  const users = JSON.parse(localStorage.getItem('glyco_users') || '{}');
  let changed = false;

  if (!users['demo@glyco.com']) {
    users['demo@glyco.com'] = {
      name: 'Chef Julian', email: 'demo@glyco.com', password: 'demo123', preferences: ['Type 2 Diabetic', 'High Protein', 'Low GI'], onboarded: true, favorites: [], unitSystem: 'imperial', glucoseUnit: 'mgdl', visualDensity: 'comfortable', isApproved: true, roleType: 'admin'
    };
    changed = true;
  }
  if (!users['dietitian@glyco.com']) {
    users['dietitian@glyco.com'] = {
      name: 'Dr. Sarah Chen', email: 'dietitian@glyco.com', password: 'dietitian123', preferences: [], onboarded: true, favorites: [], unitSystem: 'metric', glucoseUnit: 'mmoll', visualDensity: 'comfortable', isApproved: true, roleType: 'dietitian', licenseId: 'RDN-2024-0042', credential: 'RDN', clinicName: 'Glycemic Wellness Center', clientIds: []
    };
    changed = true;
  }
  if (!users['patient@glyco.com']) {
    users['patient@glyco.com'] = {
      name: 'Alex Rivera', email: 'patient@glyco.com', password: 'patient123', preferences: ['Type 1 Diabetic', 'Low GI'], onboarded: true, favorites: [], unitSystem: 'imperial', glucoseUnit: 'mgdl', visualDensity: 'comfortable', isApproved: true, roleType: 'user'
    };
    changed = true;
  }
  if (changed) {
    localStorage.setItem('glyco_users', JSON.stringify(users));
  }
};

const buildSession = (u) => ({
  id: u.id || 1,
  email: u.email,
  name: u.name || u.username,
  preferences: u.preferences || [],
  favorites: u.favorites || [],
  onboarded: u.onboarded || false,
  unitSystem: u.unitSystem || DEFAULT_SETTINGS.unitSystem,
  glucoseUnit: u.glucoseUnit || DEFAULT_SETTINGS.glucoseUnit,
  visualDensity: u.visualDensity || DEFAULT_SETTINGS.visualDensity,
  isApproved: u.isApproved !== undefined ? u.isApproved : true,
  roleType: u.roleType || 'user',
  clientIds: u.clientIds || [],
  licenseId: u.licenseId || null,
  credential: u.credential || null,
  clinicName: u.clinicName || null,
  auditNotes: u.auditNotes || '',
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Expose demo credentials ONLY if explicit flag is set
  // This flag MUST NEVER be true in a deployed environment
  const ENABLE_DEMO_AUTH = import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true';

  useEffect(() => {
    if (ENABLE_DEMO_AUTH) {
      preseedDemoUser();
    }
    refreshUserStatus().finally(() => {
      setIsLoading(false);
    });
  }, []);

  const refreshUserStatus = async () => {
    const token = localStorage.getItem('glyco_jwt');
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
    
    try {
      const res = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const freshData = await res.json();
        const updated = buildSession(freshData);
        setUser(updated);
        setIsAuthenticated(true);
        return updated;
      } else {
        localStorage.removeItem('glyco_jwt');
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }
    } catch (err) {
      console.warn('Unable to refresh user status:', err);
      localStorage.removeItem('glyco_jwt');
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);

    if (ENABLE_DEMO_AUTH) {
      const users = JSON.parse(localStorage.getItem('glyco_users') || '{}');
      const existingUser = users[email.toLowerCase()];

      if (existingUser && existingUser.password === password) {
        const sessionUser = buildSession(existingUser);
        setUser(sessionUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return { success: true };
      }
    }

    try {
      const res = await fetch('/api/auth/local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('glyco_jwt', data.jwt);
        const sessionUser = buildSession(data.user);
        setUser(sessionUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return { success: true };
      } else {
        const errorData = await res.json();
        setIsLoading(false);
        return { success: false, error: errorData.error?.message || 'Invalid email or password.' };
      }
    } catch (err) {
      setIsLoading(false);
      return { success: false, error: 'Network error during login' };
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    const lowerEmail = email.toLowerCase();
    
    try {
      const res = await fetch('/api/auth/local/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: lowerEmail, email: lowerEmail, password, name })
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('glyco_jwt', data.jwt);
        const sessionUser = buildSession(data.user);
        setUser(sessionUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return { success: true };
      } else {
        const errorData = await res.json();
        setIsLoading(false);
        return { success: false, error: errorData.error?.message || 'Registration failed' };
      }
    } catch (err) {
      setIsLoading(false);
      return { success: false, error: 'Network error during registration' };
    }
  };

  const logout = async () => {
    localStorage.removeItem('glyco_jwt');
    setUser(null);
    setIsAuthenticated(false);
  };

  const _persistUser = async (updatedFields) => {
    if (!user) return;
    
    const optimisticUser = { ...user, ...updatedFields };
    setUser(optimisticUser);
    
    if (ENABLE_DEMO_AUTH && !localStorage.getItem('glyco_jwt')) {
      return;
    }

    const token = localStorage.getItem('glyco_jwt');
    if (!token) return;

    try {
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields)
      });
    } catch (err) {
      console.warn('Failed to persist user fields to Strapi:', err);
    }
  };

  const setPreferences = (prefs) => {
    _persistUser({ preferences: prefs, onboarded: true });
  };

  const setSettings = ({ unitSystem, glucoseUnit, visualDensity }) => {
    const updates = {};
    if (unitSystem !== undefined) updates.unitSystem = unitSystem;
    if (glucoseUnit !== undefined) updates.glucoseUnit = glucoseUnit;
    if (visualDensity !== undefined) updates.visualDensity = visualDensity;
    if (Object.keys(updates).length > 0) _persistUser(updates);
  };

  const addFavorite = (recipeId) => {
    if (!user || !recipeId) return;
    const currentFavs = user.favorites || [];
    if (currentFavs.includes(recipeId)) return;
    _persistUser({ favorites: [...currentFavs, recipeId] });
  };

  const removeFavorite = (recipeId) => {
    if (!user) return;
    const favorites = (user.favorites || []).filter((id) => id !== recipeId);
    _persistUser({ favorites });
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
        refreshUserStatus,
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
