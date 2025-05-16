// src/app/login/page.tsx
"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/diary` },
    });
    setLoading(false);
    if (error) alert(error.message);
    else alert("メールを確認してください！");
  };
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-8 text-center text-3xl font-bold">
          ログイン / 新規登録
        </h1>

        <input
          type="email"
          placeholder="sample@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-300 p-3
                     focus:border-indigo-500 focus:ring-indigo-500"
        />

        <button
          onClick={handleLogin}
          disabled={loading || !email}
          className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white
                     hover:bg-indigo-700 disabled:opacity-40"
        >
          {loading ? "送信中..." : "メールでログインリンク送信"}
        </button>
      </div>
    </main>
  );
}
