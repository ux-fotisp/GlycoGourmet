'use strict';

const Strapi = require('@strapi/strapi');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

async function seed(existingStrapi) {
  const isPublicOrProd =
    process.env.NODE_ENV === 'production' ||
    process.env.PUBLIC_DEPLOYMENT === 'true';

  // --- SG-1 / SG-3 Security Gate ---
  // In production or public deployments, never use static 'Password123!'.
  // Require either an explicitly set strong SEED_PASSWORD env var or generate
  // cryptographically secure per-role random passwords printed once to deploy logs.
  const generatePassword = (roleName) => {
    if (isPublicOrProd) {
      if (process.env.SEED_PASSWORD) {
        if (process.env.SEED_PASSWORD === 'Password123!') {
          throw new Error(
            '[SECURITY SG-1/SG-3] Explicitly rejecting forbidden default password in public/production deployment.'
          );
        }
        return process.env.SEED_PASSWORD;
      }
      const randomSecret = 'Gg!' + crypto.randomBytes(16).toString('base64url') + '#9';
      console.warn(
        `[SECURITY SG-1/SG-3] Public/Production deployment detected. Randomized credential generated for role [${roleName}]: ${randomSecret}`
      );
      return randomSecret;
    }
    return process.env.SEED_PASSWORD || 'Password123!';
  };

  const isExternalStrapi = Boolean(existingStrapi);
  const strapi = existingStrapi || (await Strapi({ appDir: '.', serveAdminPanel: false }).load());

  try {
    // 1. Find Authenticated Role
    const roles = await strapi.entityService.findMany('plugin::users-permissions.role', {
      filters: { type: 'authenticated' },
    });
    const authRole = roles && roles[0];
    if (!authRole) {
      throw new Error('[SEED] Authenticated role not found in Strapi permissions registry.');
    }

    // 2. Grant find and findOne permissions to Authenticated Role for client-profile
    const permissions = await strapi.entityService.findMany('plugin::users-permissions.permission', {
      filters: {
        role: authRole.id,
        action: { $in: ['api::client-profile.client-profile.find', 'api::client-profile.client-profile.findOne'] },
      },
    });

    if (!permissions || permissions.length === 0) {
      await strapi.entityService.create('plugin::users-permissions.permission', {
        data: {
          action: 'api::client-profile.client-profile.find',
          role: authRole.id,
        },
      });
      await strapi.entityService.create('plugin::users-permissions.permission', {
        data: {
          action: 'api::client-profile.client-profile.findOne',
          role: authRole.id,
        },
      });
      console.log('[SEED] Granted client-profile permissions to Authenticated role.');
    }

    // 3. Find default clinic for relation backfill if present
    const defaultClinics = await strapi.entityService.findMany('api::clinic.clinic', {
      filters: { slug: 'clinic-glycemic-wellness' },
    });
    const defaultClinicId = Array.isArray(defaultClinics) && defaultClinics.length > 0 ? defaultClinics[0].id : null;

    const userService = strapi.plugin('users-permissions').service('user');

    // 4. Deterministic synthetic demo identities
    const DEMO_ACCOUNTS = [
      {
        key: 'dietitianA',
        username: 'demo_dietitian',
        email: 'demo-dietitian@glycogourmet.demo',
        roleType: 'dietitian',
      },
      {
        key: 'dietitianB',
        username: 'demo_dietitian_b',
        email: 'demo-dietitian-b@glycogourmet.demo',
        roleType: 'dietitian',
      },
      {
        key: 'patientA',
        username: 'demo_patient',
        email: 'demo-patient@glycogourmet.demo',
        roleType: 'user',
      },
      {
        key: 'clinicAdminA',
        username: 'demo_clinic_admin',
        email: 'demo-clinic-admin@glycogourmet.demo',
        roleType: 'clinic_admin',
      },
      {
        key: 'adminA',
        username: 'demo_admin',
        email: 'demo-admin@glycogourmet.demo',
        roleType: 'admin',
      },
    ];

    const seededUsers = {};

    // 5. Idempotent user provisioning
    for (const acc of DEMO_ACCOUNTS) {
      const existing = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: { email: acc.email },
      });

      let userRecord = Array.isArray(existing) && existing.length > 0 ? existing[0] : null;

      if (!userRecord) {
        const password = generatePassword(acc.key);
        const userData = {
          username: acc.username,
          email: acc.email,
          password: password,
          roleType: acc.roleType,
          role: authRole.id,
          confirmed: true,
          provider: 'local',
        };
        if (defaultClinicId && ['dietitian', 'user', 'clinic_admin'].includes(acc.roleType)) {
          userData.clinic = defaultClinicId;
        }

        userRecord = await userService.add(userData);
        console.log(`[SEED] Created synthetic demo user [${acc.roleType}]: ${acc.email}`);
        seededUsers[acc.key] = { id: userRecord.id, email: userRecord.email, password };
      } else {
        console.log(`[SEED] Synthetic demo user [${acc.roleType}] already exists: ${acc.email} (skipping creation)`);
        seededUsers[acc.key] = { id: userRecord.id, email: userRecord.email };
      }
    }

    // 6. Idempotent ClientProfile creation for demo patient
    if (seededUsers.patientA && seededUsers.dietitianA) {
      const existingProfiles = await strapi.entityService.findMany('api::client-profile.client-profile', {
        filters: { patient: seededUsers.patientA.id },
      });

      if (!existingProfiles || existingProfiles.length === 0) {
        const profileData = {
          patient: seededUsers.patientA.id,
          dietitian: seededUsers.dietitianA.id,
          diabeticSubtype: 'T2D',
          status: 'active',
        };
        if (defaultClinicId) {
          profileData.clinic = defaultClinicId;
        }

        const profileA = await strapi.entityService.create('api::client-profile.client-profile', {
          data: profileData,
        });
        console.log(`[SEED] Created synthetic ClientProfile [ID ${profileA.id}] for demo patient.`);
        seededUsers.profileAId = profileA.id;
      } else {
        console.log('[SEED] Synthetic ClientProfile already exists for demo patient (skipping creation).');
        seededUsers.profileAId = existingProfiles[0].id;
      }
    }

    // 7. Write credentials to disk only in non-production local runs for integration testing
    if (!isPublicOrProd) {
      const seedDataPath = path.resolve(__dirname, '../tests/integration/.seed_data.json');
      if (fs.existsSync(path.dirname(seedDataPath))) {
        fs.writeFileSync(
          seedDataPath,
          JSON.stringify(
            {
              dietitianAEmail: seededUsers.dietitianA?.email,
              dietitianAPassword: seededUsers.dietitianA?.password || 'Password123!',
              dietitianAId: seededUsers.dietitianA?.id,
              dietitianBEmail: seededUsers.dietitianB?.email,
              dietitianBPassword: seededUsers.dietitianB?.password || 'Password123!',
              dietitianBId: seededUsers.dietitianB?.id,
              patientAEmail: seededUsers.patientA?.email,
              patientAPassword: seededUsers.patientA?.password || 'Password123!',
              profileAId: seededUsers.profileAId,
              clinicAdminAEmail: seededUsers.clinicAdminA?.email,
              clinicAdminAPassword: seededUsers.clinicAdminA?.password || 'Password123!',
              clinicAdminAId: seededUsers.clinicAdminA?.id,
              adminAEmail: seededUsers.adminA?.email,
              adminAPassword: seededUsers.adminA?.password || 'Password123!',
            },
            null,
            2
          )
        );
      }
    } else {
      console.log('[SECURITY SG-1/SG-3] Skipped writing .seed_data.json to disk in public/production deployment.');
    }

    console.log('[SEED] Demo seeding completed successfully.');
    return seededUsers;
  } finally {
    if (!isExternalStrapi) {
      await strapi.destroy();
    }
  }
}

module.exports = seed;

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}