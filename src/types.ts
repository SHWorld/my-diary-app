// src/types.ts
export type User = {
  id: string;
  email: string | null;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  image_path: string | null;
  created_at: string;
};

export type PostWithURL = Post & {
  image_url: string | null; // signed
};
