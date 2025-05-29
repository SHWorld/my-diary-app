// src/app/diary/page.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import type { PostWithURL, User } from "@/types";
import ImageInput from "./components/ImageInput";

/* ---------- helpers ---------- */
const getSignedUrl = async (key: string) => {
  const { data, error } = await supabase.storage
    .from("images")
    .createSignedUrl(key, 60 * 60); // 1 h
  if (error) throw error;
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

  /* ---------- fetch posts ---------- */
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

  /* ---------- submit ---------- */
  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    let key: string | null = null;

    try {
      // upload if file exists
      if (file) {
        const ext = file.name.split(".").pop() ?? "jpg";
        key = `images/${user.id}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage
          .from("images")
          .upload(key, file, {
            // upsert false = enforce unique
            contentType: file.type,
          });
        if (error) throw error;
      }

      // insert post
      const { error: insertErr } = await supabase.from("posts").insert({
        user_id: user.id,
        content,
        image_path: key,
      });
      if (insertErr) throw insertErr;

      setContent("");
      setFile(null);
      await loadPosts();
    } catch (e) {
      console.error(e);
      alert("Failed, please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto p-4 space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's up?"
        className="w-full border rounded p-2"
      />
      <ImageInput file={file} setFile={setFile} />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? "Posting..." : "Post"}
      </button>

      <section className="space-y-6 pt-6">
        {posts.map((p) => (
          <article key={p.id} className="border rounded p-4 space-y-2">
            <p>{p.content}</p>
            {p.image_url && (
              <Image
                src={p.image_url}
                alt="post image"
                width={400}
                height={400}
                className="rounded"
              />
            )}
            <p className="text-xs text-gray-500">{p.created_at}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
