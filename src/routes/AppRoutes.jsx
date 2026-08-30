import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Onboarding from '../pages/Onboarding';
import Dashboard from '../pages/Dashboard';
import RecipeDetails from '../pages/RecipeDetails';
import AmbientCookMode from '../pages/AmbientCookMode';
import AdminEditor from '../pages/AdminEditor';
import AdminDashboard from '../pages/AdminDashboard';
import DraftAuditQueue from '../pages/DraftAuditQueue';
import Settings from '../pages/Settings';
import MyRecipes from '../pages/MyRecipes';
import MealPlans from '../pages/MealPlans';
import GroceryList from '../pages/GroceryList';
import PendingApproval from '../pages/PendingApproval';
import ClientRoster from '../pages/ClientRoster';
import PlanBuilder from '../pages/PlanBuilder';
import ClinicDashboard from '../pages/ClinicDashboard';
import ClinicLibrary from '../pages/ClinicLibrary';

/**
 * AppRoutes — React Router Navigation Hierarchy & Route Map
 *
 * Configures:
 * - Public routes: /login, /register
 * - Base Protected routes: /onboarding, /pending-approval, /recipe/:id/cook
 * - AppLayout Protected routes: /recipes, /recipe/:id, /grocery-list, /meal-plans, /client-roster, etc.
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

        {/* Full-Screen Ambient Cook Mode (Standalone kitchen layout) */}
        <Route path="/recipe/:id/cook" element={<AmbientCookMode />} />

        {/* Main Application Layout Wrapper */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/recipes" element={<Dashboard />} />
          <Route path="/recipes/all" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/grocery-list" element={<GroceryList />} />

          {/* Recipe Details */}
          <Route path="/recipe/:id" element={<RecipeDetails />} />

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

          {/* Dietitian Clinical Workspace Routes */}
          <Route element={<ProtectedRoute requiredPermission="canManageClients" />}>
            <Route path="/client-roster" element={<ClientRoster />} />
            <Route path="/client/:id/plan-builder" element={<PlanBuilder />} />
            <Route path="/clinic-library" element={<ClinicLibrary />} />
          </Route>

          {/* Clinic Admin Multi-Tenant Workspace Route */}
          <Route element={<ProtectedRoute requiredPermission="canManageClinic" />}>
            <Route path="/clinic-dashboard" element={<ClinicDashboard />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
