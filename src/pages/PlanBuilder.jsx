import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClientById, getPrescribedPlan, savePrescribedPlan } from '../utils/clientStore';
import { calculateDailyRollup } from '../services/metabolicEngine';
import SmartSwapRuleEditor from '../components/dietitian/SmartSwapRuleEditor';
import { generateGroceryManifest, generateClinicalSummaryReport, exportFHIRMetabolicTelemetry } from '../utils/exportPipeline';
// Mock recipe dictionary
const RECIPE_DB = {
  'rec_1': { id: 'rec_1', title: 'Avocado Toast', servings: 1, ingredients: [{ amount: 100, ingredient: { glycemicIndex: 15, carbs: 10, fiber: 5, kcal: 150, protein: 2, fat: 12 } }] },
  'rec_2': { id: 'rec_2', title: 'Grilled Salmon', servings: 1, ingredients: [{ amount: 150, ingredient: { glycemicIndex: 0, carbs: 0, fiber: 0, kcal: 300, protein: 40, fat: 15 } }] },
  'rec_3': { id: 'rec_3', title: 'Quinoa Bowl', servings: 1, ingredients: [{ amount: 200, ingredient: { glycemicIndex: 53, carbs: 40, fiber: 5, kcal: 220, protein: 8, fat: 3 } }] }
};

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const OCCASIONS = ['Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Snack', 'Dessert'];

export const PlanBuilder = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [weekStart, setWeekStart] = useState('2024-01-01');
  const [matrix, setMatrix] = useState({}); // { 'monday-Breakfast': { recipeId: 'rec_1', multiplier: 1 } }
  const [isRuleEditorOpen, setIsRuleEditorOpen] = useState(false);
  const [dailyRollups, setDailyRollups] = useState({});

  useEffect(() => {
    const load = async () => {
      const data = await getClientById(id);
      setClient(data);
      const plan = await getPrescribedPlan(id, '2024-01-01');
      if (plan && plan.matrix) setMatrix(plan.matrix);
    };
    load();
  }, [id]);

  useEffect(() => {
    // Recalculate daily rollups whenever matrix changes
    const newRollups = {};
    DAYS.forEach(day => {
      const daySlots = {};
      const multipliers = {};
      OCCASIONS.forEach(occ => {
        const key = `${day}-${occ}`;
        if (matrix[key]) {
          daySlots[occ] = matrix[key].recipeId;
          multipliers[matrix[key].recipeId] = matrix[key].multiplier;
        }
      });
      newRollups[day] = calculateDailyRollup(daySlots, RECIPE_DB, multipliers);
    });
    setDailyRollups(newRollups);
  }, [matrix]);

  const handleAssign = (day, occ) => {
    // Mock assignment for demo
    const ids = Object.keys(RECIPE_DB);
    const randomId = ids[Math.floor(Math.random() * ids.length)];
    setMatrix(prev => ({ ...prev, [`${day}-${occ}`]: { recipeId: randomId, multiplier: 1 } }));
  };

  const handleRemove = (day, occ) => {
    setMatrix(prev => {
      const next = { ...prev };
      delete next[`${day}-${occ}`];
      return next;
    });
  };

  const handleScale = (day, occ, mult) => {
    setMatrix(prev => ({
      ...prev,
      [`${day}-${occ}`]: { ...prev[`${day}-${occ}`], multiplier: mult }
    }));
  };

  
  const handleExportGrocery = () => {
    const manifest = generateGroceryManifest(matrix, RECIPE_DB);
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Grocery_Manifest_${client.profile.name}.json`;
    a.click();
  };

  const handleExportSummary = () => {
    const report = generateClinicalSummaryReport(client.profile, client.calibration, matrix, RECIPE_DB, dailyRollups);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Clinical_Summary_${client.profile.name}.txt`;
    a.click();
  };

  const handleExportFHIR = () => {
    const bundle = exportFHIRMetabolicTelemetry(client.profile, matrix, dailyRollups);
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/fhir+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FHIR_Telemetry_${client.profile.name}.json`;
    a.click();
  };

  const handleSave = async () => {
    const cumulativeDailyGL = {};
    DAYS.forEach(d => {
      cumulativeDailyGL[d] = dailyRollups[d]?.cumulativeDailyGL || 0;
    });
    await savePrescribedPlan({ clientId: id, weekStartDate: weekStart, matrix, cumulativeDailyGL });
    alert('Plan Saved!');
  };

  const getGLColor = (gl) => {
    if (gl <= 10) return { bg: 'bg-success-surface', text: 'text-brand-strong', hex: 'var(--color-brand-strong)' };
    if (gl <= 19) return { bg: 'bg-warning-surface', text: 'text-warning-strong', hex: 'var(--color-warning-strong)' };
    return { bg: 'bg-error-surface', text: 'text-error-strong', hex: 'var(--color-error-strong)' };
  };

  if (!client) return <div className="p-10 text-center">Loading client data...</div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-white border-b border-outline-variant/30 sticky top-0 z-40 shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/client-roster" className="text-primary hover:underline font-bold flex items-center text-sm">
              <span className="material-symbols-outlined text-sm mr-1">arrow_back</span>
              Roster
            </Link>
            <span className="text-on-surface-variant text-sm">/</span>
            <h1 className="text-xl font-bold text-on-surface font-display">{client.profile.name}</h1>
            <span className="bg-surface-container-high text-on-surface px-2 py-0.5 rounded text-[10px] font-bold">
              {client.profile.diabeticSubtype}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant font-medium">
            GL Target: <strong className="text-on-surface">{client.calibration.glTargetDaily}/day</strong> ? Bolus Offset: <strong className="text-on-surface">{client.calibration.bolusTimingOffset}m</strong>
          </p>
        </div>
        
        <div className="flex gap-2">
          
          <button onClick={handleExportGrocery} className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 min-h-[48px]">
            <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
            Manifest
          </button>
          <button onClick={handleExportSummary} className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 min-h-[48px]">
            <span className="material-symbols-outlined text-[16px]">summarize</span>
            Summary
          </button>
          <button onClick={handleExportFHIR} className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 min-h-[48px]">
            <span className="material-symbols-outlined text-[16px]">medical_information</span>
            FHIR
          </button>
          <button onClick={() => setIsRuleEditorOpen(true)} className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 min-h-[48px]">

            <span className="material-symbols-outlined text-[16px]">rule</span>
            Swap Rules
          </button>
          <button onClick={handleSave} className="px-6 py-2 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container active:scale-95 rounded-full text-xs font-bold transition-colors shadow-sm min-h-[48px]">
            Save Plan
          </button>
        </div>
      </header>

      {/* Grid Canvas */}
      <div className="p-6 overflow-x-auto">
        <table className="w-full border-collapse min-w-[1200px]">
          <thead>
            <tr>
              <th className="w-24 p-2"></th>
              {DAYS.map(day => (
                <th key={day} className="p-3 text-left border-b border-outline-variant/30">
                  <div className="font-display font-bold text-on-surface capitalize">{day}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {OCCASIONS.map(occ => (
              <tr key={occ} className="border-b border-outline-variant/20">
                <td className="p-3 text-xs font-bold text-on-surface-variant align-top w-24 pt-4">{occ}</td>
                {DAYS.map(day => {
                  const cellKey = `${day}-${occ}`;
                  const slot = matrix[cellKey];
                  return (
                    <td key={day} className="p-2 align-top w-48">
                      {slot ? (
                        <div className="bg-white border border-outline-variant/50 rounded-xl p-3 shadow-xs space-y-2 relative group">
                          <button onClick={() => handleRemove(day, occ)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-error-container text-error rounded min-h-[32px] min-w-[32px] flex items-center justify-center transition-all cursor-pointer">
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                          
                          <div className="font-bold text-sm text-on-surface leading-tight pr-5">
                            {RECIPE_DB[slot.recipeId].title}
                          </div>
                          
                          {/* Multiplier pills */}
                          <div className="flex gap-1">
                            {[0.5, 1, 1.5, 2].map(m => (
                              <button
                                key={m}
                                onClick={() => handleScale(day, occ, m)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold min-h-[32px] min-w-[32px] ${slot.multiplier === m ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`}
                              >
                                {m}x
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleAssign(day, occ)}
                          className="w-full h-20 border-2 border-dashed border-outline-variant/40 rounded-xl flex items-center justify-center text-on-surface-variant hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer min-h-[48px]"
                        >
                          <span className="material-symbols-outlined text-[20px]">add</span>
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          {/* Footer Tallies */}
          <tfoot>
            <tr className="bg-surface-container-lowest">
              <td className="p-3 text-xs font-bold text-on-surface-variant align-top">Day Totals</td>
              {DAYS.map(day => {
                const rollup = dailyRollups[day] || { cumulativeDailyGL: 0, netCarbs: 0, protein: 0, fat: 0 };
                const glColor = getGLColor(rollup.cumulativeDailyGL);
                const target = client.calibration.glTargetDaily;
                const progress = Math.min(100, (rollup.cumulativeDailyGL / target) * 100);
                
                return (
                  <td key={day} className="p-3 border-t border-outline-variant/30 align-top">
                    <div className="bg-white p-3 rounded-xl border border-outline-variant/30 shadow-xs space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-on-surface-variant">Total GL</span>
                        <span className={`font-extrabold text-lg ${glColor.text}`}>{rollup.cumulativeDailyGL}</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                        <div className={`h-full transition-all ${glColor.bg}`} style={{ width: `${progress}%`, backgroundColor: glColor.hex }} />
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-on-surface-variant pt-1">
                        <div>NC: <strong className="text-on-surface">{rollup.netCarbs}g</strong></div>
                        <div>Pro: <strong className="text-on-surface">{rollup.protein}g</strong></div>
                        <div>Fat: <strong className="text-on-surface">{rollup.fat}g</strong></div>
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
      
      <SmartSwapRuleEditor 
        isOpen={isRuleEditorOpen}
        onClose={() => setIsRuleEditorOpen(false)}
        clientId={id}
      />
    </div>
  );
};

export default PlanBuilder;
