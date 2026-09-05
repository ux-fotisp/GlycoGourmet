const Strapi = require('@strapi/strapi');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

async function seed() {
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

  const strapi = await Strapi({ appDir: '.', serveAdminPanel: false }).load();

  // Find Authenticated Role
  const roles = await strapi.entityService.findMany('plugin::users-permissions.role', {
    filters: { type: 'authenticated' }
  });
  const authRole = roles[0];

  // Grant find and findOne permissions to Authenticated Role for client-profile
  const permissions = await strapi.entityService.findMany('plugin::users-permissions.permission', {
    filters: {
      role: authRole.id,
      action: { $in: ['api::client-profile.client-profile.find', 'api::client-profile.client-profile.findOne'] }
    }
  });
  
  if (permissions.length === 0) {
    await strapi.entityService.create('plugin::users-permissions.permission', {
      data: {
        action: 'api::client-profile.client-profile.find',
        role: authRole.id
      }
    });
    await strapi.entityService.create('plugin::users-permissions.permission', {
      data: {
        action: 'api::client-profile.client-profile.findOne',
        role: authRole.id
      }
    });
  }

  const userService = strapi.plugin('users-permissions').service('user');

  const pwDietitianA = generatePassword('dietitianA');
  const pwDietitianB = generatePassword('dietitianB');
  const pwPatientA = generatePassword('patientA');
  const pwClinicAdminA = generatePassword('clinicAdminA');
  const pwAdminA = generatePassword('adminA');

  // Create Dietitian A
  const dietitianA = await userService.add({
    username: 'dietitianA_' + Date.now(),
    email: 'dietitiana' + Date.now() + '@glyco.com',
    password: pwDietitianA,
    roleType: 'dietitian',
    role: authRole.id,
    confirmed: true,
    provider: 'local'
  });

  // Create Dietitian B
  const dietitianB = await userService.add({
    username: 'dietitianB_' + Date.now(),
    email: 'dietitianb' + Date.now() + '@glyco.com',
    password: pwDietitianB,
    roleType: 'dietitian',
    role: authRole.id,
    confirmed: true,
    provider: 'local'
  });

  // Create Patient User
  const patientA = await userService.add({
    username: 'patientA_' + Date.now(),
    email: 'patienta' + Date.now() + '@glyco.com',
    password: pwPatientA,
    roleType: 'user',
    role: authRole.id,
    confirmed: true,
    provider: 'local'
  });

  // Create Clinic Admin User
  const clinicAdminA = await userService.add({
    username: 'clinicAdminA_' + Date.now(),
    email: 'clinicadmina' + Date.now() + '@glyco.com',
    password: pwClinicAdminA,
    roleType: 'clinic_admin',
    role: authRole.id,
    confirmed: true,
    provider: 'local'
  });

  // Create Admin User
  const adminA = await userService.add({
    username: 'adminA_' + Date.now(),
    email: 'admina' + Date.now() + '@glyco.com',
    password: pwAdminA,
    roleType: 'admin',
    role: authRole.id,
    confirmed: true,
    provider: 'local'
  });

  // Create ClientProfile for A
  const profileA = await strapi.entityService.create('api::client-profile.client-profile', {
    data: {
      patient: patientA.id,
      dietitian: dietitianA.id,
      diabeticSubtype: 'T2D',
      status: 'active'
    }
  });
  
  // Write credentials to file only in non-production local runs for integration testing
  if (!isPublicOrProd) {
    const seedDataPath = path.resolve(__dirname, '../tests/integration/.seed_data.json');
    if (fs.existsSync(path.dirname(seedDataPath))) {
      fs.writeFileSync(seedDataPath, JSON.stringify({
        dietitianAEmail: dietitianA.email,
        dietitianAPassword: pwDietitianA,
        dietitianAId: dietitianA.id,
        dietitianBEmail: dietitianB.email,
        dietitianBPassword: pwDietitianB,
        dietitianBId: dietitianB.id,
        patientAEmail: patientA.email,
        patientAPassword: pwPatientA,
        profileAId: profileA.id,
        clinicAdminAEmail: clinicAdminA.email,
        clinicAdminAPassword: pwClinicAdminA,
        clinicAdminAId: clinicAdminA.id,
        adminAEmail: adminA.email,
        adminAPassword: pwAdminA,
      }, null, 2));
    }
  } else {
    console.log('[SECURITY SG-1/SG-3] Skipped writing .seed_data.json to disk in public/production deployment.');
  }

  console.log('Seeding complete');
  await strapi.destroy();
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});