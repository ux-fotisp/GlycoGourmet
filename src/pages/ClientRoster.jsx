import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getClientProfiles, createClientProfile, updateClientCalibration } from '../utils/clientStore';
import { calculateWeeklyAdherence } from '../services/metabolicEngine';
import ClientOnboardingWizard from '../components/dietitian/ClientOnboardingWizard';
import ClientCalibrationDrawer from '../components/dietitian/ClientCalibrationDrawer';
import FeatureGate from '../components/common/FeatureGate';

/**
 * ClientRoster - Clinical surveillance workspace with advanced forecasting badges and SaaS feature gates.
 */
export const ClientRoster = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const loadClients = async () => {
    if (user?.email) {
      const data = await getClientProfiles(user.email);
      setClients(data);
    }
  };

  useEffect(() => {
    loadClients();
  }, [user]);

  const handleCreateClient = async (profileData, calibrationData) => {
    await createClientProfile(profileData, calibrationData);
    await loadClients();
    setIsWizardOpen(false);
  };

  const handleSaveCalibration = async (clientId, calibrationData) => {
    await updateClientCalibration(clientId, calibrationData);
    await loadClients();
    setIsDrawerOpen(false);
    setSelectedClient(null);
  };

  const openCalibration = (client) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  const handleBulkFHIRExport = () => {
    alert(`Exporting ${clients.length} patient records into HL7 FHIR JSON Bundle...`);
  };

  const getAdherenceColor = (score) => {
    if (score >= 80) return { bg: 'bg-success-surface', dot: 'bg-brand-strong', text: 'text-brand-strong' }; // Sage Green
    if (score >= 50) return { bg: 'bg-warning-surface', dot: 'bg-warning-strong', text: 'text-warning-strong' }; // Amber
    return { bg: 'bg-error-surface', dot: 'bg-error-strong', text: 'text-error-strong' }; // Soft Rose
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || c.diabeticSubtype === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header Controls */}
      <header className="bg-white border-b border-outline-variant/30 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary font-display flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-3xl">supervisor_account</span>
                Client Roster
              </h1>
              <p className="text-xs font-semibold text-on-surface-variant mt-1">
                Active Caseload: <strong className="text-on-surface">{clients.length} patients</strong>
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Enterprise Feature Gated Bulk EHR FHIR Export Button */}
              <FeatureGate
                requiredTier="ENTERPRISE"
                featureName="Bulk EHR (FHIR) Export"
                fallbackType="upsellOverlay"
              >
                <button 
                  type="button"
                  onClick={handleBulkFHIRExport}
                  className="bg-surface-container-high text-on-surface hover:bg-surface-container border border-outline-variant/40 font-bold px-4 py-2.5 rounded-full text-xs flex items-center gap-2 transition-all min-h-[44px] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
                  Export Roster to EHR (FHIR)
                </button>
              </FeatureGate>

              <button 
                onClick={() => setIsWizardOpen(true)}
                className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-full text-xs flex items-center gap-2 hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all shadow-sm min-h-[44px] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Add New Client
              </button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:max-w-md">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline rounded-full text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
              {['All', 'T1D', 'T2D', 'GDM', 'Prediabetes'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all min-h-[38px] cursor-pointer ${
                    filterType === type 
                      ? 'bg-primary text-white shadow-xs' 
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/30'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {filteredClients.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant space-y-2">
            <span className="material-symbols-outlined text-5xl opacity-40">group_off</span>
            <p className="text-sm font-semibold">No clients found matching your filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => {
              const adherence = calculateWeeklyAdherence(
                client.activePlan || { cumulativeDailyGL: {} }, 
                client.calibration || { glTargetDaily: 45 }
              );
              const color = getAdherenceColor(adherence.adherencePercent);
              const hasForecasting = Boolean(
                client.calibration?.insulinSensitivityFactor && client.calibration?.carbToInsulinRatio
              );

              return (
                <article key={client.id} className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between h-full">
                  
                  <div>
                    {/* Header Row with Badges */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-display font-bold text-lg text-primary">{client.name}</h3>
                        <p className="text-xs text-on-surface-variant truncate w-44">{client.email}</p>
                      </div>
                      
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {/* Conditional Forecasting Enabled Pill */}
                        {hasForecasting && (
                          <span 
                            title="ISF and CIR Calibrated for Predictive Glucose Curves"
                            className="bg-sage-bg text-sage-text border border-sage-text/20 px-2 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider flex items-center gap-1 shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-[12px]">show_chart</span>
                            Forecasting Enabled
                          </span>
                        )}
                        <span className="bg-surface-container-high text-on-surface px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider border border-outline-variant/50">
                          {client.diabeticSubtype}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between bg-[#F6F4EE] border border-stone-200/60 px-3 py-2 rounded-xl text-xs">
                        <span className="flex items-center gap-1.5 font-bold text-primary">
                          <span className="material-symbols-outlined text-[16px] text-sage-text">target</span>
                          Daily GL Target
                        </span>
                        <span className="font-extrabold text-primary">{client.calibration?.glTargetDaily ?? 45} GL</span>
                      </div>

                      <div className={`flex items-center justify-between px-3 py-2 rounded-xl border border-transparent ${color.bg} ${color.text}`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${color.dot}`} />
                          <span className="text-xs font-bold">Weekly Adherence</span>
                        </div>
                        <span className="font-extrabold text-sm">{adherence.adherencePercent}%</span>
                      </div>
                      
                      <p className="text-[10px] text-on-surface-variant pt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">history</span>
                        Last active: {new Date(client.lastActive).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 grid grid-cols-2 gap-2 pt-4 border-t border-stone-100">
                    <Link 
                      to={`/client/${client.id}/plan-builder`}
                      className="flex items-center justify-center gap-1.5 bg-surface-container text-on-surface hover:bg-surface-container-high rounded-2xl text-xs font-bold transition-colors min-h-[42px]"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
                      Plan Builder
                    </Link>
                    <button 
                      onClick={() => openCalibration(client)}
                      className="flex items-center justify-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-2xl text-xs font-bold transition-colors min-h-[42px] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">tune</span>
                      Calibrate
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <ClientOnboardingWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        onComplete={handleCreateClient}
        dietitianId={user?.email}
      />
      
      <ClientCalibrationDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => { setIsDrawerOpen(false); setSelectedClient(null); }}
        client={selectedClient}
        onSave={handleSaveCalibration}
      />
    </div>
  );
};

export default ClientRoster;
