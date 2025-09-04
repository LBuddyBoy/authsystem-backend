import {
  createPost,
  getLatestPosts,
  getPostById,
  getPostsByField,
  updatePost,
} from "#db/query/posts";
import { createReply, getRepliesByPost } from "#db/query/replies";
import publicAccount from "#middleware/publicAccount";
import requireAccount from "#middleware/requireAccount";
import requireBody from "#middleware/requireBody";
import express from "express";
const router = express.Router();

export default router;

router.post(
  "/",
  requireAccount,
  requireBody(["title", "body", "forum_id"]),
  async (req, res) => {
    const { title, body, forum_id } = req.body;
    const post = await createPost({ title, body, forum_id, account_id: req.account.id });

    res.status(201).json(post);
  }
);

router.param("id", async (req, res, next, id) => {
  const post = await getPostById(id);

  if (!post) {
    return res.status(404).json("Couldn't find a post with that id.");
  }

  req.post = post;
  req.post.account = publicAccount(req.post.account);
  next();
});

router.put("/:id", async (req, res) => {
  const { ...fields } = req.body;

  if (Object.entries(fields).length === 0) {
    return res.status(400).json("No fields found to update.");
  }

  try {
    await updatePost(req.post.id, fields);
  } catch (error) {
    return res.status(400).json(error.detail);
  }

  const post = await getPostById(req.post.id);

  res.status(200).json(post);
});

router.get("/me", requireAccount, async (req, res) => {
  res.status(200).json(await getPostsByField("account_id", req.account.id));
});

router.get("/latest/:limit", async (req, res) => {
  const { limit } = req.params;
  res.status(200).json(await getLatestPosts(limit));
});

router.get("/:id", async (req, res) => {
  res.status(200).json(req.post);
});

router.get("/:id/replies", async (req, res) => {
  res.status(200).json(await getRepliesByPost(req.post.id));
});

router.post("/:id/replies", requireAccount, requireBody(["message"]), async (req, res) => {
  const { message } = req.body;
  const reply = await createReply({
    message: message,
    account_id: req.account.id,
    post_id: req.post.id,
    forum_id: req.post.forum_id,
  });

  if (!reply)
    return res.status(400).json("There was an error creating a reply.");

  res.status(201).json(reply);
});
