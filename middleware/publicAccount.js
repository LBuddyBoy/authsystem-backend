export default function publicAccount(account) {
  return {
    id: account.id,
    username: account.username,
    avatar_url: account.avatar_url,
    role: account.role,
    created_at: account.created_at,
  };
}