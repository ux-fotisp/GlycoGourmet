import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserPreferencesProvider } from './context/UserPreferences';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import RecipeDetails from './pages/RecipeDetails';
import AdminEditor from './pages/AdminEditor';
import Settings from './pages/Settings';
import MyRecipes from './pages/MyRecipes';
import MealPlans from './pages/MealPlans';
import AppLayout from './components/layout/AppLayout';

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <UserPreferencesProvider>
          <Routes>
            {/* Public Routing */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routing */}
            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<Onboarding />} />
              
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/my-recipes" element={<MyRecipes />} />
                <Route path="/meal-plans" element={<MealPlans />} />
                <Route path="/admin" element={<AdminEditor />} />
              </Route>

              <Route path="/recipe/:id" element={<RecipeDetails />} />
            </Route>
          </Routes>
        </UserPreferencesProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
