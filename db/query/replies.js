import db from "#db/client";
import { MAPPED_ACCOUNT_RETURNS } from "./accounts.js";

export async function createReply({message, account_id, post_id, forum_id}) {
  const sql = `
    INSERT INTO replies(message, account_id, post_id, forum_id)
    VALUES($1, $2, $3, $4)
    RETURNING *
    `;

  const {
    rows: [reply],
  } = await db.query(sql, [message, account_id, post_id, forum_id]);

  return reply;
}

export async function deleteReplyById(id) {
  const SQL = `
    DELETE FROM replies
    WHERE id = $1
    RETURNING *
    `;

  const {
    rows: [reply],
  } = await db.query(SQL, [id]);

  return reply;
}

export async function updateReply(reply_id, message) {
    const SQL = `
    UPDATE replies
    SET message = $1, last_edited = now(), has_been_edited = true
    WHERE id = $2
    RETURNING *
    `;

    const {rows: [reply]} = await db.query(SQL, [message, reply_id]);

    return reply;
}

export async function getReplyById(id) {
  const SQL = `
    SELECT replies.*, row_to_json(accounts) AS account
    FROM replies
    JOIN (
        SELECT accounts.*, row_to_json(roles) AS role
        FROM accounts
        JOIN roles ON roles.id = accounts.role_id
    ) accounts ON accounts.id = replies.account_id
    WHERE replies.id = $1
    `;

  const {
    rows: [reply],
  } = await db.query(SQL, [id]);

  return reply;
}

export async function getRepliesByPost(post_id) {
  const SQL = `
    SELECT replies.*, posts.id as post_id, row_to_json(accounts) AS account
    FROM replies
    JOIN posts ON replies.post_id = posts.id
    JOIN (
        SELECT accounts.*, row_to_json(roles) AS role
        FROM accounts
        JOIN roles ON accounts.role_id = roles.id
    ) accounts ON replies.account_id = accounts.id
    WHERE posts.id = $1
    ORDER BY replies.created_at
    `;

  const { rows } = await db.query(SQL, [post_id]);

  return rows;
}
