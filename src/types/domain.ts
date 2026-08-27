/**
 * GlycoGourmet OOUX Entity Multiplicity Matrix:
 * - DietitianUser : ClientProfile = 1 : N (Dietitian manages multiple client profiles)
 * - ClientProfile : PatientUser = 1 : 1 (Patient is the subject of the profile)
 * - ClientProfile : MetabolicTargetCalibration = 1 : 1 (Active clinical target & bolus offset)
 * - ClientProfile : PrescribedMealPlan = 1 : 1 active (One live 7-day plan; historical archived)
 * - PrescribedMealPlan : ScheduledSlot = 1 : N (Up to 6 occasions x 7 days = 42 addressable slots)
 * - Recipe : Ingredient = N : M (Composite ingredient junction with prep states)
 * - Ingredient : Ingredient (swap) = 1 : N (Clinical low-GI alternatives)
 * - Recipe : AuditRecord = 1 : 0..1 (Discrepancy audit for claimed vs. USDA truth)
 * - ClientProfile : SmartSwapRule = 1 : N (Dietitian-defined auto-substitution rules)
 */

import type {
  MacroNutrients,
  IngredientPayload,
  RecipeIngredientItem,
  MetabolicProfileResult,
} from '../services/metabolicEngine';

// Re-export core metabolic interfaces for platform-wide consumption
export type {
  MacroNutrients,
  IngredientPayload,
  RecipeIngredientItem,
  MetabolicProfileResult,
};

// ---------------------------------------------------------------------------
// Domain-Level Type Aliases
// ---------------------------------------------------------------------------
// The metabolic engine uses concrete names (MacroNutrients, IngredientPayload,
// MetabolicProfileResult). We provide semantic aliases so domain consumers can
// reference them by their OOUX role without coupling to engine naming.
// ---------------------------------------------------------------------------

/** Alias: the per-serving macro breakdown produced by the metabolic engine. */
export type MacronutrientProfile = MetabolicProfileResult;

/** Alias: a single ingredient payload from the metabolic engine. */
export type Ingredient = IngredientPayload;

// ---------------------------------------------------------------------------
// Prep-State & Audit Record
// ---------------------------------------------------------------------------

/**
 * Canonical thermal/mechanical preparation states recognised by the
 * deterministic metabolic engine's GI multiplier table.
 */
export type ThermalPrepState =
  | 'raw'
  | 'steamed'
  | 'sauteed'
  | 'roasted'
  | 'boiled'
  | 'mashed_processed'
  | 'cooled';

/**
 * Discrepancy audit for a recipe: claimed nutritional values vs. USDA
 * ground-truth recalculation by the metabolic engine.
 */
export interface AuditRecord {
  recipeId: string;
  claimedGL: number;
  calculatedGL: number;
  deltaGL: number;
  claimedNetCarbs: number;
  calculatedNetCarbs: number;
  deltaNetCarbs: number;
  flagged: boolean;
  auditedAt: string;
  auditedByDietitianId?: string;
}

/**
 * Full recipe aggregate combining metadata, ingredient list, and metabolic
 * profile. Extends the engine's RecipeIngredientItem[] with presentation &
 * planning fields.
 */
export interface Recipe {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  servings: number;
  mealOccasion?: MealOccasion;
  ingredients: RecipeIngredientItem[];
  instructions?: string[];
  metabolicProfile?: MacronutrientProfile;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// 1. User Discriminators & Client Profiles
// ---------------------------------------------------------------------------

export type MealOccasion =
  | 'breakfast'
  | 'brunch'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'dessert';

export type DiabeticSubtype =
  | 'T1D'
  | 'T2D'
  | 'GDM'
  | 'Prediabetes'
  | 'InsulinResistance';

export interface PatientUser {
  id: string;
  email: string;
  username?: string;
  roleType: 'user';
  isApproved: boolean;
  onboarded: boolean;
  dietitianId?: string;
  clientProfileId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DietitianUser {
  id: string;
  email: string;
  username?: string;
  roleType: 'dietitian' | 'admin';
  isApproved: boolean;
  onboarded: boolean;
  licenseId?: string;
  credential?: 'RDN' | 'CDCES' | 'LDN' | 'MD';
  clinicName?: string;
  clientIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientProfile {
  id: string;
  dietitianId: string;
  patientUserId: string;
  diabeticSubtype: DiabeticSubtype;
  dietaryRestrictions: string[];
  status: 'active' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// 2. Clinical Target Calibration
// ---------------------------------------------------------------------------

export interface MetabolicTargetCalibration {
  clientId: string;
  glTargetDaily: number;            // Target Daily GL Budget (e.g., 45-60 GL/day)
  bolusOffsetMinutes: number;        // Pre-meal bolus timing offset (e.g., 15-30 min)
  netCarbCapDaily?: number;          // Optional daily net carbohydrate cap (grams)
  calorieBudgetDaily?: number;       // Optional daily calorie target
  glucoseUnit?: 'mg/dL' | 'mmol/L';
  updatedAt: string;
  updatedByDietitianId: string;
}

// ---------------------------------------------------------------------------
// 3. Prescribed 7-Day Meal Planning & Scheduling
// ---------------------------------------------------------------------------

export type OccasionType =
  | 'breakfast'
  | 'brunch'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'dessert';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface PrescribedMealPlan {
  id: string;
  clientId: string;
  dietitianId: string;
  weekStartDate: string; // ISO Date YYYY-MM-DD
  scheduledSlots: {
    [day in DayOfWeek]?: Partial<Record<OccasionType, string>>; // Maps to Recipe ID
  };
  cumulativeDailyGL: {
    [day in DayOfWeek]?: number;
  };
  cumulativeDailyNetCarbs: {
    [day in DayOfWeek]?: number;
  };
  status?: 'draft' | 'active' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// 4. Rule-Based Smart Low-GI Substitutions
// ---------------------------------------------------------------------------

export interface SmartSwapRule {
  id: string;
  clientId: string;
  sourceIngredientId: string;
  targetIngredientId: string;
  scope: 'all-plans' | string; // 'all-plans' or specific PrescribedMealPlan ID
  reason?: string;
  createdByDietitianId: string;
  createdAt?: string;
}
