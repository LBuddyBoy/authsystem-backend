import express from "express";
import { useAuth } from "./utils.js";
import {
  getAccountById,
  getAccounts,
  getAccountsByField,
  updateAccount,
} from "#db/query/accounts";
import getStats from "#db/query/stats";
import requireAccount from "#middleware/requireAccount";
import requirePermission from "#middleware/requirePermission";

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

router.get("/accounts/search/:field/:query", async (req, res) => {
  const { field, query } = req.params;

  if (!query) {
    return res.status(400).json("Couldn't find a provided query.");
  }

  res.status(200).json(await getAccountsByField(field, query));
});

router.get("/accounts/:limit/:cursor", async (req, res) => {
  const limit = Number(req.params.limit);
  const cursor = req.params.cursor ? Number(req.params.cursor) : null;

  if (!limit || limit < 1) {
    return res.status(400).json("Limit must be a positive number.");
  }

  try {
    res.status(200).json(await getAccounts(limit, cursor));
  } catch (error) {
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
