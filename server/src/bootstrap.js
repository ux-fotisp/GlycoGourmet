'use strict';

/**
 * Bootstrap migration script for Multi-Tenant Clinic & Trust/Governance Backend.
 * Ensures default clinic exists, backfills legacy dietitian users/client profiles,
 * and seeds initial operational intake leads and default notification preferences.
 */
module.exports = async ({ strapi }) => {
  if (!strapi || !strapi.entityService) return;

  try {
    // 1. Check if default clinic exists
    const existingClinics = await strapi.entityService.findMany('api::clinic.clinic', {
      filters: { slug: 'clinic-glycemic-wellness' },
    });

    let defaultClinic = Array.isArray(existingClinics) && existingClinics.length > 0 ? existingClinics[0] : null;

    if (!defaultClinic) {
      defaultClinic = await strapi.entityService.create('api::clinic.clinic', {
        data: {
          name: 'Glycemic Wellness Center',
          slug: 'clinic-glycemic-wellness',
          tier: 'CLINIC_PRO',
          totalSeats: 5,
          activeSeats: 3,
        },
      });
      strapi.log?.info?.('[Bootstrap] Default clinic "Glycemic Wellness Center" created successfully.');
    }

    if (!defaultClinic || !defaultClinic.id) return defaultClinic;

    // 2. Backfill existing dietitian & clinic_admin users without clinic relation
    try {
      const usersToBackfill = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: {
          roleType: { $in: ['dietitian', 'clinic_admin'] },
          clinic: { $null: true },
        },
      });

      if (Array.isArray(usersToBackfill) && usersToBackfill.length > 0) {
        for (const u of usersToBackfill) {
          await strapi.entityService.update('plugin::users-permissions.user', u.id, {
            data: { clinic: defaultClinic.id },
          });
        }
        strapi.log?.info?.(`[Bootstrap] Backfilled ${usersToBackfill.length} clinical users to default clinic.`);
      }
    } catch (_userErr) {}

    // 3. Backfill existing client profiles without clinic relation
    try {
      const profilesToBackfill = await strapi.entityService.findMany('api::client-profile.client-profile', {
        filters: {
          clinic: { $null: true },
        },
      });

      if (Array.isArray(profilesToBackfill) && profilesToBackfill.length > 0) {
        for (const p of profilesToBackfill) {
          await strapi.entityService.update('api::client-profile.client-profile', p.id, {
            data: { clinic: defaultClinic.id },
          });
        }
        strapi.log?.info?.(`[Bootstrap] Backfilled ${profilesToBackfill.length} client profiles to default clinic.`);
      }
    } catch (_profileErr) {}

    // 4. Seed initial de-identified intake leads attached to default clinic if empty
    try {
      const existingLeads = await strapi.entityService.findMany('api::intake-lead.intake-lead', {
        filters: { clinic: defaultClinic.id },
      });

      if (!existingLeads || existingLeads.length === 0) {
        const INITIAL_LEADS = [
          {
            referenceCode: 'INT-1011',
            referralSource: 'self_service_redirect',
            serviceTier: 'FULL_CARE',
            stage: 'Inquiry',
            stageReason: 'Attempted contact',
          },
          {
            referenceCode: 'INT-1012',
            referralSource: 'gp_referral',
            serviceTier: 'FULL_CARE',
            stage: 'Contacted',
            stageReason: 'Attempted contact',
          },
          {
            referenceCode: 'INT-1013',
            referralSource: 'campaign',
            serviceTier: 'ONLINE_SESSION_ONLY',
            stage: 'Intake Sent',
            stageReason: 'Intake materials sent',
          },
          {
            referenceCode: 'INT-1014',
            referralSource: 'walk_in',
            serviceTier: 'FULL_CARE',
            stage: 'Scheduled',
            stageReason: 'Appointment coordination',
          },
          {
            referenceCode: 'INT-1015',
            referralSource: 'patient_referral',
            serviceTier: 'FULL_CARE',
            stage: 'Active',
            stageReason: 'Administrative follow-up',
          },
          {
            referenceCode: 'INT-1016',
            referralSource: 'self_service_redirect',
            serviceTier: 'ONLINE_SESSION_ONLY',
            stage: 'Lapsed',
            stageReason: 'No response',
          },
          {
            referenceCode: 'INT-1017',
            referralSource: 'gp_referral',
            serviceTier: 'FULL_CARE',
            stage: 'Inquiry',
            stageReason: 'Attempted contact',
          },
        ];

        for (const lead of INITIAL_LEADS) {
          await strapi.entityService.create('api::intake-lead.intake-lead', {
            data: {
              ...lead,
              clinic: defaultClinic.id,
            },
          });
        }
        strapi.log?.info?.(`[Bootstrap] Seeded ${INITIAL_LEADS.length} initial operational intake leads.`);
      }
    } catch (_leadErr) {}

    // 5. Seed default notification preferences for existing users without preferences
    try {
      const allUsers = await strapi.entityService.findMany('plugin::users-permissions.user', {});
      if (Array.isArray(allUsers) && allUsers.length > 0) {
        for (const u of allUsers) {
          const userPrefs = await strapi.entityService.findMany('api::notification-preference.notification-preference', {
            filters: { user: u.id },
          });

          if (!userPrefs || userPrefs.length === 0) {
            await strapi.entityService.create('api::notification-preference.notification-preference', {
              data: {
                user: u.id,
                category: 'care_reminders',
                enabled: true,
                quietHoursStart: '22:00',
                quietHoursEnd: '07:00',
                frequencyCap: 'weekly',
              },
            });
            await strapi.entityService.create('api::notification-preference.notification-preference', {
              data: {
                user: u.id,
                category: 'promoted_dietitians',
                enabled: false,
                quietHoursStart: '22:00',
                quietHoursEnd: '07:00',
                frequencyCap: 'weekly',
              },
            });
          }
        }
      }
    } catch (_notifErr) {}

    return defaultClinic;
  } catch (err) {
    strapi.log?.warn?.('[Bootstrap] Tenant backfill encountered non-critical error:', err);
  }
};
