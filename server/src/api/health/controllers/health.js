'use strict';

module.exports = {
  async check(ctx) {
    ctx.status = 200;
    ctx.body = {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  },
};
