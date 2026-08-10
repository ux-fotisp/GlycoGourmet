import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Onboarding from '../pages/Onboarding';
import Dashboard from '../pages/Dashboard';
import RecipeDetails from '../pages/RecipeDetails';
import AdminEditor from '../pages/AdminEditor';
import Settings from '../pages/Settings';
import MyRecipes from '../pages/MyRecipes';
import MealPlans from '../pages/MealPlans';

/**
 * AppRoutes — React Router v7 Navigation Hierarchy & Route Map
 *
 * Configures:
 * - Public routes: /login, /register
 * - Protected routes: /onboarding, /recipe/:id
 * - AppLayout routes: / (Dashboard), /recipes (All Recipes Discovery Catalog), /my-recipes, /meal-plans, /settings, /admin
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Main Application Layout Wrapper */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/recipes" element={<Dashboard />} />
          <Route path="/recipes/all" element={<Dashboard />} />
          <Route path="/recipes/mine" element={<MyRecipes />} />
          <Route path="/my-recipes" element={<MyRecipes />} />
          <Route path="/meal-plans" element={<MealPlans />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminEditor />} />
          <Route path="/admin-editor/:id?" element={<AdminEditor />} />
        </Route>

        {/* Full Viewport Recipe Details */}
        <Route path="/recipe/:id" element={<RecipeDetails />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
