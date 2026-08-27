const Strapi = require('@strapi/strapi');

async function seed() {
  const strapi = await Strapi({ appDir: '.', serveAdminPanel: false }).load();

  // Create Dietitian A
  const dietitianA = await strapi.entityService.create('plugin::users-permissions.user', {
    data: {
      username: 'dietitianA_' + Date.now(),
      email: 'dietitiana' + Date.now() + '@glyco.com',
      password: 'Password123!',
      roleType: 'dietitian',
      confirmed: true
    }
  });

  // Create Dietitian B
  const dietitianB = await strapi.entityService.create('plugin::users-permissions.user', {
    data: {
      username: 'dietitianB_' + Date.now(),
      email: 'dietitianb' + Date.now() + '@glyco.com',
      password: 'Password123!',
      roleType: 'dietitian',
      confirmed: true
    }
  });

  // Create Patient User
  const patientA = await strapi.entityService.create('plugin::users-permissions.user', {
    data: {
      username: 'patientA_' + Date.now(),
      email: 'patienta' + Date.now() + '@glyco.com',
      password: 'Password123!',
      roleType: 'user',
      confirmed: true
    }
  });

  // Create ClientProfile for A
  await strapi.entityService.create('api::client-profile.client-profile', {
    data: {
      patient: patientA.id,
      dietitian: dietitianA.id,
      diabeticSubtype: 'T2D',
      status: 'active'
    }
  });
  
  // Write Dietitian B credentials to a file so the test can use them
  const fs = require('fs');
  fs.writeFileSync('../tests/integration/.seed_data.json', JSON.stringify({
    dietitianBEmail: dietitianB.email,
    dietitianBPassword: 'Password123!'
  }));

  console.log('Seeding complete');
  await strapi.destroy();
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});