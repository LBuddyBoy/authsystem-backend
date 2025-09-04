import db from "#db/client";
import { createAccount, getAccounts, updateAccount } from "./query/accounts.js";
import { createForum } from "./query/forums.js";
import { createPost } from "./query/posts.js";
import { createReply } from "./query/replies.js";
import { createRole, updateRole } from "./query/roles.js";
import { base, de, de_CH, en, Faker } from "@faker-js/faker";

const customLocale = {
  title: "My custom locale",
  internet: {
    domainSuffix: ["test"],
  },
};

const AVATAR_URLS = [
  "https://www.gravatar.com/avatar/?d=mp&s=128",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=oak",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=banana",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=avocado",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=flamingo",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=cucumber",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=wave",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=breeze",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=cloud",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=astro",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=astronaut",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=robot",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=doge",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=dragon",
  "https://api.dicebear.com/7.x/bottts/svg?seed=orca",
  "https://api.dicebear.com/7.x/bottts/svg?seed=panther",
  "https://api.dicebear.com/7.x/bottts/svg?seed=octopus",
  "https://api.dicebear.com/7.x/bottts/svg?seed=bunny",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=fox",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=owl",
];

export const customFaker = new Faker({
  locale: [customLocale, de_CH, de, en, base],
});

await db.connect();
await seedRoles();
await seedAccounts();
await seedForums();
await seedPosts();
await db.end();
console.log("🌱 Database seeded.");

async function seedAccounts() {
  const accounts = [
    {
      username: "LBuddyBoy",
      email: "ethantoups05@gmail.com",
      password: "test123",
      role_id: 3,
    },
    {
      username: "Admin",
      email: "admin123@gmail.com",
      password: "password123",
      role_id: 3,
    },
  ];

  for (let index = 0; index < 500; index++) {
    const username = customFaker.internet.username();
    const email = customFaker.internet.email();
    const password = customFaker.internet.password();

    if (
      accounts.filter(
        (account) => account.username === username || account.email === email
      ).length > 0
    ) {
      continue;
    }

    const account = {
      username: username,
      email: email,
      password: password,
      role_id: 1,
    };

    accounts.push(account);
  }

  for (const index in accounts) {
    const account = accounts[index];

    await createAccount(account);
  }

  for (let index = 1; index <= 500; index++) {
    await updateAccount(index, {
      avatar_url: AVATAR_URLS[getRandomInt(1, AVATAR_URLS.length) - 1],
    });
  }
}

async function seedRoles() {
  const roles = [
    {
      name: "Member",
      weight: 100,
      is_default: true,
      is_staff: false,
      icon: "Member",
    },
    {
      name: "Moderator",
      weight: 500,
      is_default: false,
      is_staff: true,
      icon: "Moderator",
    },
    {
      name: "Admin",
      weight: 750,
      is_default: false,
      is_staff: true,
      icon: "Admin",
    },
    {
      name: "Founder",
      weight: 1000,
      is_default: false,
      is_staff: true,
      icon: "Founder",
    },
  ];

  for (const index in roles) {
    const role = roles[index];

    await createRole(role);
  }

  await updateRole(3, {
    permissions: ["admin:panel"],
  });

  await updateRole(4, {
    permissions: ["admin:panel"],
  });
}

async function seedForums() {
  const forums = [
    {
      name: "Announcements",
      description: "This will show you all important announcements.",
      allows_replies: true,
      required_permission: "",
    },
    {
      name: "Updates",
      description: "This will show all of the updates.",
      allows_replies: true,
      required_permission: "",
    },
    {
      name: "Games",
      description: "This will show you all the games.",
      allows_replies: true,
      required_permission: "",
    },
  ];

  for (const index in forums) {
    const forum = forums[index];

    await createForum(forum);
  }
}

async function seedPosts() {
  const query = await getAccounts(20, null);
  const posts = [];
  const newPosts = [];

  for (let index = 0; index < 20; index++) {
    const post = {
      forum_id: getRandomInt(1, 3),
      account_id: getRandomInt(1, query.accounts.length),
      title: customFaker.book.title(),
      body: customFaker.lorem.paragraph(),
    };

    posts.push(post);
  }

  for (const index in posts) {
    const post = posts[index];

    newPosts.push(await createPost(post));
  }

  await seedReplies(newPosts);
}

async function seedReplies(newPosts) {
  const query = await getAccounts(20, null);
  const replies = [];

  for (let index = 0; index < 100; index++) {
    const post = newPosts[getRandomInt(0, newPosts.length - 1)];
    const reply = {
      post_id: post.id,
      forum_id: post.forum_id,
      account_id: getRandomInt(1, query.accounts.length),
      message: customFaker.lorem.text(),
    };

    replies.push(reply);
  }

  for (const index in replies) {
    const reply = replies[index];

    await createReply(reply);
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
