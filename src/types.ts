export type User = {
  id: string;
  email: string | null;
};
// DB
export type Post = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};
