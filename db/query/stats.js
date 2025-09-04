import db from "#db/client";

export default async function getStats() {
  const SQL = `
  SELECT
  (SELECT COUNT(*) FROM accounts) AS accounts,
  (SELECT COUNT(*) FROM roles) AS roles,
  (SELECT COUNT(*) FROM forums) AS forums,
  (SELECT COUNT(*) FROM posts) AS posts,
  (SELECT COUNT(*) FROM replies) AS replies
  `;

  const { rows } = await db.query(SQL);

  return rows[0];
}
