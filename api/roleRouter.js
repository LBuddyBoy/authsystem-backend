import { getRoleById, getRoles, updateRole, deleteRole, createRole } from "#db/query/roles";
import requireAccount from "#middleware/requireAccount";
import requirePermission from "#middleware/requirePermission";
import { isValidId, useAuth } from "./utils.js";
import express from "express";

const router = express.Router();

export default router;

router.use(requireAccount);
router.use(requirePermission("admin:panel"));

router.get("/", async (req, res) => {
  res.status(200).json(await getRoles());
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json("The id must be a positive integer.");
  }

  const role = await getRoleById(id);

  if (!role) {
    return res.status(400).json("Couldn't find a role with that id.");
  }

  res.status(200).json(role);
});

router.delete("/", async (req, res) => {
  if (!req.body) {
    return res.status(400).json("Invalid body provided.");
  }

  try {
    const { id, ...fields } = req.body;
    const role = await deleteRole(id, fields);

    res.status(204).json(role);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.post("/", async (req, res) => {
  if (!req.body) {
    return res.status(400).json("Invalid body provided.");
  }

  try {
    const { name, weight, is_default, is_staff, icon } = req.body;
    const role = await createRole({name, weight, is_default, is_staff, icon});

    res.status(201).json(role);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.put("/", async (req, res) => {
  if (!req.body) {
    return res.status(400).json("Invalid body provided.");
  }

  try {
    const { id, ...fields } = req.body;
    const role = await updateRole(id, fields);

    res.status(200).json(role);
  } catch (error) {
    res.status(400).json(error.message);
  }
});
