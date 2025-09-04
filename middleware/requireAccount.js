export default async function requireAccount(req, res, next) {
  if (!req.account) return res.status(401).send("Unauthorized");
  next();
}