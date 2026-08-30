// src/utils/clientStore.js
/**
 * Client & Tenant Management Store - LocalStorage fallback for Multi-Tenant Clinic Administration
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

// Pre-seed mock data for dietitian@glyco.com
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
};

export const getClinicDetails = async (clinicId = 'clinic-glycemic-wellness') => {
  return { ...mockClinic };
};

export const getClinicDietitians = async (clinicId = 'clinic-glycemic-wellness') => {
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
  return clients.filter(c => c.dietitianId === dietitianId);
};

export const getClientById = async (clientId) => {
  preseedDemoClients();
  const clients = JSON.parse(localStorage.getItem('glyco_clients') || '[]');
  const client = clients.find(c => c.id === clientId);
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
    activePlan: { cumulativeDailyGL: {} }, // empty plan
    lastActive: new Date().toISOString(),
  };
  clients.push(newClient);
  localStorage.setItem('glyco_clients', JSON.stringify(clients));
  return newClient;
};

export const updateClientCalibration = async (clientId, calibrationData) => {
  const clients = JSON.parse(localStorage.getItem('glyco_clients') || '[]');
  const index = clients.findIndex(c => c.id === clientId);
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
  return plans.find(p => p.clientId === clientId && p.weekStartDate === weekStartDate) || null;
};

export const savePrescribedPlan = async (planData) => {
  const plans = JSON.parse(localStorage.getItem('glyco_plans') || '[]');
  const index = plans.findIndex(p => p.clientId === planData.clientId && p.weekStartDate === planData.weekStartDate);
  if (index !== -1) {
    plans[index] = planData;
  } else {
    plans.push(planData);
  }
  localStorage.setItem('glyco_plans', JSON.stringify(plans));
  
  // Update activePlan in client profile for dashboard sync
  const clients = JSON.parse(localStorage.getItem('glyco_clients') || '[]');
  const clientIndex = clients.findIndex(c => c.id === planData.clientId);
  if (clientIndex !== -1) {
    clients[clientIndex].activePlan = planData;
    localStorage.setItem('glyco_clients', JSON.stringify(clients));
  }
  return planData;
};

export const getSmartSwapRules = async (clientId) => {
  const rules = JSON.parse(localStorage.getItem('glyco_rules') || '[]');
  return rules.filter(r => r.clientId === clientId || r.scope === 'all-clients');
};

export const saveSmartSwapRule = async (ruleData) => {
  const rules = JSON.parse(localStorage.getItem('glyco_rules') || '[]');
  const newRule = { id: 'rule_' + Date.now(), ...ruleData };
  rules.push(newRule);
  localStorage.setItem('glyco_rules', JSON.stringify(rules));
  return newRule;
};
