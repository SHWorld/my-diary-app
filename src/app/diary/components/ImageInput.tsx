// src/app/diary/components/ImageInput.tsx
"use client";
import { useState, DragEvent } from "react";

interface Props {
  setFile: (f: File | null) => void;
}

const MAX_MB = 5;
const okTypes = ["image/jpeg", "image/png", "image/webp"];

export default function ImageInput({ setFile }: Props) {
  const [preview, setPreview] = useState<string | null>(null);

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
    if (f) handleFile(f);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="border-dashed border-2 rounded p-4 text-center"
    >
      <input type="file" accept="image/*" onChange={onChange} />
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
