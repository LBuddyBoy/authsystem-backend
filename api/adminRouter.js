import express from "express";
import {
  getAccountById,
  getAccounts,
  updateAccount,
} from "#db/query/accounts";
import getStats from "#db/query/stats";
import requireAccount from "#middleware/requireAccount";
import requirePermission from "#middleware/requirePermission";
import requireQuery from "#middleware/requireQuery";

const router = express.Router();

export default router;

router.get("/stats", async (req, res) => {
  const stats = await getStats();

  res.status(200).json(stats);
});

router.use(requireAccount);
router.use(requirePermission("admin:panel"));

router.get("/", async (req, res) => {
  res.status(200).json("Access Granted");
});

router.get("/accounts", requireQuery(["page", "limit"]), async (req, res) => {
  const { limit } = req.query;

  if (!limit || limit < 1) {
    return res.status(400).json("Limit must be a positive number.");
  }

  try {
    res.status(200).json(await getAccounts(req.query));
  } catch (error) {
    console.log(error);
    res.status(400).json(error.detail);
  }
});

router.put("/account", async (req, res) => {
  if (!req.body) {
    return res.status(400).json("Invalid body provided.");
  }

  const { id, ...fields } = req.body;

  if (!id) {
    return res.status(400).json("Missing account id.");
  }

  if (Object.entries(fields).length === 0) {
    return res.status(400).json("No fields found to update.");
  }

  try {
    await updateAccount(id, fields);
  } catch (error) {
    return res.status(400).json(error.detail);
  }

  const account = await getAccountById(id);

  res.status(200).json(account);
});

router.delete("/account", async (req, res) => {
  if (!req.body) {
    return res.status(400).json("Invalid body provided.");
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json("Missing account id.");
  }

  try {
    res.status(204).json("Account Deleted");
  } catch (error) {
    return res.status(400).json(error.detail);
  }
});
