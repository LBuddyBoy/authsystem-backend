import jwt from "jsonwebtoken";
import db from "#db/client";
import { getDefaultRole } from "./roles.js";

export const ACCOUNT_RETURNS = `id, username, email, role_id, first_name, last_name, created_at, avatar_url`;
export const ROLE_RETURNS = `id, name, weight, icon, is_default, is_staff, permissions, inheritance`;

export const MAPPED_ACCOUNT_RETURNS = (identifier) =>
  ACCOUNT_RETURNS.split(", ")
    .map((s) => identifier + "." + s)
    .toString();
export const MAPPED_ROLE_RETURNS = ROLE_RETURNS.split(", ")
  .map((s) => "r." + s + " AS role_" + s)
  .toString();

/**
 *
 * @param username the username of the new account
 * @param email the email of the new account
 * @param password the unhashed password of the new account
 *
 * @returns the account created
 * @returns undefined if it can't be created
 *
 */
export async function createAccount({ username, email, password, role_id }) {
  const SQL = `
    INSERT INTO accounts(username, email, password, role_id)
    VALUES($1, $2, crypt($3, gen_salt('bf')), $4)
    RETURNING *
    `;

  try {
    if (!role_id) {
      const defaultRole = await getDefaultRole();

      if (!defaultRole && !role_id) {
        throw new Error("Couldn't find a default role.");
      }

      role_id = defaultRole.id;
    }

    const {
      rows: [account],
    } = await db.query(SQL, [
      username,
      email,
      password,
      role_id
    ]);

    return account;
  } catch (error) {
    if (error.code === "23505") {
      throw new Error("Username or email already exists.");
    }

    throw error;
  }
}

/**
 *
 * @param id the id of the account
 * @param fields the update parameters
 *
 * @returns the updated account
 * @returns undefined if it can't be updated/found
 *
 */
export async function updateAccount(id, fields) {
  const updates = Object.entries(fields).filter(
    ([k, v]) => v !== undefined && v !== null
  );

  const sets = updates.map(([key], i) =>
    key === "password"
      ? `password = crypt($${i + 2}, gen_salt('bf'))`
      : `${key} = $${i + 2}`
  );
  const values = updates.map(([_, value]) => value);

  const SQL = `
    UPDATE accounts
    SET ${sets.join(", ")}
    WHERE id = $1
    RETURNING *
    `;

  const {
    rows: [account],
  } = await db.query(SQL, [id, ...values]);

  return account || undefined;
}

/**
 *
 * @param id the id of the account
 *
 * @returns the account found
 * @returns undefined if it can't be found
 *
 */
export async function getAccountById(id) {
  const SQL = `
    SELECT
    accounts.*,
    row_to_json(roles) AS role
    FROM accounts
    JOIN roles ON accounts.role_id = roles.id
    WHERE accounts.id = $1
    `;

  const {
    rows: [row],
  } = await db.query(SQL, [id]);

  if (!row) return undefined;

  return row;
}

/**
 *
 * @param field
 * @param value
 * @returns
 */
export async function getAccountsByField(field, value) {
  const allowedFields = [
    "username",
    "email",
    "first_name",
    "last_name",
    "role_id",
  ];

  if (!allowedFields.includes(field)) {
    throw new Error("Invalid search field");
  }

  const SQL = `
  SELECT
  accounts.*,
  row_to_json(roles) AS role
  FROM accounts
  JOIN roles ON accounts.role_id = roles.id
  WHERE accounts.${field} ILIKE $1
  ORDER BY accounts.id
  `;

  const { rows } = await db.query(SQL, [`%${value}%`]);

  return rows;
}

/**
 *
 * Fetches a paginated list of accounts from the database using cursor-based pagination.
 *
 * @param limit The maximum number of accounts to return.
 * @param cursor The account ID to start after; use null or 0 to start from the beginning.
 * @returns An object of the accounts found and the next cursor for the next page
 */
export async function getAccounts(limit, cursor) {
  let SQL, params;

  if (cursor) {
    SQL = `
      SELECT 
      accounts.*,
      row_to_json(roles) AS role
      FROM accounts
      JOIN roles ON accounts.role_id = roles.id
      WHERE accounts.id > $1
      ORDER BY accounts.id
      LIMIT $2
    `;
    params = [cursor, limit];
  } else {
    SQL = `
      SELECT 
      accounts.*,
      row_to_json(roles) AS role
      FROM accounts
      JOIN roles ON accounts.role_id = roles.id
      ORDER BY accounts.id
      LIMIT $1
    `;
    params = [limit];
  }

  const { rows } = await db.query(SQL, params);

  return {
    accounts: rows,
    nextCursor: rows.length > 0 ? rows[rows.length - 1].id : null,
  };
}

/**
 *
 * @param email the email to query
 * @param password the password to query
 *
 * @returns the account found
 * @returns undefined if it can't be found or incorrect creditentials
 *
 */
export async function validateAccount({ email, password }) {
  const SQL = `
    SELECT 
    accounts.*,
    row_to_json(roles) AS role
    FROM accounts
    JOIN roles ON accounts.role_id = roles.id
    WHERE accounts.email = $1 AND accounts.password = crypt($2, accounts.password)
    `;

  const {
    rows: [row],
  } = await db.query(SQL, [email, password]);
  if (!row) return undefined;

  return row;
}

/**
 * @returns the jwt and account details
 */
export async function generateJWT(id) {
  const SQL = `
    UPDATE accounts
    SET jwt = $1
    WHERE id = $2
    RETURNING *
    `;
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });

  const {
    rows: [account],
  } = await db.query(SQL, [token, id]);

  return { token, account };
}

/**
 * @returns the id of the account
 * @returns null if it's expired
 */
export async function validateJWT(token) {
  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET);

    return verify.id;
  } catch (error) {
    return null;
  }
}
