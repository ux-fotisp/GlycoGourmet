import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Onboarding from '../pages/Onboarding';
import Dashboard from '../pages/Dashboard';
import RecipeDetails from '../pages/RecipeDetails';
import AdminEditor from '../pages/AdminEditor';
import AdminDashboard from '../pages/AdminDashboard';
import DraftAuditQueue from '../pages/DraftAuditQueue';
import Settings from '../pages/Settings';
import MyRecipes from '../pages/MyRecipes';
import MealPlans from '../pages/MealPlans';
import PendingApproval from '../pages/PendingApproval';

/**
 * AppRoutes — React Router Navigation Hierarchy & Route Map
 *
 * Configures:
 * - Public routes: /login, /register
 * - Base Protected routes: /onboarding, /pending-approval, /recipe/:id
 * - Permission-Gated routes: /recipes/mine, /meal-plans, /admin-editor, /admin, /admin/audit-queue
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Base Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/pending-approval" element={<PendingApproval />} />

        {/* Main Application Layout Wrapper */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/recipes" element={<Dashboard />} />
          <Route path="/recipes/all" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />

          {/* Feature-Gated Protected Routes */}
          <Route element={<ProtectedRoute requiredPermission="canCreateDrafts" />}>
            <Route path="/recipes/mine" element={<MyRecipes />} />
            <Route path="/my-recipes" element={<MyRecipes />} />
            <Route path="/meal-plans" element={<MealPlans />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin-editor/:id?" element={<AdminEditor />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="canPublishPublic" />}>
            <Route path="/admin/audit-queue" element={<DraftAuditQueue />} />
          </Route>
        </Route>

        {/* Full Viewport Recipe Details */}
        <Route path="/recipe/:id" element={<RecipeDetails />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
