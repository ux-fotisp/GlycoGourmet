'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/health',
      handler: 'health.check',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/_health',
      handler: 'health.check',
      config: {
        auth: false,
      },
    },
  ],
};
