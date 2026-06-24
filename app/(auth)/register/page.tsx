"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle } from "lucide-react";

import { register as apiRegister } from "@/lib/api/auth";
import {
  AuthCard,
  ErrorBanner,
  PasswordInput,
  PasswordStrength,
  SubmitButton,
  TextInput,
} from "@/components/auth/form-fields";
import type { ApiError } from "@/lib/api/types";
import type { AxiosError } from "axios";

// ─── Indonesian timezone options ──────────────────────────────────────────────

const TIMEZONES = [
  { value: "Asia/Jakarta", label: "WIB — Waktu Indonesia Barat (Jakarta, Bandung, Surabaya)" },
  { value: "Asia/Makassar", label: "WITA — Waktu Indonesia Tengah (Makassar, Bali)" },
  { value: "Asia/Jayapura", label: "WIT — Waktu Indonesia Timur (Jayapura)" },
] as const;

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z
  .object({
    name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
    timezone: z.string().min(1, "Select a timezone"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

// ─── Error message ────────────────────────────────────────────────────────────

function getErrorMessage(err: unknown): string {
  const axErr = err as AxiosError<ApiError>;
  const status = axErr?.response?.status;
  if (status === 429) return "Too many attempts. Please try again in a minute.";
  // Backend returns 400 invalid_credentials for duplicate email (anti-enumeration).
  return "Unable to create account. Please try again.";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { timezone: "Asia/Jakarta" },
  });

  const password = watch("password", "");
  const isLoading = isSubmitting || isPending;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await apiRegister({
        name: data.name,
        email: data.email,
        password: data.password,
        timezone: data.timezone,
      });
      setIsSuccess(true);
      startTransition(() => {
        setTimeout(() => router.push("/login"), 3000);
      });
    } catch (err) {
      setError("root", { message: getErrorMessage(err) });
    }
  });

  // ── Success state ────────────────────────────────────────────────────────

  if (isSuccess) {
    return (
      <AuthCard>
        <div className="flex flex-col items-center px-8 py-14 text-center">
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle size={32} className="text-primary" />
          </span>
          <h2 className="mb-2 font-display text-headline-md text-on-surface">
            Account created!
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Check your email to verify your account. Redirecting to sign in…
          </p>
        </div>
      </AuthCard>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────

  return (
    <AuthCard>
      <div className="px-8 py-10">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/logo/woles_primary_logo_uniform.png"
            alt="Woles"
            width={140}
            height={48}
            className="object-contain"
            priority
          />
        </div>

        <h1 className="mb-1 text-center font-display text-headline-md text-on-surface">
          Create your account
        </h1>
        <p className="mb-8 text-center text-body-md text-on-surface-variant">
          Manage your life admin in one place
        </p>

        {errors.root?.message && (
          <div className="mb-5">
            <ErrorBanner message={errors.root.message} />
          </div>
        )}

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <TextInput
            label="Full Name"
            type="text"
            autoComplete="name"
            placeholder="Budi Santoso"
            error={errors.name?.message}
            {...register("name")}
          />

          <TextInput
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />

          {/* Password + strength indicator */}
          <div>
            <PasswordInput
              label="Password"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              error={errors.password?.message}
              {...register("password")}
            />
            <PasswordStrength password={password} />
          </div>

          <PasswordInput
            label="Confirm Password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          {/* Timezone selector */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="timezone"
              className="text-label-md font-medium text-on-surface"
            >
              Timezone
            </label>
            <select
              id="timezone"
              aria-invalid={!!errors.timezone}
              className={[
                "w-full appearance-none rounded border px-3 py-2.5 text-body-md text-on-surface outline-none transition-colors",
                "bg-surface-container-lowest",
                errors.timezone
                  ? "border-error focus:ring-2 focus:ring-error/30"
                  : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20",
              ].join(" ")}
              {...register("timezone")}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            {errors.timezone && (
              <p className="text-label-sm text-error">{errors.timezone.message}</p>
            )}
          </div>

          <SubmitButton isLoading={isLoading}>
            {isLoading ? "Creating account…" : "Create Account"}
          </SubmitButton>
        </form>

        <p className="mt-6 text-center text-body-md text-on-surface-variant">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
