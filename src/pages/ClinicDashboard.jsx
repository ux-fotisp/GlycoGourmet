import PHIBoundaryBanner from '../components/clinic-admin/PHIBoundaryBanner';
import React, { useState, useEffect } from 'react';
import { getClinicDetails, getClinicDietitians, inviteDietitian } from '../utils/clientStore';

/**
 * ClinicDashboard - Multi-tenant organizational administration workspace for Clinic Admins.
 */
export const ClinicDashboard = () => {
  const [clinic, setClinic] = useState(null);
  const [dietitians, setDietitians] = useState([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    credentials: 'RDN',
    role: 'Clinical Dietitian',
  });

  const loadData = async () => {
    const clinicData = await getClinicDetails();
    const practitioners = await getClinicDietitians();
    setClinic(clinicData);
    setDietitians(practitioners);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteForm.name || !inviteForm.email) return;

    await inviteDietitian(inviteForm);
    await loadData();
    setInviteForm({ name: '', email: '', credentials: 'RDN', role: 'Clinical Dietitian' });
    setIsInviteModalOpen(false);
  };

  if (!clinic) {
    return (
      <div className="min-h-screen bg-[#F6F4EE] p-8 flex items-center justify-center font-sans text-stone-600">
        Loading clinic workspace...
      </div>
    );
  }

  const seatPercent = Math.min(100, Math.round((dietitians.length / clinic.totalSeats) * 100));

  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#1A2118] p-4 sm:p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Persistent Non-Dismissible PHI Boundary Safeguard Banner */}
        <PHIBoundaryBanner />

        
        {/* Top Header Card */}
        <header className="bg-white rounded-3xl p-6 lg:p-8 border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="material-symbols-outlined text-primary text-3xl">domain</span>
              <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-primary">
                {clinic.name}
              </h1>
              <span className="bg-primary text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider shadow-2xs">
                {clinic.tier.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs font-semibold text-stone-500">
              Multi-Tenant Clinical Administration & Practice Surveillance
            </p>
          </div>

          {/* Seat Utilization Indicator */}
          <div className="bg-[#F6F4EE] border border-stone-200/80 rounded-2xl p-4 w-full md:w-72 space-y-2 shrink-0">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-sage-text">badge</span>
                Seat Utilization
              </span>
              <span className="font-extrabold text-primary">
                {dietitians.length} / {clinic.totalSeats} Seats
              </span>
            </div>
            
            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500" 
                style={{ width: `${seatPercent}%` }} 
              />
            </div>
            
            <div className="flex justify-between items-center text-[10px] font-bold text-stone-500">
              <span>{clinic.totalSeats - dietitians.length} Seats Available</span>
              <span>{seatPercent}% Capacity</span>
            </div>
          </div>
        </header>

        {/* Top Row: 3 High-Level Clinic-Wide Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Metric 1: Total Active Patients */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                Total Active Patients
              </span>
              <span className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">groups</span>
              </span>
            </div>
            <div className="text-3xl font-display font-extrabold text-primary leading-none">
              {clinic.totalPatients}
            </div>
            <p className="text-xs font-medium text-stone-500">
              Across {dietitians.length} active practitioners in your clinic.
            </p>
          </div>

          {/* Metric 2: Global Adherence Rate */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                Global Adherence Rate
              </span>
              <span className="w-8 h-8 rounded-full bg-sage-bg flex items-center justify-center text-sage-text">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </span>
            </div>
            <div className="text-3xl font-display font-extrabold text-sage-text leading-none">
              {clinic.globalAdherence}%
            </div>
            <p className="text-xs font-medium text-stone-500">
              Patient meal days logged strictly within target GL budget.
            </p>
          </div>

          {/* Metric 3: Pending Discrepancy Audits */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                Discrepancy Audits
              </span>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center ${
                clinic.pendingAudits > 0 ? 'bg-amber-bg text-amber-text' : 'bg-sage-bg text-sage-text'
              }`}>
                <span className="material-symbols-outlined text-[18px]">
                  {clinic.pendingAudits > 0 ? 'notification_important' : 'check_circle'}
                </span>
              </span>
            </div>
            <div className={`text-3xl font-display font-extrabold leading-none ${
              clinic.pendingAudits > 0 ? 'text-amber-text' : 'text-sage-text'
            }`}>
              {clinic.pendingAudits} Flagged
            </div>
            <p className="text-xs font-medium text-stone-500">
              {clinic.pendingAudits > 0 
                ? 'Recipe macros require dietitian verification.' 
                : 'All claimed recipe values verified against USDA truth.'}
            </p>
          </div>
        </section>

        {/* Practitioner Roster Data Table */}
        <section className="bg-white rounded-3xl p-6 lg:p-8 border border-stone-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100 pb-5">
            <div>
              <h2 className="text-lg font-display font-extrabold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">clinical_notes</span>
                Practitioner Roster
              </h2>
              <p className="text-xs font-semibold text-stone-500 mt-0.5">
                Manage dietitian seats, credential authorizations, and caseload distribution.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="px-5 py-2.5 bg-primary text-white font-extrabold text-xs rounded-full hover:bg-primary-variant transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              + Invite Practitioner
            </button>
          </div>

          {/* Accessible Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-[11px] font-extrabold uppercase tracking-wider text-stone-500">
                  <th className="py-3 px-4">Practitioner Name</th>
                  <th className="py-3 px-4">Credentials</th>
                  <th className="py-3 px-4 text-center">Assigned Patients</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs font-medium">
                {dietitians.map((d) => (
                  <tr key={d.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-primary text-sm">{d.name}</div>
                      <div className="text-[11px] text-stone-500">{d.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-[#F6F4EE] border border-stone-200 text-stone-700 font-extrabold text-[10px] px-2.5 py-1 rounded-md">
                        {d.credentials}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-extrabold text-primary">
                      {d.activePatients}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {d.lastActive}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => alert(`Managing practitioner settings for ${d.name}`)}
                        className="p-1.5 rounded-xl hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
                        aria-label={`Manage ${d.name}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Invite Practitioner Modal */}
      {isInviteModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl w-full max-w-md border border-stone-200 shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-display font-extrabold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">person_add</span>
                Invite Practitioner
              </h3>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-primary uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="Dr. Jane Doe"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-stone-300 rounded-xl p-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-extrabold text-primary uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  placeholder="jane.doe@clinic.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full border border-stone-300 rounded-xl p-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-extrabold text-primary uppercase tracking-wider mb-1">
                  Clinical Credentials
                </label>
                <input
                  type="text"
                  placeholder="RDN, CDCES, LDN"
                  value={inviteForm.credentials}
                  onChange={(e) => setInviteForm((p) => ({ ...p, credentials: e.target.value }))}
                  className="w-full border border-stone-300 rounded-xl p-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 font-bold text-stone-600 hover:bg-stone-100 rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white font-extrabold rounded-full hover:bg-primary-variant shadow-md"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicDashboard;
