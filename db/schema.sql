DROP DATABASE IF EXISTS auth_system;
CREATE DATABASE auth_system;

\c auth_system;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS replies;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS forums;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS roles;

CREATE TABLE roles(
    id serial PRIMARY KEY,
    created_at timestamp DEFAULT now(),
    name text NOT NULL UNIQUE,
    weight integer NOT NULL UNIQUE,
    icon text NOT NULL,
    is_default boolean NOT NULL,
    is_staff boolean NOT NULL,
    permissions text ARRAY NOT NULL DEFAULT ARRAY[]::text[],
    inheritance integer ARRAY NOT NULL DEFAULT ARRAY[]::integer[]
);

CREATE TABLE accounts(
    id serial PRIMARY KEY,
    created_at timestamp DEFAULT now(),
    role_id integer REFERENCES roles(id) ON DELETE CASCADE,
    username text NOT NULL UNIQUE,
    email text NOT NULL UNIQUE,
    avatar_url text NOT NULL DEFAULT 'https://www.gravatar.com/avatar/?d=mp&s=32',
    password text NOT NULL,
    first_name text,
    last_name text,
    jwt text
);

CREATE TABLE forums(
    id serial PRIMARY KEY,
    created_at timestamp DEFAULT now(),
    name text NOT NULL,
    description text NOT NULL,
    allows_replies boolean NOT NULL,
    required_permission text NOT NULL
);

CREATE TABLE posts(
    id serial PRIMARY KEY,
    created_at timestamp DEFAULT now(),
    forum_id integer REFERENCES forums(id) ON DELETE CASCADE,
    account_id integer REFERENCES accounts(id) ON DELETE CASCADE,
    title text NOT NULL,
    body text NOT NULL,
    last_edited timestamp DEFAULT now()
);

CREATE TABLE replies(
    id serial PRIMARY KEY,
    message text NOT NULL,
    created_at timestamp DEFAULT now(),
    has_been_edited boolean DEFAULT false,
    last_edited timestamp DEFAULT now(),
    forum_id integer REFERENCES forums(id) ON DELETE CASCADE,
    post_id integer REFERENCES posts(id) ON DELETE CASCADE,
    account_id integer REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX only_one_default_role ON roles (is_default) WHERE is_default IS TRUE;
