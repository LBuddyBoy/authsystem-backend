import { getAccountById, validateJWT } from "#db/query/accounts";
import { getRoleById } from "#db/query/roles";

export async function getAccountByToken(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next();
  }

  const token = authorization.split(" ")[1];
  const id = await validateJWT(token);

  if (!id) {
    return res.status(403).json("Session expired.");
  }

  const account = await getAccountById(id);

  if (!account) {
    return res.status(400).json("Unable to find an account under that token.");
  }

  if (!account.role) {
    return res.status(400).json("There was an error validating your role.");
  }

  req.account = account;

  next();
}
