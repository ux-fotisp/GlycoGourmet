// src/utils/clientStore.js
/**
 * Client & Tenant Management Store - LocalStorage fallback for Multi-Tenant Clinic Administration & Asset Collaboration
 */

// Mock Clinic Tenant Record
export const mockClinic = {
  id: 'clinic-glycemic-wellness',
  name: 'Glycemic Wellness Center',
  tier: 'CLINIC_PRO',
  activeSeats: 3,
  totalSeats: 5,
  totalPatients: 24,
  globalAdherence: 88,
  pendingAudits: 2,
  createdAt: '2025-01-15T08:00:00.000Z',
};

// Mock Practitioners / Dietitians Roster
export const mockDietitians = [
  {
    id: 'dietitian-1',
    name: 'Dr. Sarah Jenkins',
    email: 's.jenkins@glycemicwellness.com',
    credentials: 'RDN, CDCES',
    role: 'Lead Clinical Dietitian',
    activePatients: 11,
    lastActive: 'Today, 09:30 AM',
    status: 'Active',
  },
  {
    id: 'dietitian-2',
    name: 'Marcus Vance',
    email: 'm.vance@glycemicwellness.com',
    credentials: 'MS, LDN',
    role: 'Metabolic Specialist',
    activePatients: 8,
    lastActive: 'Yesterday, 02:15 PM',
    status: 'Active',
  },
  {
    id: 'dietitian-3',
    name: 'Elena Rostova',
    email: 'e.rostova@glycemicwellness.com',
    credentials: 'RD, CPT',
    role: 'Pediatric Endocrinology Dietitian',
    activePatients: 5,
    lastActive: '3 days ago',
    status: 'Active',
  },
];

// Mock Shared Meal Plan Templates
export const mockSharedTemplates = [
  {
    id: 'template-gdm-week1',
    clinicId: 'clinic-glycemic-wellness',
    title: 'Standard Gestational Diabetes Week 1',
    description: 'Carbohydrate-controlled protocol with breakfast carb moderation (<= 15g) and high fiber distribution to prevent early morning dawn phenomenon surges.',
    authorDietitianId: 'dietitian-1',
    authorName: 'Dr. Sarah Jenkins, RDN',
    targetSubtype: 'GDM',
    sharingScope: 'CLINIC_SHARED',
    avgDailyGL: 36,
    scheduledSlots: {
      monday: { Breakfast: 'rec_1', Lunch: 'rec_2', Dinner: 'rec_2' },
      tuesday: { Breakfast: 'rec_1', Lunch: 'rec_2', Dinner: 'rec_3' },
      wednesday: { Breakfast: 'rec_1', Lunch: 'rec_3', Dinner: 'rec_2' },
      thursday: { Breakfast: 'rec_1', Lunch: 'rec_2', Dinner: 'rec_2' },
      friday: { Breakfast: 'rec_1', Lunch: 'rec_3', Dinner: 'rec_3' },
      saturday: { Breakfast: 'rec_1', Lunch: 'rec_2', Dinner: 'rec_2' },
      sunday: { Breakfast: 'rec_1', Lunch: 'rec_3', Dinner: 'rec_2' },
    },
    createdAt: '2026-02-10T10:00:00.000Z',
  },
  {
    id: 'template-t2d-stabilization',
    clinicId: 'clinic-glycemic-wellness',
    title: 'T2D Glycemic Stabilization Protocol',
    description: 'Mediterranean-style low-glycemic load template aimed at reducing insulin resistance with optimal omega-3 fatty acids and polyphenol-dense plant fibers.',
    authorDietitianId: 'dietitian-2',
    authorName: 'Marcus Vance, MS, LDN',
    targetSubtype: 'T2D',
    sharingScope: 'CLINIC_SHARED',
    avgDailyGL: 42,
    scheduledSlots: {
      monday: { Breakfast: 'rec_1', Lunch: 'rec_2', Dinner: 'rec_2' },
      tuesday: { Breakfast: 'rec_1', Lunch: 'rec_3', Dinner: 'rec_2' },
      wednesday: { Breakfast: 'rec_1', Lunch: 'rec_2', Dinner: 'rec_3' },
      thursday: { Breakfast: 'rec_1', Lunch: 'rec_3', Dinner: 'rec_2' },
      friday: { Breakfast: 'rec_1', Lunch: 'rec_2', Dinner: 'rec_2' },
      saturday: { Breakfast: 'rec_1', Lunch: 'rec_3', Dinner: 'rec_3' },
      sunday: { Breakfast: 'rec_1', Lunch: 'rec_2', Dinner: 'rec_2' },
    },
    createdAt: '2026-02-18T14:30:00.000Z',
  },
];

// Pre-seed mock data
const preseedDemoClients = () => {
  if (typeof localStorage === 'undefined') return;
  const existing = localStorage.getItem('glyco_clients');
  if (!existing) {
    const mockClients = [
      {
        id: 'client_maria_k',
        dietitianId: 'dietitian@glyco.com',
        clinicId: 'clinic-glycemic-wellness',
        name: 'Maria K.',
        email: 'maria.k@example.com',
        diabeticSubtype: 'T2D',
        dietaryRestrictions: ['Vegetarian'],
        calibration: {
          glTargetDaily: 45,
          bolusTimingOffset: 15,
          netCarbCap: 120,
          glucoseUnit: 'mgdl',
        },
        activePlan: {
          cumulativeDailyGL: {
            monday: 40, tuesday: 42, wednesday: 48, thursday: 44, friday: 45, saturday: 50, sunday: 42
          }
        },
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      },
      {
        id: 'client_dimitris_t',
        dietitianId: 'dietitian@glyco.com',
        clinicId: 'clinic-glycemic-wellness',
        name: 'Dimitris T.',
        email: 'dimitris.t@example.com',
        diabeticSubtype: 'T1D',
        dietaryRestrictions: ['Gluten-Free'],
        calibration: {
          glTargetDaily: 50,
          bolusTimingOffset: 20,
          netCarbCap: 150,
          glucoseUnit: 'mmol/L',
          insulinSensitivityFactor: 50,
          carbToInsulinRatio: 15,
          targetPreMealGlucose: 100,
        },
        activePlan: {
          cumulativeDailyGL: {
            monday: 55, tuesday: 48, wednesday: 52, thursday: 60, friday: 45, saturday: 49, sunday: 55
          }
        },
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
      {
        id: 'client_elena_p',
        dietitianId: 'dietitian@glyco.com',
        clinicId: 'clinic-glycemic-wellness',
        name: 'Elena P.',
        email: 'elena.p@example.com',
        diabeticSubtype: 'GDM',
        dietaryRestrictions: [],
        calibration: {
          glTargetDaily: 35,
          bolusTimingOffset: 15,
          netCarbCap: 100,
          glucoseUnit: 'mgdl',
        },
        activePlan: {
          cumulativeDailyGL: {
            monday: 38, tuesday: 45, wednesday: 30, thursday: 40, friday: 42, saturday: 44, sunday: 32
          }
        },
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
    ];
    localStorage.setItem('glyco_clients', JSON.stringify(mockClients));
  }

  // Pre-seed shared rules
  const existingRules = localStorage.getItem('glyco_rules');
  if (!existingRules) {
    const defaultRules = [
      {
        id: 'rule-shared-1',
        clinicId: 'clinic-glycemic-wellness',
        sourceIngredient: 'Jasmine White Rice',
        targetIngredient: 'Cauliflower Pearl Rice',
        scope: 'all-plans',
        sharingScope: 'CLINIC_SHARED',
        authorName: 'Dr. Sarah Jenkins, RDN',
        rationale: 'Standard clinical substitute reducing Glycemic Load by ~65 GL per 100g.',
        createdAt: '2026-01-20T09:00:00.000Z',
      },
      {
        id: 'rule-shared-2',
        clinicId: 'clinic-glycemic-wellness',
        sourceIngredient: 'Mashed Russet Potato',
        targetIngredient: 'Steamed Cauliflower Mash',
        scope: 'all-plans',
        sharingScope: 'CLINIC_SHARED',
        authorName: 'Marcus Vance, MS, LDN',
        rationale: 'Eliminates fast starch gelatinization spike while preserving creamy mouthfeel.',
        createdAt: '2026-02-05T11:20:00.000Z',
      },
      {
        id: 'rule-shared-3',
        clinicId: 'clinic-glycemic-wellness',
        sourceIngredient: 'Refined Wheat Pasta',
        targetIngredient: 'Edamame / Konjac Noodles',
        scope: 'all-plans',
        sharingScope: 'CLINIC_SHARED',
        authorName: 'Elena Rostova, RD',
        rationale: 'Shifts macronutrient density toward complete plant protein and high soluble fiber.',
        createdAt: '2026-02-14T15:45:00.000Z',
      },
    ];
    localStorage.setItem('glyco_rules', JSON.stringify(defaultRules));
  }

  // Pre-seed shared templates
  const existingTemplates = localStorage.getItem('glyco_templates');
  if (!existingTemplates) {
    localStorage.setItem('glyco_templates', JSON.stringify(mockSharedTemplates));
  }
};

export const getClinicDetails = async (clinicId = 'clinic-glycemic-wellness') => {
  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('glyco_jwt') : null;
    const res = await fetch(`/api/clinics/${clinicId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (res.ok) {
      const data = await res.json();
      const attrs = data?.data?.attributes || data?.data || data;
      if (attrs && (attrs.name || attrs.id)) {
        return {
          id: String(data?.data?.id || attrs.id || clinicId),
          name: attrs.name || mockClinic.name,
          tier: attrs.tier || mockClinic.tier,
          activeSeats: attrs.activeSeats ?? mockClinic.activeSeats,
          totalSeats: attrs.totalSeats ?? mockClinic.totalSeats,
          totalPatients: attrs.totalPatients ?? mockClinic.totalPatients,
          globalAdherence: attrs.globalAdherence ?? mockClinic.globalAdherence,
          pendingAudits: attrs.pendingAudits ?? mockClinic.pendingAudits,
          createdAt: attrs.createdAt || mockClinic.createdAt,
        };
      }
    }
  } catch (_e) {
    // Graceful offline/demo fallback
  }
  return { ...mockClinic };
};

export const getClinicDietitians = async (clinicId = 'clinic-glycemic-wellness') => {
  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('glyco_jwt') : null;
    const res = await fetch(`/api/clinics/${clinicId}?populate=dietitians`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (res.ok) {
      const data = await res.json();
      const rawDietitians =
        data?.data?.attributes?.dietitians?.data ||
        data?.data?.dietitians ||
        data?.dietitians;

      if (Array.isArray(rawDietitians) && rawDietitians.length > 0) {
        return rawDietitians.map((d) => {
          const attrs = d.attributes || d;
          return {
            id: String(d.id || attrs.id),
            name: attrs.name || attrs.username || 'Practitioner',
            email: attrs.email || '',
            credentials: attrs.credential || attrs.credentials || 'RDN',
            role: attrs.roleTitle || attrs.role || 'Clinical Dietitian',
            activePatients: Array.isArray(attrs.clientIds) ? attrs.clientIds.length : (attrs.activePatients || 0),
            lastActive: attrs.lastActive || 'Active',
            status: attrs.status || 'Active',
          };
        });
      }
    }
  } catch (_e) {
    // Graceful offline/demo fallback
  }
  const stored = JSON.parse(localStorage.getItem('glyco_clinic_dietitians') || '[]');
  if (stored.length === 0) {
    localStorage.setItem('glyco_clinic_dietitians', JSON.stringify(mockDietitians));
    return [...mockDietitians];
  }
  return stored;
};

export const inviteDietitian = async (dietitianData) => {
  const stored = JSON.parse(localStorage.getItem('glyco_clinic_dietitians') || JSON.stringify(mockDietitians));
  const newDietitian = {
    id: `dietitian-${Date.now()}`,
    name: dietitianData.name,
    email: dietitianData.email,
    credentials: dietitianData.credentials || 'RDN',
    role: dietitianData.role || 'Clinical Dietitian',
    activePatients: 0,
    lastActive: 'Invitation Pending',
    status: 'Invited',
  };
  stored.push(newDietitian);
  localStorage.setItem('glyco_clinic_dietitians', JSON.stringify(stored));
  return newDietitian;
};

export const getClientProfiles = async (dietitianId) => {
  preseedDemoClients();
  const clients = JSON.parse(localStorage.getItem('glyco_clients') || '[]');
  return clients.filter((c) => c.dietitianId === dietitianId);
};

export const getClientById = async (clientId) => {
  preseedDemoClients();
  const clients = JSON.parse(localStorage.getItem('glyco_clients') || '[]');
  const client = clients.find((c) => c.id === clientId);
  if (!client) return null;
  return {
    profile: {
      id: client.id,
      name: client.name,
      email: client.email,
      diabeticSubtype: client.diabeticSubtype,
      dietaryRestrictions: client.dietaryRestrictions,
      lastActive: client.lastActive,
      clinicId: client.clinicId,
    },
    calibration: client.calibration,
    activePlan: client.activePlan,
  };
};

export const createClientProfile = async (profileData, calibrationData) => {
  const clients = JSON.parse(localStorage.getItem('glyco_clients') || '[]');
  const newClient = {
    id: 'client_' + Date.now(),
    dietitianId: profileData.dietitianId,
    clinicId: profileData.clinicId || 'clinic-glycemic-wellness',
    name: profileData.name,
    email: profileData.email,
    diabeticSubtype: profileData.diabeticSubtype,
    dietaryRestrictions: profileData.dietaryRestrictions || [],
    calibration: calibrationData,
    activePlan: { cumulativeDailyGL: {} },
    lastActive: new Date().toISOString(),
  };
  clients.push(newClient);
  localStorage.setItem('glyco_clients', JSON.stringify(clients));
  return newClient;
};

export const updateClientCalibration = async (clientId, calibrationData) => {
  const clients = JSON.parse(localStorage.getItem('glyco_clients') || '[]');
  const index = clients.findIndex((c) => c.id === clientId);
  if (index !== -1) {
    clients[index].calibration = { 
      ...clients[index].calibration, 
      ...calibrationData 
    };
    localStorage.setItem('glyco_clients', JSON.stringify(clients));
    return clients[index];
  }
  return null;
};

export const getPrescribedPlan = async (clientId, weekStartDate) => {
  const plans = JSON.parse(localStorage.getItem('glyco_plans') || '[]');
  return plans.find((p) => p.clientId === clientId && p.weekStartDate === weekStartDate) || null;
};

export const savePrescribedPlan = async (planData) => {
  const plans = JSON.parse(localStorage.getItem('glyco_plans') || '[]');
  const index = plans.findIndex((p) => p.clientId === planData.clientId && p.weekStartDate === planData.weekStartDate);
  if (index !== -1) {
    plans[index] = planData;
  } else {
    plans.push(planData);
  }
  localStorage.setItem('glyco_plans', JSON.stringify(plans));
  
  const clients = JSON.parse(localStorage.getItem('glyco_clients') || '[]');
  const clientIndex = clients.findIndex((c) => c.id === planData.clientId);
  if (clientIndex !== -1) {
    clients[clientIndex].activePlan = planData;
    localStorage.setItem('glyco_clients', JSON.stringify(clients));
  }
  return planData;
};

export const getSmartSwapRules = async (clientId) => {
  preseedDemoClients();
  const rules = JSON.parse(localStorage.getItem('glyco_rules') || '[]');
  return rules.filter((r) => r.clientId === clientId || r.scope === 'all-clients');
};

export const saveSmartSwapRule = async (ruleData) => {
  preseedDemoClients();
  const rules = JSON.parse(localStorage.getItem('glyco_rules') || '[]');
  const newRule = { 
    id: 'rule_' + Date.now(), 
    clinicId: ruleData.clinicId || 'clinic-glycemic-wellness',
    sharingScope: ruleData.sharingScope || 'PRIVATE',
    authorName: ruleData.authorName || 'Current Practitioner',
    ...ruleData 
  };
  rules.push(newRule);
  localStorage.setItem('glyco_rules', JSON.stringify(rules));
  return newRule;
};

export const getClinicSharedRules = async (clinicId = 'clinic-glycemic-wellness') => {
  preseedDemoClients();
  const rules = JSON.parse(localStorage.getItem('glyco_rules') || '[]');
  return rules.filter((r) => r.sharingScope === 'CLINIC_SHARED');
};

export const getClinicSharedTemplates = async (clinicId = 'clinic-glycemic-wellness') => {
  preseedDemoClients();
  const templates = JSON.parse(localStorage.getItem('glyco_templates') || '[]');
  return templates.filter((t) => t.sharingScope === 'CLINIC_SHARED');
};

export const cloneRuleToClient = async (ruleId, targetClientId) => {
  preseedDemoClients();
  const rules = JSON.parse(localStorage.getItem('glyco_rules') || '[]');
  const sourceRule = rules.find((r) => r.id === ruleId);
  if (!sourceRule) return null;

  const clonedRule = {
    ...sourceRule,
    id: `rule_clone_${Date.now()}`,
    clientId: targetClientId,
    sharingScope: 'PRIVATE',
    createdAt: new Date().toISOString(),
  };

  rules.push(clonedRule);
  localStorage.setItem('glyco_rules', JSON.stringify(rules));
  return clonedRule;
};
