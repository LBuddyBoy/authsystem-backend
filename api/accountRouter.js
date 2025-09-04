import express from "express";
import {
  createAccount,
  generateJWT,
  getAccountById,
  validateAccount,
  validateJWT,
} from "#db/query/accounts";
import requireBody from "#middleware/requireBody";
import publicAccount from "#middleware/publicAccount";

const router = express.Router();

export default router;

router.post(
  "/signup",
  requireBody(["username", "email", "password"]),
  async (req, res) => {
    try {
      const account = await createAccount(req.body);

      res.status(201).json(publicAccount(account));
    } catch (error) {
      res.status(400).json(error.message);
    }
  }
);

router.post("/login", requireBody(["email", "password"]), async (req, res) => {
  const account = await validateAccount(req.body);

  if (!account) {
    return res.status(400).json("Incorrect password or email provided.");
  }

  const { token } = await generateJWT(account.id);

  res.status(200).json({
    token,
    account,
  });
});

router.post("/verify", requireBody(["jwt"]), async (req, res) => {
  const { jwt } = req.body;
  const id = await validateJWT(jwt);

  if (!id) {
    return res
      .status(404)
      .json("That token is either expired or does not exist.");
  }

  const account = await getAccountById(id);

  res.status(200).json(account);
});
