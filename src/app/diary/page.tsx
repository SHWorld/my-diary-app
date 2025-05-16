// src/app/diary/page.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import type { User, Post } from "@/types";
import { supabase } from "@/lib/supabaseClient";

export default function DiaryPage() {
  /* ---------- State ---------- */
  const [user, setUser] = useState<User | null>(null);
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);

  /* ---------- Auth check ---------- */
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        window.location.href = "/login";
      } else {
        setUser({ id: user.id, email: user.email ?? null });
        fetchPosts();
      }
    });
  }, []);
  /* ---------- Fetch posts ---------- */
  const fetchPosts = useCallback(async () => {
    const { data } = (await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .throwOnError()) as { data: Post[] | null };

    setPosts(data || []);
  }, []);

  /* ---------- Handle post ---------- */
  const handlePost = async () => {
    if (!content) return;

    await supabase.from("posts").insert([{ content, user_id: user!.id }]);
    setContent("");
    fetchPosts();
  };

  /* ---------- UI ---------- */
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* ← ★ 追記 */}
      <h2 className="text-xl font-bold border-b pb-2">ようこそ</h2>

      {/* 投稿フォーム */}
      <div className="space-y-4">
        {/* ← ★ 追記 */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="今日の出来事を書いてみよう"
          className="w-full min-h-[120px] rounded-lg border border-gray-300
                     p-3 focus:border-indigo-500 focus:ring-indigo-500" /* ★ */
        />

        <button
          onClick={handlePost}
          disabled={!content}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600
                     px-4 py-2 font-medium text-white hover:bg-indigo-700
                     disabled:opacity-40" /* ★ */
        >
          投稿
        </button>
      </div>

      {/* 投稿一覧 */}
      <ul className="space-y-6">
        {/* ← ★ 追記 */}
        {posts.map((p) => (
          <li
            key={p.id}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm" /* ★ */
          >
            <p className="whitespace-pre-wrap">{p.content}</p>

            {/* 画像部分（<Image>）は要件により除外 */}

            <p className="mt-2 text-xs text-gray-500">
              {new Date(p.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
