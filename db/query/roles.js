import db from "#db/client";

/**
 *
 * @param name the name of the new role
 * @param weight the weight of the new role
 * @param is_default if the role should be the default role
 * @param is_staff if the role should be a staff role
 * @param icon the icon of the new account
 *
 * @returns the role created
 * @returns undefined if it can't be created
 *
 */
export async function createRole({ name, weight, is_default, is_staff, icon }) {
  const SQL = `
    INSERT INTO roles(name, weight, is_default, is_staff, icon)
    VALUES($1, $2, $3, $4, $5)
    RETURNING *;
    `;
  const {
    rows: [role],
  } = await db.query(SQL, [name, weight, is_default, is_staff, icon]);

  return role || undefined;
}

/**
 *
 * @param id the id of the role to delete
 *
 * @returns the role was deleted
 * @returns undefined if it can't be found
 *
 */
export async function deleteRole(id) {
  const SQL = `
    DELETE FROM roles
    WHERE id = $1 AND is_default = false
    RETURNING *
    `;

  const {
    rows: [role],
  } = await db.query(SQL, [id]);

  return role || undefined;
}

/**
 *
 * @param id the id of the role
 *
 * @returns the role was found
 * @returns undefined if it can't be found
 *
 */
export async function getRoleById(id) {
  const SQL = `
    SELECT * FROM roles
    WHERE id = $1
    `;

  const {
    rows: [role],
  } = await db.query(SQL, [id]);

  return role || undefined;
}

/**
 *
 * @returns the default role
 * @returns undefined if it can't be found
 *
 */
export async function getDefaultRole() {
  const SQL = `
    SELECT * FROM roles
    WHERE is_default = true
    `;

  const {
    rows: [role],
  } = await db.query(SQL);

  return role || undefined;
}

/**
 *
 * @returns all roles
 * @returns undefined if there's an error with the query
 *
 */
export async function getRoles() {
  const SQL = `
    SELECT * FROM roles;
    `;
  const { rows } = await db.query(SQL);

  return rows;
}

/**
 *
 * @param id the id of the role
 * @param fields the update parameters
 *
 * @returns the updated role
 * @returns undefined if it can't be updated/found
 *
 */
export async function updateRole(id, fields) {
  const updates = Object.entries(fields).filter(
    ([k, v]) => v !== undefined && v !== null
  );

  const sets = updates.map(([key], i) => `${key} = $${i + 2}`);
  const values = updates.map(([_, value]) => value);

  const SQL = `
    UPDATE roles
    SET ${sets.join(", ")}
    WHERE id = $1
    RETURNING *;
    `;

  const {
    rows: [role],
  } = await db.query(SQL, [id, ...values]);

  return role || undefined;
}
