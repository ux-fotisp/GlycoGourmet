/**
 * Strapi Users & Permissions Plugin Server Extension
 * Overrides auth controllers to enforce isApproved = false on Google OAuth registration
 * and RBAC default role type assignment.
 */
module.exports = (plugin) => {
  const sanitizeUser = (user) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    provider: user.provider,
    isApproved: user.isApproved ?? false,
    roleType: user.roleType || 'user',
    auditNotes: user.auditNotes || '',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });

  const originalCallback = plugin.controllers.auth.callback;

  plugin.controllers.auth.callback = async (ctx) => {
    const provider = ctx.params.provider || 'local';

    await originalCallback(ctx);

    if (ctx.body && ctx.body.user) {
      const user = ctx.body.user;

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
