"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DEFAULT_USER_AVATAR, resolveUserAvatar } from "@/constants/user-avatar";

type Props = {
  initialName: string;
  initialImageSrc: string;
  email?: string;
};

// CHỈNH SỬA TẠI ĐÂY: Đổi thành false nếu muốn mở lại các ảnh đại diện cờ quốc gia khác (Tiếng Nhật, Tiếng Pháp, v.v.)
const showOnlyEnglishAvatars = true;

const ALL_PRESET_AVATARS = [
  { label: "Robogo", src: DEFAULT_USER_AVATAR },
  { label: "Tiếng Anh", src: "/gb.svg" },
  { label: "Tiếng Nhật", src: "/jp.svg" },
  { label: "Tiếng Pháp", src: "/fr.svg" },
  { label: "Tiếng Tây Ban Nha", src: "/es.svg" },
  { label: "Tiếng Ý", src: "/it.svg" },
];

const PRESET_AVATARS = showOnlyEnglishAvatars
  ? ALL_PRESET_AVATARS.filter((avatar) => avatar.label === "Robogo" || avatar.label === "Tiếng Anh")
  : ALL_PRESET_AVATARS;

export const ProfileForm = ({ initialName, initialImageSrc, email }: Props) => {
  const router = useRouter();
  const normalizedInitialImageSrc = resolveUserAvatar(initialImageSrc);
  const [name, setName] = useState(initialName);
  const [selectedAvatar, setSelectedAvatar] = useState(normalizedInitialImageSrc);
  const [customAvatarUrl, setCustomAvatarUrl] = useState(
    PRESET_AVATARS.some((avatar) => avatar.src === normalizedInitialImageSrc)
      ? ""
      : normalizedInitialImageSrc
  );
  const [isPending, startTransition] = useTransition();

  const handleAvatarSelect = (src: string) => {
    setSelectedAvatar(src);
    setCustomAvatarUrl("");
  };

  const handleCustomAvatarChange = (url: string) => {
    setCustomAvatarUrl(url);
    if (url.trim()) {
      setSelectedAvatar(url.trim());
    } else {
      setSelectedAvatar(DEFAULT_USER_AVATAR);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Tên hiển thị không được để trống!");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: name.trim(), imageSrc: selectedAvatar }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(typeof data?.error === "string" ? data.error : "Không thể cập nhật hồ sơ");
        }

        router.refresh();
        toast.success("Thông tin hồ sơ đã được cập nhật thành công!");
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi khi cập nhật hồ sơ.");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Name Input */}
      <div className="space-y-2">
        <label className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Tên hiển thị
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-base font-bold text-slate-700 outline-none transition hover:border-slate-300 focus:border-[#1486CC] focus:bg-white disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:border-slate-700 dark:focus:border-sky-500 dark:focus:bg-slate-950"
          placeholder="Nhập tên hiển thị của bạn..."
          maxLength={30}
        />
      </div>

      {/* Email (Read only) */}
      {email && (
        <div className="space-y-2">
          <label className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Địa chỉ Email (Đọc duy nhất)
          </label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full rounded-2xl border-2 border-slate-200/60 bg-slate-100/60 px-4 py-3 text-base font-bold text-slate-400 outline-none cursor-not-allowed dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-500"
          />
        </div>
      )}

      {/* Avatar Picker */}
      <div className="space-y-3">
        <label className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Chọn ảnh đại diện của bạn
        </label>

        {/* Current Active Preview */}
        <div className="flex items-center gap-x-4 rounded-2xl border-2 border-slate-100 dark:border-[#202f36] bg-slate-50/50 dark:bg-slate-900/30 p-4">
          <div className="relative size-16 shrink-0 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center p-1 shadow-sm">
            <Image
              src={resolveUserAvatar(selectedAvatar)}
              alt="Avatar Preview"
              fill
              className="object-contain"
              unoptimized={selectedAvatar.startsWith("http")}
            />
          </div>
          <div>
            <p className="text-sm font-black text-slate-700 dark:text-slate-200">Xem trước ảnh đại diện</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold truncate max-w-[250px] sm:max-w-[350px]">
              {selectedAvatar}
            </p>
          </div>
        </div>

        {/* Grid of Preset Avatars */}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {PRESET_AVATARS.map((avatar) => {
            const isSelected = selectedAvatar === avatar.src;
            return (
              <button
                key={avatar.src}
                type="button"
                disabled={isPending}
                onClick={() => handleAvatarSelect(avatar.src)}
                className={`relative aspect-square rounded-2xl border-2 bg-white dark:bg-slate-900 p-2 transition flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.97] ${
                  isSelected
                    ? "border-[#1486CC] bg-[#f4faff] ring-2 ring-sky-100 dark:border-sky-500 dark:bg-[#1c3547] dark:ring-sky-950"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="relative size-full">
                  <Image
                    src={avatar.src}
                    alt={avatar.label}
                    fill
                    className="object-contain"
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Avatar URL input */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Hoặc nhập URL ảnh đại diện tùy chỉnh
          </label>
          <input
            type="url"
            value={customAvatarUrl}
            onChange={(e) => handleCustomAvatarChange(e.target.value)}
            disabled={isPending}
            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none transition hover:border-slate-300 focus:border-[#1486CC] focus:bg-white disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:border-slate-700 dark:focus:border-sky-500 dark:focus:bg-slate-950"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={isPending}
          variant="primary"
          className="w-full py-6 text-base shadow-[0_4px_0_#106ba3] hover:shadow-[0_4px_0_#106ba3] active:translate-y-1 active:shadow-none transition-all duration-100"
        >
          {isPending ? "Đang lưu thay đổi..." : "Lưu thay đổi"}
        </Button>
      </div>
    </form>
  );
};
