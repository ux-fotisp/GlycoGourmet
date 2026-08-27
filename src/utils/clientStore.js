// src/utils/clientStore.js
/**
 * Client Management Store - LocalStorage fallback for Dietitian Clients
 */

// Pre-seed mock data for dietitian@glyco.com
const preseedDemoClients = () => {
  if (typeof localStorage === 'undefined') return;
  const existing = localStorage.getItem('glyco_clients');
  if (!existing) {
    const mockClients = [
      {
        id: 'client_maria_k',
        dietitianId: 'dietitian@glyco.com',
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
        // Mock active plan adherence (used by calculateWeeklyAdherence mock)
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
        name: 'Dimitris T.',
        email: 'dimitris.t@example.com',
        diabeticSubtype: 'T1D',
        dietaryRestrictions: ['Gluten-Free'],
        calibration: {
          glTargetDaily: 50,
          bolusTimingOffset: 20,
          netCarbCap: 150,
          glucoseUnit: 'mmol/L',
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
    clients[index].calibration = { ...clients[index].calibration, ...calibrationData };
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
