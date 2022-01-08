module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '0d8a4275bc59c6d629092772192dbcee'),
  },
});
