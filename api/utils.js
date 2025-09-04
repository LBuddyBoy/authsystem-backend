import { getAccountById, validateJWT } from "#db/query/accounts";
import { getRoleById } from "#db/query/roles";

/**
 *
 * @param req the request parameter from a router or express
 * @param res the response parameter from a router or express
 * @returns true if it passed all conditions false if it failed conditions as well as already handles errors and responses.
 * 
 */
export async function useAuth(req, res) {
  if (true) { // TODO: Make it so you can only request from local
    return true;
  }

  const { authorization } = req.headers;

  if (!authorization) {
    res.status(400).json("Unable to find an authorization token.");
    return false;
  }

  const token = authorization.split(" ")[1];
  const id = await validateJWT(token);

  if (!id) {
    res.status(400).json("Session expired.");
    return false;
  }

  const account = await getAccountById(id);

  if (!account) {
    res.status(400).json("Unable to find an account under that token.");
    return false;
  }

  const role = await getRoleById(account.role_id);

  if (!role) {
    res.status(400).json("There was an error validating your role.");
    return false;
  }

  if (!role.permissions.includes("route" + req.baseUrl)) {
    res.status(400).json("You are not authorized to go to that route.");
    return false;
  }

  return true;
}

export function isValidId(id) {
  const idNum = Number(id);

  return (
    /^\d+$/.test(id) &&
    !Number.isNaN(idNum) &&
    Number.isInteger(idNum) &&
    idNum >= 0
  );
}
