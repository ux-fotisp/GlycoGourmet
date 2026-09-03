'use strict';

/**
 * Bootstrap migration script for Multi-Tenant Clinic Backend Foundation.
 * Ensures default clinic exists and backfills legacy dietitian users and client profiles.
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
    } catch (_userErr) {
      // Gracefully continue if user table query fails
    }

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
    } catch (_profileErr) {
      // Gracefully continue if client-profile query fails
    }

    return defaultClinic;
  } catch (err) {
    strapi.log?.warn?.('[Bootstrap] Tenant backfill encountered non-critical error:', err);
  }
};
