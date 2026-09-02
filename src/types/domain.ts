/**
 * GlycoGourmet OOUX Entity Multiplicity Matrix:
 * - Clinic : DietitianUser = 1 : N (Tenant manages multiple clinicians)
 * - Clinic : ClientProfile = 1 : N (Tenant scopes client records)
 * - DietitianUser : ClientProfile = 1 : N (Dietitian manages assigned client profiles)
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
  Allergen,
  DietaryTag,
  RecipeStep,
  MacroNutrients,
  IngredientPayload,
  RecipeIngredientItem,
  MetabolicProfileResult,
} from '../services/metabolicEngine';

// Re-export core metabolic interfaces for platform-wide consumption
export type {
  Allergen,
  DietaryTag,
  RecipeStep,
  MacroNutrients,
  IngredientPayload,
  RecipeIngredientItem,
  MetabolicProfileResult,
};

// ---------------------------------------------------------------------------
// Domain-Level Type Aliases
// ---------------------------------------------------------------------------

/** Alias: the per-serving macro breakdown produced by the metabolic engine. */
export type MacronutrientProfile = MetabolicProfileResult;

/** Alias: a single ingredient payload from the metabolic engine. */
export type Ingredient = IngredientPayload;

// ---------------------------------------------------------------------------
// 0. Multi-Tenant Clinic Administration & Collaboration
// ---------------------------------------------------------------------------

export type ClinicTier = 'INDEPENDENT' | 'CLINIC_PRO' | 'ENTERPRISE';

export type SharingScope = 'PRIVATE' | 'CLINIC_SHARED';

export interface Clinic {
  id: string;
  name: string;
  tier: ClinicTier;
  activeSeats: number;
  dietitianIds?: string[];
  clientProfileIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

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
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  mealOccasion?: MealOccasion;
  ingredients: RecipeIngredientItem[];
  instructions?: string[];
  steps?: RecipeStep[];
  allergens?: Allergen[];
  dietaryTags?: DietaryTag[];
  sodiumMg?: number;
  cholesterolMg?: number;
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

export type UserRole =
  | 'user'
  | 'dietitian'
  | 'clinic_admin'
  | 'admin'
  | 'super_admin';

export interface User {
  id: string;
  email: string;
  username?: string;
  roleType: UserRole;
  role?: UserRole;
  isApproved: boolean;
  onboarded: boolean;
  clinicId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientUser {
  id: string;
  email: string;
  username?: string;
  roleType: 'user';
  isApproved: boolean;
  onboarded: boolean;
  dietitianId?: string;
  clientProfileId?: string;
  clinicId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DietitianUser {
  id: string;
  email: string;
  username?: string;
  roleType: 'dietitian' | 'clinic_admin' | 'admin' | 'super_admin';
  isApproved: boolean;
  onboarded: boolean;
  licenseId?: string;
  credential?: 'RDN' | 'CDCES' | 'LDN' | 'MD';
  clinicName?: string;
  clinicId?: string;
  clientIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ClinicAdminUser {
  id: string;
  email: string;
  username?: string;
  roleType: 'clinic_admin';
  isApproved: boolean;
  onboarded: boolean;
  clinicId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientProfile {
  id: string;
  dietitianId: string;
  patientUserId: string;
  clinicId?: string;
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
  insulinSensitivityFactor?: number; // ISF (1 U insulin drops BG by X mg/dL)
  carbToInsulinRatio?: number;       // CIR (1 U insulin covers X grams of net carbs)
  targetPreMealGlucose?: number;     // Target pre-meal blood glucose (mg/dL)
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
  clinicId?: string;
  authorName?: string;
  sharingScope?: SharingScope;
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

export interface MealPlanTemplate {
  id: string;
  clinicId: string;
  title: string;
  description?: string;
  authorDietitianId: string;
  authorName: string;
  targetSubtype?: DiabeticSubtype;
  sharingScope: SharingScope;
  avgDailyGL: number;
  scheduledSlots: {
    [day in DayOfWeek]?: Partial<Record<OccasionType, string>>;
  };
  createdAt?: string;
  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// 4. Rule-Based Smart Low-GI Substitutions
// ---------------------------------------------------------------------------

export interface SmartSwapRule {
  id: string;
  clientId?: string;
  clinicId?: string;
  sourceIngredientId: string;
  targetIngredientId: string;
  sourceIngredientName?: string;
  targetIngredientName?: string;
  scope: 'all-plans' | string; // 'all-plans' or specific PrescribedMealPlan ID
  sharingScope?: SharingScope; // 'PRIVATE' | 'CLINIC_SHARED'
  authorName?: string;
  authorDietitianId?: string;
  deltaGL?: number;
  reason?: string;
  createdByDietitianId: string;
  createdAt?: string;
}


// ---------------------------------------------------------------------------
// 5. Recipe Ingredient Provenance & Completeness Foundation (Phase 7)
// ---------------------------------------------------------------------------

export type IngredientProvenanceSource =
  | 'internal_verified'
  | 'usda_fooddata_central'
  | 'user_entered'
  | 'needs_review';

export type GiEvidenceStatus =
  | 'available'
  | 'unavailable'
  | 'not_applicable'
  | 'needs_review';

export type LineValidationStatus =
  | 'complete'
  | 'incomplete'
  | 'needs_review';

export type RecipeCompletenessStatus =
  | 'complete'
  | 'estimated'
  | 'incomplete';

export interface IngredientNutritionPer100g {
  energyKcal: number;
  carbohydrateG: number;
  fiberG: number;
  proteinG: number;
  fatG: number;
  sugarsG?: number;
  sodiumMg?: number;
}

export interface ProvenanceReadyRecipeIngredientLine {
  id: string;
  ingredientId?: string;
  fdcId?: number | string;
  displayName: string;

  quantity: number;
  unit: string;
  normalizedGrams: number | null;

  source: IngredientProvenanceSource;
  sourceRetrievedAt?: string;
  sourceVersion?: string;

  nutritionPer100g?: IngredientNutritionPer100g;

  glycemicIndex?: number | null;
  giEvidenceStatus: GiEvidenceStatus;

  isFallbackId?: boolean;

  validation: {
    status: LineValidationStatus;
    reasons: string[];
  };
}

export interface RecipeNutritionCompletenessResult {
  status: RecipeCompletenessStatus;
  missingNutritionLines: string[];
  missingGiLines: string[];
  warnings: string[];
  canCalculateNutrition: boolean;
  canCalculateGl: boolean;
}
// Aliases for Phase 7 Chunk 1 Contract Consistency
export type IngredientSource = IngredientProvenanceSource;
export type CoreNutritionPer100g = IngredientNutritionPer100g;
export type LineValidation = {
  status: LineValidationStatus;
  reasons: string[];
};
export type RecipeCompletenessEvaluation = RecipeNutritionCompletenessResult;
