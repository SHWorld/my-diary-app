// src/app/diary/components/PostCard.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import type { PostWithURL, User } from "@/types";
import ImageInput from "./ImageInput";

interface Props {
  post: PostWithURL;
  currentUser: User;
  refresh: () => Promise<void>;
}

export default function PostCard({ post, currentUser, refresh }: Props) {
  const [editMode, setEditMode] = useState(false);
  const [content, setContent] = useState(post.content);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  /* ---------- 削除 ---------- */
  const handleDelete = async () => {
    if (!confirm("本当に削除しますか？")) return;
    setLoading(true);
    try {
      // Storage の画像を先に削除（あってもなくても OK）
      if (post.image_path) {
        await supabase.storage.from("images").remove([post.image_path]);
      }
      // posts レコード削除
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id)
        .eq("user_id", currentUser.id);
      if (error) throw error;
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  /* ---------- 更新 ---------- */
  const handleUpdate = async () => {
    if (!content.trim()) return alert("本文が空です");
    setLoading(true);
    let newKey: string | undefined;
    try {
      // 画像差し替え
      if (file) {
        const ext = file.name.split(".").pop() ?? "jpg";
        newKey = `${currentUser.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("images")
          .upload(newKey, file, { contentType: file.type });
        if (upErr) throw upErr;

        // 旧画像を削除
        if (post.image_path) {
          await supabase.storage.from("images").remove([post.image_path]);
        }
      }

      // posts 更新
      const { error } = await supabase
        .from("posts")
        .update({
          content,
          ...(newKey && { image_path: newKey }),
        })
        .eq("id", post.id)
        .eq("user_id", currentUser.id);
      if (error) throw error;

      setEditMode(false);
      setFile(null);
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  /* ---------- 表示 ---------- */
  if (editMode) {
    return (
      <article className="space-y-2 rounded border p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded border p-2"
          rows={3}
        />
        <ImageInput
          setFile={setFile}
          file={file}
          initialUrl={post.image_url} // ★追加
        />
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="rounded bg-indigo-600 px-3 py-1 text-white disabled:opacity-40"
          >
            {loading ? "更新中…" : "保存"}
          </button>
          <button
            onClick={() => setEditMode(false)}
            className="rounded bg-gray-300 px-3 py-1"
          >
            キャンセル
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="space-y-2 rounded border p-4">
      <p>{post.content}</p>
      {post.image_url && (
        <Image
          src={post.image_url}
          alt="post image"
          width={400}
          height={400}
          unoptimized
          className="rounded"
        />
      )}
      <p className="text-xs text-gray-500">{post.created_at}</p>
      <div className="flex gap-3 text-sm">
        <button
          onClick={() => setEditMode(true)}
          className="text-indigo-600 underline"
        >
          編集
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-red-600 underline disabled:opacity-40"
        >
          {loading ? "削除中…" : "削除"}
        </button>
      </div>
    </article>
  );
}
