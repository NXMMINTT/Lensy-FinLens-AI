"use client";

import { useRef } from "react";

import { LineIcon } from "@/components/ui/LineIcon";

/** Square photo preview with choose / change / remove buttons. On phones "เลือกรูป" also offers the camera. */
export function ProductImagePicker({
  src,
  busy = false,
  onPick,
  onRemove,
}: {
  src: string | null;
  busy?: boolean;
  onPick: (file: File) => void;
  onRemove?: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-4">
      <span className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-[20px] border-2 border-dashed border-sky-line bg-surface text-brand">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- user-uploaded product photo
          <img src={src} alt="รูปสินค้า" className="h-full w-full object-cover" />
        ) : (
          <LineIcon name="box" size={32} />
        )}
        {busy && <span className="absolute inset-0 grid place-items-center bg-surface/70 text-[13px] font-semibold text-ink">กำลังอัปโหลด…</span>}
      </span>
      <div className="flex flex-col items-start gap-2">
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onPick(file);
            e.target.value = ""; // picking the same file again still fires
          }}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="min-h-[40px] rounded-full border-2 border-brand px-4 text-[14px] font-bold text-brand disabled:opacity-50"
        >
          {src ? "เปลี่ยนรูป" : "เลือกรูปสินค้า"}
        </button>
        {src && onRemove && (
          <button type="button" disabled={busy} onClick={onRemove} className="px-1 text-[14px] font-semibold text-expense disabled:opacity-50">
            ลบรูป
          </button>
        )}
        <span className="text-[12px] text-ink-muted">JPG, PNG หรือ WebP · ย่อขนาดให้อัตโนมัติ</span>
      </div>
    </div>
  );
}
