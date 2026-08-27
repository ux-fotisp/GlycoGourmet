const Strapi = require('@strapi/strapi');

async function seed() {
  const strapi = await Strapi({ appDir: '.', serveAdminPanel: false }).load();

  // Find Authenticated Role
  const roles = await strapi.entityService.findMany('plugin::users-permissions.role', {
    filters: { type: 'authenticated' }
  });
  const authRole = roles[0];

  const userService = strapi.plugin('users-permissions').service('user');

  // Create Dietitian A
  const dietitianA = await userService.add({
    username: 'dietitianA_' + Date.now(),
    email: 'dietitiana' + Date.now() + '@glyco.com',
    password: 'Password123!',
    roleType: 'dietitian',
    role: authRole.id,
    confirmed: true,
    provider: 'local'
  });

  // Create Dietitian B
  const dietitianB = await userService.add({
    username: 'dietitianB_' + Date.now(),
    email: 'dietitianb' + Date.now() + '@glyco.com',
    password: 'Password123!',
    roleType: 'dietitian',
    role: authRole.id,
    confirmed: true,
    provider: 'local'
  });

  // Create Patient User
  const patientA = await userService.add({
    username: 'patientA_' + Date.now(),
    email: 'patienta' + Date.now() + '@glyco.com',
    password: 'Password123!',
    roleType: 'user',
    role: authRole.id,
    confirmed: true,
    provider: 'local'
  });

  // Create Admin User
  const adminA = await userService.add({
    username: 'adminA_' + Date.now(),
    email: 'admina' + Date.now() + '@glyco.com',
    password: 'Password123!',
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
  
  // Write Dietitian B & A credentials to a file so the test can use them
  const fs = require('fs');
  fs.writeFileSync('../tests/integration/.seed_data.json', JSON.stringify({
    dietitianAEmail: dietitianA.email,
    dietitianAPassword: 'Password123!',
    dietitianAId: dietitianA.id,
    dietitianBEmail: dietitianB.email,
    dietitianBPassword: 'Password123!',
    dietitianBId: dietitianB.id,
    patientAEmail: patientA.email,
    patientAPassword: 'Password123!',
    profileAId: profileA.id,
    adminAEmail: adminA.email,
    adminAPassword: 'Password123!',
  }));

  console.log('Seeding complete');
  await strapi.destroy();
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
