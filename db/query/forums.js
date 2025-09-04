import db from "#db/client";

export async function createForum({name, description, allows_replies, required_permission}) {
  const SQL = `
  INSERT INTO forums(name, description, allows_replies, required_permission)
  VALUES($1, $2, $3, $4)
  RETURNING *
  `;

  const {
    rows: [forum],
  } = await db.query(SQL, [name, description, allows_replies, required_permission]);

  return forum;
}

export async function getForums() {
  const SQL = `
    SELECT 
      f.*,
      (SELECT COUNT(*) FROM posts WHERE forum_id = f.id) AS posts,
      (SELECT COUNT(*) FROM replies WHERE forum_id = f.id) AS replies
    FROM forums f
    `;

  const { rows } = await db.query(SQL);

  return rows;
}

export async function getForumById(id) {
  const SQL = `
    SELECT 
      f.*,
      (SELECT COUNT(*) FROM posts WHERE forum_id = f.id) AS posts,
      (SELECT COUNT(*) FROM replies WHERE forum_id = f.id) AS replies
    FROM forums f
    WHERE f.id = $1
  `;

  const {
    rows: [forum],
  } = await db.query(SQL, [id]);
  return forum;
}
