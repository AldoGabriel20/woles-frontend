"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import { z } from "zod";

import { getProfile, updateProfile, uploadAvatar } from "@/lib/api/account";
import type { UpdateProfileRequest } from "@/lib/api/types";

const TIMEZONES = [
  { label: "WIB — Asia/Jakarta", value: "Asia/Jakarta" },
  { label: "WITA — Asia/Makassar", value: "Asia/Makassar" },
  { label: "WIT — Asia/Jayapura", value: "Asia/Jayapura" },
  { label: "SGT — Asia/Singapore", value: "Asia/Singapore" },
  { label: "UTC", value: "UTC" },
];

const PLAN_BADGES: Record<string, string> = {
  free: "bg-surface-container text-on-surface-variant",
  premium: "bg-primary/15 text-primary",
  advanced: "bg-amber-100 text-amber-800",
};

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().max(100),
  timezone: z.string().min(1, "Timezone is required"),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function AccountDetailsSection() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["account", "profile"],
    queryFn: getProfile,
    staleTime: 60_000,
  });

  const nameParts = (profile?.name ?? "").split(" ");
  const initialFirst = nameParts[0] ?? "";
  const initialLast = nameParts.slice(1).join(" ");

  const {
    register,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: initialFirst,
      lastName: initialLast,
      timezone: profile?.timezone ?? "Asia/Jakarta",
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", "profile"] });
      setSuccessMsg("Profile updated.");
      reset(undefined, { keepValues: true });
      setTimeout(() => setSuccessMsg(""), 3000);
    },
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", "profile"] });
    },
  });

  function onSubmit(values: ProfileForm) {
    const name = [values.firstName, values.lastName].filter(Boolean).join(" ");
    updateMutation.mutate({ name, timezone: values.timezone });
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    avatarMutation.mutate(file);
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="animate-pulse text-label-md text-on-surface-variant">Loading…</p>
      </div>
    );
  }

  const avatarSrc =
    avatarPreview ?? profile?.avatar_url ?? null;
  const initials = (profile?.name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <section className="space-y-6 p-6">
      <h2 className="font-display text-title-lg text-on-surface">Account Details</h2>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="group relative h-20 w-20 overflow-hidden rounded-full bg-surface-container">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-display text-title-lg text-on-surface-variant">
              {initials}
            </span>
          )}
          {/* Hover overlay */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100"
            aria-label="Change photo"
          >
            <Camera size={18} className="text-white" />
            <span className="mt-0.5 text-label-sm text-white">Change</span>
          </button>
        </div>

        <div>
          <p className="font-display text-title-sm text-on-surface">{profile?.name}</p>
          <p className="text-label-md text-on-surface-variant">{profile?.email}</p>
          {/* Plan badge */}
          <span
            className={[
              "mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-label-sm font-medium",
              PLAN_BADGES[profile?.plan ?? "free"] ?? PLAN_BADGES.free,
            ].join(" ")}
          >
            {(profile?.plan ?? "free").toUpperCase()}
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handleAvatarChange}
          aria-label="Upload avatar"
        />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-label-md text-on-surface-variant">
              First Name
            </label>
            <input
              {...register("firstName")}
              className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-label-md text-on-surface-variant">
              Last Name
            </label>
            <input
              {...register("lastName")}
              className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Email — read only */}
        <div>
          <label className="mb-1 block text-label-md text-on-surface-variant">
            Email
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container px-3 py-2.5">
            <span className="flex-1 text-body-md text-on-surface">{profile?.email}</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-label-sm text-primary">
              Verified
            </span>
          </div>
        </div>

        {/* Timezone */}
        <div>
          <label className="mb-1 block text-label-md text-on-surface-variant">
            Timezone
          </label>
          <select
            {...register("timezone")}
            className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={!isDirty || updateMutation.isPending}
            className="rounded-lg bg-primary px-5 py-2.5 text-label-lg text-on-primary shadow disabled:opacity-50"
          >
            {updateMutation.isPending ? "Saving…" : "Save Changes"}
          </button>
          {successMsg && (
            <p className="text-label-md text-primary">{successMsg}</p>
          )}
          {updateMutation.isError && (
            <p className="text-label-md text-error">Failed to save.</p>
          )}
        </div>
      </form>
    </section>
  );
}
