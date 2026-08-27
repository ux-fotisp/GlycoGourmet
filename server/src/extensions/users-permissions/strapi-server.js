/**
 * Strapi Users & Permissions Plugin Server Extension
 * Overrides auth controllers to enforce isApproved = false on Google OAuth registration
 * and RBAC default role type assignment.
 *
 * Extended with dietitian credential fields (licenseId, credential, clinicName, onboarded).
 */
module.exports = (plugin) => {
  const sanitizeUser = (user) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    provider: user.provider,
    isApproved: user.isApproved ?? false,
    roleType: user.roleType || 'user',
    onboarded: user.onboarded ?? false,
    licenseId: user.licenseId || null,
    credential: user.credential || null,
    clinicName: user.clinicName || null,
    auditNotes: user.auditNotes || '',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });

  // Override auth provider callback controller
  const originalCallback = plugin.controllers.auth.callback;

  plugin.controllers.auth.callback = async (ctx) => {
    const provider = ctx.params.provider || 'local';

    // Execute standard plugin callback
    await originalCallback(ctx);

    // Inspect user payload returned in body
    if (ctx.body && ctx.body.user) {
      const user = ctx.body.user;

      // If Google provider and isApproved is undefined/null, enforce false on creation
      if (provider === 'google' && (user.isApproved === undefined || user.isApproved === null)) {
        try {
          const updatedUser = await strapi.entityService.update(
            'plugin::users-permissions.user',
            user.id,
            {
              data: {
                isApproved: false,
                roleType: user.roleType || 'user',
                auditNotes: 'Pending administrator audit review after Google OAuth creation.',
              },
            }
          );
          ctx.body.user = sanitizeUser(updatedUser);
        } catch (err) {
          ctx.body.user.isApproved = false;
        }
      } else {
        ctx.body.user = sanitizeUser(user);
      }
    }
  };

  return plugin;
};
