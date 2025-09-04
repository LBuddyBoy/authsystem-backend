import express from "express";
import cors from "cors";
import accountRouter from "#api/accountRouter";
import authRouter from "#api/adminRouter";
import roleRouter from "#api/roleRouter";
import forumRouter from "#api/forumRouter";
import postRouter from "#api/postRouter";
import repliesRouter from "#api/repliesRouter";
import morgan from "morgan";
import { getAccountByToken } from "#middleware/getAccountByToken";

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

app.use(getAccountByToken);

app.use("/account", accountRouter);
app.use("/replies", repliesRouter);
app.use("/admin", authRouter);
app.use("/forums", forumRouter);
app.use("/posts", postRouter);
app.use("/roles", roleRouter);

app.get("/", (req, res) => {
    res.send("Account System Online ✅");
});

app.use((err, req, res, next) => {
  switch (err.code) {
    case "22P02":
      return res.status(400).send(err.message);
    case "23505":
    case "23503":
      return res.status(400).send(err.detail);
    default:
      next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Sorry! Something went wrong.");
});


export default app;