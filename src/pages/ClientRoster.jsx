import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getClientProfiles, createClientProfile, updateClientCalibration } from '../utils/clientStore';
import { calculateWeeklyAdherence } from '../services/metabolicEngine';
import ClientOnboardingWizard from '../components/dietitian/ClientOnboardingWizard';
import ClientCalibrationDrawer from '../components/dietitian/ClientCalibrationDrawer';

/**
 * ClientRoster - Clinical surveillance workspace.
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

  const getAdherenceColor = (score) => {
    if (score >= 80) return { bg: 'bg-success-surface', dot: 'bg-brand-strong', text: 'text-brand-strong' }; // Sage Green
    if (score >= 50) return { bg: 'bg-warning-surface', dot: 'bg-warning-strong', text: 'text-warning-strong' }; // Amber
    return { bg: 'bg-error-surface', dot: 'bg-error-strong', text: 'text-error-strong' }; // Soft Rose
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || c.diabeticSubtype === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header Controls */}
      <header className="bg-white border-b border-outline-variant/30 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary font-display flex items-center gap-2">
                <span className="material-symbols-outlined">supervisor_account</span>
                Client Roster
              </h1>
              <p className="text-sm text-on-surface-variant mt-1">
                Active Caseload: <span className="font-bold text-on-surface">{clients.length} patients</span>
              </p>
            </div>
            <button 
              onClick={() => setIsWizardOpen(true)}
              className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-full flex items-center gap-2 hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all shadow-md min-h-[48px]"
            >
              <span className="material-symbols-outlined">person_add</span>
              Add New Client
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline rounded-full text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
              {['All', 'T1D', 'T2D', 'GDM', 'Prediabetes'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-colors min-h-[48px] ${filterType === type ? 'bg-secondary text-on-secondary shadow-sm' : 'bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/30'}`}
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
          <div className="text-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl opacity-50">group_off</span>
            <p className="mt-4 text-lg">No clients found in your roster.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map(client => {
              const adherence = calculateWeeklyAdherence(client.activePlan || { cumulativeDailyGL: {} }, client.calibration || { glTargetDaily: 45 });
              const color = getAdherenceColor(adherence.adherencePercent);

              return (
                <article key={client.id} className="bg-white rounded-2xl p-5 border border-outline-variant/40 shadow-xs hover:shadow-md transition-shadow flex flex-col h-full">
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-display font-bold text-lg text-on-surface">{client.name}</h3>
                      <p className="text-xs text-on-surface-variant truncate w-48">{client.email}</p>
                    </div>
                    <span className="bg-surface-container-high text-on-surface px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wider border border-outline-variant/50">
                      {client.diabeticSubtype}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/30 px-3 py-2 rounded-lg">
                      <span className="material-symbols-outlined text-on-surface-variant text-[18px]">target</span>
                      <span className="text-sm font-semibold text-on-surface">GL Target: {client.calibration.glTargetDaily}/day</span>
                    </div>

                    <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg border border-transparent ${color.bg} ${color.text}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${color.dot}`} />
                        <span className="text-sm font-bold">Weekly Adherence</span>
                      </div>
                      <span className="font-extrabold text-base">{adherence.adherencePercent}%</span>
                    </div>
                    
                    <p className="text-[11px] text-on-surface-variant pt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">history</span>
                      Last active: {new Date(client.lastActive).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 grid grid-cols-2 gap-2 pt-4 border-t border-outline-variant/30">
                    <Link 
                      to={`/client/${client.id}/plan-builder`}
                      className="flex items-center justify-center gap-1.5 bg-surface-container text-on-surface hover:bg-surface-container-high rounded-xl text-xs font-bold transition-colors min-h-[48px]"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
                      Plan Builder
                    </Link>
                    <button 
                      onClick={() => openCalibration(client)}
                      className="flex items-center justify-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-xs font-bold transition-colors min-h-[48px]"
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
