import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClientById, getPrescribedPlan, savePrescribedPlan } from '../utils/clientStore';
import { calculateDailyRollup, calculateMetabolicProfile } from '../services/metabolicEngine';
import SmartSwapRuleEditor from '../components/dietitian/SmartSwapRuleEditor';
import ExcursionForecastModal from '../components/dietitian/ExcursionForecastModal';
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
  const [isGroceryModalOpen, setIsGroceryModalOpen] = useState(false);
  const [groceryManifest, setGroceryManifest] = useState(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryReport, setSummaryReport] = useState(null);

  // Excursion Forecasting Modal state
  const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);
  const [selectedForecastRecipe, setSelectedForecastRecipe] = useState(null);

  const buildPrescribedPlan = () => {
    const scheduledSlots = {};
    DAYS.forEach(day => scheduledSlots[day] = []);
    Object.entries(matrix).forEach(([key, slot]) => {
      const [day, occ] = key.split('-');
      scheduledSlots[day].push({ occasion: occ, recipeId: slot.recipeId, servingsMultiplier: slot.multiplier });
    });
    const cumulativeDailyGL = {};
    DAYS.forEach(d => {
      cumulativeDailyGL[d] = dailyRollups[d]?.cumulativeDailyGL || 0;
    });
    return {
      id: `plan-${id}`,
      weekStartDate: weekStart,
      scheduledSlots,
      cumulativeDailyGL
    };
  };

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

  const handleScale = (day, occ, multiplier) => {
    const key = `${day}-${occ}`;
    if (matrix[key]) {
      setMatrix(prev => ({
        ...prev,
        [key]: { ...prev[key], multiplier }
      }));
    }
  };

  const handleRemove = (day, occ) => {
    const key = `${day}-${occ}`;
    setMatrix(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleOpenForecast = (recipeId, multiplier = 1) => {
    const rawRecipe = RECIPE_DB[recipeId];
    if (!rawRecipe) return;

    const scaledIngredients = (rawRecipe.ingredients || []).map(item => ({
      ...item,
      amount: (item.amount || 0) * multiplier,
    }));
    const profile = calculateMetabolicProfile(scaledIngredients, 1);

    setSelectedForecastRecipe({
      ...rawRecipe,
      title: `${rawRecipe.title} (${multiplier}x)`,
      metabolicProfile: profile,
      glycemicLoad: profile.glycemicLoad,
      glycemicIndex: profile.glycemicIndex,
      netCarbs: profile.netCarbs,
    });
    setIsForecastModalOpen(true);
  };

  const handleSave = async () => {
    const plan = buildPrescribedPlan();
    await savePrescribedPlan({ ...plan, clientId: id, matrix });
    alert('Meal Plan successfully prescribed and synced to patient dashboard!');
  };

  const handleExportGrocery = () => {
    const manifest = generateGroceryManifest(buildPrescribedPlan(), RECIPE_DB);
    setGroceryManifest(manifest);
    setIsGroceryModalOpen(true);
  };

  const handleExportSummary = () => {
    const report = generateClinicalSummaryReport(client.profile, client.calibration, buildPrescribedPlan(), RECIPE_DB);
    setSummaryReport(report);
    setIsSummaryModalOpen(true);
  };

  const handleExportFHIR = () => {
    const bundle = exportFHIRMetabolicTelemetry(client.profile, buildPrescribedPlan());
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `FHIR_Observation_${id}_${weekStart}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!client) return <div className="p-8">Loading client workspace...</div>;

  const getGLColor = (gl) => {
    const target = client.calibration.glTargetDaily;
    if (gl <= target * 0.8) return { text: 'text-brand-strong', bg: 'bg-brand-strong', hex: '#1B3B22' };
    if (gl <= target) return { text: 'text-amber-text', bg: 'bg-amber-text', hex: '#9E4D2A' };
    return { text: 'text-rose-text', bg: 'bg-rose-text', hex: '#BA1A1A' };
  };

  const hasForecasting = Boolean(
    client.calibration?.insulinSensitivityFactor && client.calibration?.carbToInsulinRatio
  );

  return (
    <div className="min-h-screen bg-background pb-12 font-sans">
      {/* Top Clinical Header */}
      <header className="bg-white border-b border-outline-variant/30 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link to="/client-roster" className="text-on-surface-variant hover:text-primary transition-colors flex items-center">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </Link>
              <h1 className="text-xl font-bold text-primary font-display">Plan Builder: {client.profile.name}</h1>
              <span className="bg-surface-container-high px-2 py-0.5 rounded text-[10px] font-extrabold">{client.profile.diabeticSubtype}</span>
              {hasForecasting && (
                <span className="bg-sage-bg text-sage-text border border-sage-text/20 px-2 py-0.5 rounded text-[9px] font-extrabold flex items-center gap-1 shadow-2xs">
                  <span className="material-symbols-outlined text-[12px]">show_chart</span>
                  Forecasting Enabled
                </span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              GL Target: <strong>{client.calibration.glTargetDaily} GL/day</strong> &bull; Bolus Offset: <strong>{client.calibration.bolusTimingOffset} mins</strong>
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleExportGrocery} className="px-3.5 py-2 bg-surface-container hover:bg-surface-container-high rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 min-h-[40px] cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
              Grocery
            </button>
            <button onClick={handleExportSummary} className="px-3.5 py-2 bg-surface-container hover:bg-surface-container-high rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 min-h-[40px] cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">description</span>
              Report
            </button>
            <button onClick={handleExportFHIR} className="px-3.5 py-2 bg-surface-container hover:bg-surface-container-high rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 min-h-[40px] cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">download</span>
              FHIR
            </button>
            <button 
              onClick={() => setIsRuleEditorOpen(true)}
              className="px-3.5 py-2 bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 min-h-[40px] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              Smart Swaps
            </button>
            <button 
              onClick={handleSave}
              className="px-5 py-2 bg-primary text-on-primary font-bold rounded-full text-xs hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md flex items-center gap-1.5 min-h-[40px] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              Prescribe Plan
            </button>
          </div>
        </div>
      </header>

      {/* 7-Day Interactive Matrix */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6 overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-2xl border border-outline-variant/30 shadow-xs overflow-hidden">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/30">
              <th className="p-3 text-left text-xs font-bold text-on-surface-variant w-24">Occasion</th>
              {DAYS.map(day => (
                <th key={day} className="p-3 text-center text-xs font-bold uppercase tracking-wider text-primary">
                  {day}
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
                        <div className="bg-white border border-outline-variant/50 rounded-2xl p-3 shadow-xs space-y-2 relative group hover:border-primary/40 transition-colors">
                          <button 
                            onClick={() => handleRemove(day, occ)} 
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-error-container text-error rounded-lg min-h-[28px] min-w-[28px] flex items-center justify-center transition-all cursor-pointer"
                            title="Remove from slot"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                          
                          <div className="font-bold text-xs text-on-surface leading-tight pr-5">
                            {RECIPE_DB[slot.recipeId]?.title || 'Recipe'}
                          </div>
                          
                          {/* Multiplier pills & Forecast trigger */}
                          <div className="flex items-center justify-between gap-1 pt-1">
                            <div className="flex gap-1">
                              {[0.5, 1, 1.5, 2].map(m => (
                                <button
                                  key={m}
                                  onClick={() => handleScale(day, occ, m)}
                                  className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold min-h-[26px] min-w-[24px] cursor-pointer transition-colors ${
                                    slot.multiplier === m 
                                      ? 'bg-primary text-on-primary' 
                                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                                  }`}
                                >
                                  {m}x
                                </button>
                              ))}
                            </div>

                            {/* Excursion Forecast Trigger Button */}
                            {hasForecasting && (
                              <button
                                type="button"
                                title="Predict 2-Hour Postprandial Glucose Curve"
                                onClick={() => handleOpenForecast(slot.recipeId, slot.multiplier)}
                                className="p-1 rounded-md bg-sage-bg text-sage-text hover:bg-sage-bg/80 transition-colors flex items-center gap-0.5 text-[9px] font-extrabold cursor-pointer border border-sage-text/20 shadow-2xs shrink-0"
                              >
                                <span className="material-symbols-outlined text-[12px]">show_chart</span>
                                Forecast
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleAssign(day, occ)}
                          className="w-full h-20 border-2 border-dashed border-outline-variant/40 rounded-2xl flex items-center justify-center text-on-surface-variant hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer min-h-[48px]"
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
                    <div className="bg-white p-3 rounded-2xl border border-outline-variant/30 shadow-xs space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-on-surface-variant">Total GL</span>
                        <span className={`font-extrabold text-base ${glColor.text}`}>{rollup.cumulativeDailyGL}</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
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
      
      {/* Smart Swap Rule Editor Modal */}
      <SmartSwapRuleEditor 
        isOpen={isRuleEditorOpen}
        onClose={() => setIsRuleEditorOpen(false)}
        clientId={id}
      />

      {/* Excursion Forecast Modal */}
      <ExcursionForecastModal
        isOpen={isForecastModalOpen}
        onClose={() => {
          setIsForecastModalOpen(false);
          setSelectedForecastRecipe(null);
        }}
        recipe={selectedForecastRecipe}
        calibration={client.calibration}
        clientName={client.profile.name}
        onOpenSwapEditor={() => setIsRuleEditorOpen(true)}
      />

      {/* Grocery Manifest Modal */}
      {isGroceryModalOpen && groceryManifest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 space-y-4">
            <h2 className="text-2xl font-bold font-display text-primary">Grocery Manifest</h2>
            {['produce', 'proteins', 'dairy', 'pantry', 'other'].map(cat => (
              <div key={cat} className="space-y-1">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary border-b pb-1">{cat}</h3>
                <ul className="list-disc pl-5 text-sm text-stone-700">
                  {groceryManifest[cat]?.map((item, i) => (
                    <li key={i}>{item.name} - {item.amount} {item.unit}</li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="mt-6 flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => window.print()} className="px-4 py-2 bg-surface-container rounded-xl font-bold text-xs">Print</button>
              <button onClick={() => setIsGroceryModalOpen(false)} className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Clinical Summary Report Modal */}
      {isSummaryModalOpen && summaryReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 space-y-4">
            <h2 className="text-2xl font-bold font-display text-primary">Clinical Summary Report</h2>
            <div className="space-y-1 text-xs text-stone-700 bg-surface-container-low p-3 rounded-xl">
              <p><strong>Patient:</strong> {summaryReport.patientName}</p>
              <p><strong>Subtype:</strong> {summaryReport.subtype}</p>
              <p><strong>Target GL:</strong> {summaryReport.glTarget} GL/day</p>
              <p><strong>Avg GL:</strong> {summaryReport.avgGL} GL/day</p>
              <p><strong>Adherence Rate:</strong> {summaryReport.adherenceRate}%</p>
            </div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary border-b pb-1">Daily Summaries</h3>
            <div className="space-y-1.5">
              {summaryReport.daySummaries?.map(day => (
                <div key={day.day} className="flex justify-between text-xs p-2 rounded-lg bg-surface-container-lowest border">
                  <span className="font-bold">{day.day}</span>
                  <span>GL: {day.gl} ({day.status})</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2 pt-2 border-t">
              <button onClick={handleExportFHIR} className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs">Export FHIR JSON</button>
              <button onClick={() => window.print()} className="px-4 py-2 bg-surface-container rounded-xl font-bold text-xs">Print</button>
              <button onClick={() => setIsSummaryModalOpen(false)} className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanBuilder;
