module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'testAdminSecret'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'testApiSalt'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'testTransferSalt'),
    },
  },
});
