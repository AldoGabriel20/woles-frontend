"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useEffect } from "react";
import { login as apiLogin } from "@/lib/api/auth";
import { initCsrf } from "@/lib/api/csrf";
import {
  AuthCard,
  ErrorBanner,
  PasswordInput,
  SubmitButton,
  TextInput,
} from "@/components/auth/form-fields";
import type { ApiError } from "@/lib/api/types";
import type { AxiosError } from "axios";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

// ─── Error message mapping ────────────────────────────────────────────────────

function getErrorMessage(err: unknown): string {
  const axErr = err as AxiosError<ApiError>;
  const status = axErr?.response?.status;
  const code = axErr?.response?.data?.error;

  if (status === 429) return "Too many attempts. Please try again in a minute.";
  if (code === "account_locked") return "Account temporarily locked. Try again later.";
  // Never reveal whether the email exists — generic message for all 4xx auth failures.
  return "Invalid email or password. Please try again.";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const isLoading = isSubmitting || isPending;

  // Ensure CSRF cookie is set before the first POST.
  useEffect(() => { initCsrf(); }, []);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await apiLogin({ email: data.email, password: data.password });
      // The refresh_token HttpOnly cookie is now set by the backend.
      // The dashboard AuthProvider will pick it up via silent refresh on mount.
      const next = searchParams.get("next") ?? "/dashboard";
      startTransition(() => {
        router.push(next);
      });
    } catch (err) {
      setError("root", { message: getErrorMessage(err) });
    }
  });

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
          Welcome back
        </h1>
        <p className="mb-8 text-center text-body-md text-on-surface-variant">
          Sign in to your Woles account
        </p>

        {/* Error banner */}
        {errors.root?.message && (
          <div className="mb-5">
            <ErrorBanner message={errors.root.message} />
          </div>
        )}

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <TextInput
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <PasswordInput
            label="Password"
            autoComplete="current-password"
            placeholder="Your password"
            error={errors.password?.message}
            {...register("password")}
          />

          {/* Remember me + forgot */}
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-label-md text-on-surface-variant">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-outline-variant accent-primary"
                {...register("remember")}
              />
              Remember me
            </label>
            <Link
              href="/login/forgot"
              className="text-label-md text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <SubmitButton isLoading={isLoading}>
            {isLoading ? "Signing in…" : "Sign In"}
          </SubmitButton>
        </form>

        <p className="mt-6 text-center text-body-md text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
