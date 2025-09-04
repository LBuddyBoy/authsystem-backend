import { deleteReplyById, getReplyById, updateReply } from "#db/query/replies";
import publicAccount from "#middleware/publicAccount";
import requireAccount from "#middleware/requireAccount";
import requireBody from "#middleware/requireBody";
import requirePermission from "#middleware/requirePermission";
import express from "express";
const router = express.Router();
export default router;

router.use(requireAccount);

router.param("id", async (req, res, next, id) => {
  const reply = await getReplyById(id);

  if (!reply)
    return res.status(404).json("A reply with that id could not be found.");

  req.reply = reply;
  next();
});

router.get("/:id", async (req, res) => {
  res.status(200).json(req.reply);
});

router.put("/:id", requireBody(["message"]), async (req, res) => {
  let reply = await updateReply(req.reply.id, req.body.message);

  if (!reply)
    return res.status(400).json("There was an error updating the reply.");

  reply = await getReplyById(req.reply.id);
  reply.account = publicAccount(reply.account);

  res.status(200).json(reply);
});

router.delete("/:id", async (req, res) => {
  const reply = await deleteReplyById(req.reply.id);

  if (!reply) return res.status(500).json("Error deleting reply.");

  res.status(204).json("Reply deleted!");
});
