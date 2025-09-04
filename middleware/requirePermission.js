/**
 *
 * Require permission for a specific route
 *
 * @param permission required to access route
 * @returns middleware for verification
 */
export default function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.account.role.permissions.includes(permission)) {
      return res
        .status(403)
        .json("You are not authorized to go to that route.");
    }

    next();
  };
}
