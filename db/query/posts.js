import db from "#db/client";
import { MAPPED_ACCOUNT_RETURNS } from "./accounts.js";

export async function createPost({ title, body, forum_id, account_id }) {
  const SQL = `
  INSERT INTO posts(title, body, forum_id, account_id)
  VALUES($1, $2, $3, $4)
  RETURNING *
  `;

  const {
    rows: [post],
  } = await db.query(SQL, [title, body, forum_id, account_id]);

  return post;
}

export async function getPostsByField(field, value) {
  const allowedFields = [
    "account_id",
    "forum_id",
    "title",
    "body"
  ];

  if (!allowedFields.includes(field)) {
    throw new Error("Invalid search field");
  }

  const SQL = `
    SELECT posts.*, row_to_json(accounts) AS account,
    (SELECT COUNT(*) FROM replies WHERE post_id = posts.id) AS replies
    FROM posts
    JOIN (
      SELECT accounts.*, row_to_json(roles) AS role
      FROM accounts
      JOIN roles ON roles.id = accounts.role_id
    ) accounts ON posts.account_id = accounts.id
    WHERE posts.${field} = $1
    ORDER BY posts.created_at DESC
    `;

  const { rows } = await db.query(SQL, [value]);

  return rows;
}

export async function getLatestPosts(limit) {
  const SQL = `
  SELECT posts.*, row_to_json(accounts) as account
  FROM posts
  JOIN (
    SELECT accounts.*, row_to_json(roles) as role
    FROM accounts
    JOIN roles ON roles.id = accounts.role_id
  ) accounts ON posts.account_id = accounts.id
  ORDER BY posts.created_at DESC
  LIMIT $1
  `;

  const { rows } = await db.query(SQL, [limit]);

  return rows;
}

export async function updatePost(id, fields) {
  const updates = Object.entries(fields).filter(
    ([k, v]) => v !== undefined && v !== null
  );

  const sets = updates.map(([key], i) => `${key} = $${i + 2}`);
  const values = updates.map(([_, value]) => value);

  const SQL = `
    UPDATE posts
    SET ${sets.join(", ")}
    WHERE id = $1
    RETURNING *
    `;

  const {
    rows: [post],
  } = await db.query(SQL, [id, ...values]);

  return post || undefined;
}

export async function getPostById(id) {
  const SQL = `
    SELECT posts.*, row_to_json(accounts) AS account,
    (SELECT COUNT(*) FROM replies WHERE post_id = posts.id) AS replies
    FROM posts
    JOIN (
      SELECT accounts.*, row_to_json(roles) AS role
      FROM accounts
      JOIN roles ON accounts.role_id = roles.id
    ) accounts ON posts.account_id = accounts.id
    WHERE posts.id = $1
    `;

  const {
    rows: [post],
  } = await db.query(SQL, [id]);

  return post;
}
