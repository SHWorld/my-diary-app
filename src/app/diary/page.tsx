// src/app/diary/page.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { PostWithURL, User } from "@/types";
import ImageInput from "./components/ImageInput";
import PostCard from "./components/PostCard";
import LogoutButton from "./components/LogoutButton";

/* ---------- helper: signed URL ---------- */
const getSignedUrl = async (key: string) => {
  const { data, error } = await supabase.storage
    .from("images")
    .createSignedUrl(key, 60 * 60); // 1 h
  if (error || !data.signedUrl) return null;
  return data.signedUrl;
};

export default function DiaryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [posts, setPosts] = useState<PostWithURL[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------- auth ---------- */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user as User));
  }, []);

  /* ---------- fetch ---------- */
  const loadPosts = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) return console.error(error);
    const withURL: PostWithURL[] = await Promise.all(
      data.map(async (p) => ({
        ...p,
        image_url: p.image_path ? await getSignedUrl(p.image_path) : null,
      }))
    );
    setPosts(withURL);
  }, [user]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  /* ---------- create ---------- */
  const handleSubmit = async () => {
    if (!user) return;
    if (!content.trim()) return alert("本文が空です");
    setLoading(true);
    let key: string | null = null;

    try {
      if (file) {
        const ext = file.name.split(".").pop() ?? "jpg";
        key = `${user.id}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage
          .from("images")
          .upload(key, file, { contentType: file.type });
        if (error) throw error;
      }

      const { error: insertErr } = await supabase.from("posts").insert({
        user_id: user.id,
        content,
        image_path: key,
      });
      if (insertErr) throw insertErr;

      setContent("");
      setFile(null);
      await loadPosts();
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <main className="mx-auto max-w-xl space-y-6 p-4">
      <h1 className="text-2xl font-bold">My Diary</h1>
      <LogoutButton />

      {/* ---- 新規投稿 ---- */}
      <section className="space-y-2 rounded border p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's up?"
          className="w-full rounded border p-2"
          rows={3}
        />
        <ImageInput setFile={setFile} file={file} />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-40"
        >
          {loading ? "Posting…" : "Post"}
        </button>
      </section>

      {/* ---- 一覧 ---- */}
      <section className="space-y-6">
        {posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            currentUser={user!}
            refresh={loadPosts}
          />
        ))}
      </section>
    </main>
  );
}
