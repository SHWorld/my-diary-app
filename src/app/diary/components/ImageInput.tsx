// src/app/diary/components/ImageInput.tsx
"use client";
import { useState, useEffect, useRef, DragEvent } from "react";

interface Props {
  setFile: (f: File | null) => void;
  file?: File | null;
  initialUrl?: string | null;
}

const MAX_MB = 5;
const okTypes = ["image/jpeg", "image/png", "image/webp"];

export default function ImageInput({ setFile, file, initialUrl }: Props) {
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (f: File) => {
    if (!okTypes.includes(f.type) || f.size > MAX_MB * 1024 ** 2) {
      alert("5MB以下のJPG/PNG/WebPのみ");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f ?? null);
    if (f) handleFile(f);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  /* ---------- ① file が変わったら Blob URL を生成 ---------- */
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  /* ---------- ② file が null になったら初期 URL か空 ---------- */
  useEffect(() => {
    if (file) return; // ①が担当
    setPreview(initialUrl ?? null); // ← ここで既存画像を復元
    if (inputRef.current) inputRef.current.value = "";
  }, [file, initialUrl]);

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="border-dashed border-2 rounded p-4 text-center"
    >
      <input ref={inputRef} type="file" accept="image/*" onChange={onChange} />
      {preview && (
        <img
          src={preview}
          alt="プレビュー画像"
          className="mt-4 max-h-64 mx-auto rounded"
        />
      )}
    </div>
  );
}
