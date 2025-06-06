// src/app/diary/components/LogoutButton.tsx
"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut(); // トークン破棄
    router.push("/login"); // ログイン画面へ
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded bg-gray-300 px-3 py-1 text-sm hover:bg-gray-400"
    >
      Logout
    </button>
  );
}
