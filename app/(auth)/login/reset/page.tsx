"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  AuthCard,
  ErrorBanner,
  PasswordInput,
  PasswordStrength,
  SubmitButton,
} from "@/components/auth/form-fields";

// Backend endpoint not yet implemented (returns 501).
// The form is wired to call it when ready; shows a clear message in the interim.

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const password = watch("password", "");

  const onSubmit = handleSubmit(async (data) => {
    if (!token) {
      setError("root", { message: "Reset token is missing. Please use the link from your email." });
      return;
    }
    try {
      // TODO: uncomment when backend implements POST /auth/password/reset/confirm
      // await resetPasswordConfirm({ token, new_password: data.password });
      void data;
      setError("root", { message: "Password reset is not yet available. Please try again later." });
    } catch {
      setError("root", { message: "Failed to reset password. The link may have expired." });
    }
  });

  if (isSuccess) {
    return (
      <AuthCard>
        <div className="flex flex-col items-center px-8 py-14 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle size={28} className="text-primary" />
          </span>
          <h2 className="mb-2 font-display text-headline-md text-on-surface">
            Password updated!
          </h2>
          <p className="mb-6 text-body-md text-on-surface-variant">
            You can now sign in with your new password.
          </p>
          <Link
            href="/login"
            className="rounded-md bg-primary px-6 py-2.5 text-label-md font-medium text-on-primary hover:opacity-90"
          >
            Go to Sign In
          </Link>
        </div>
      </AuthCard>
    );
  }

  if (!token) {
    return (
      <AuthCard>
        <div className="flex flex-col items-center px-8 py-14 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-container">
            <AlertCircle size={28} className="text-error" />
          </span>
          <h2 className="mb-2 font-display text-headline-md text-on-surface">
            Invalid link
          </h2>
          <p className="mb-6 text-body-md text-on-surface-variant">
            This reset link is missing a token. Please request a new one.
          </p>
          <Link
            href="/login/forgot"
            className="text-label-md font-medium text-primary hover:underline"
          >
            Request new link
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <div className="px-8 py-10">
        <div className="mb-8 flex justify-center">
          <Image
            src="/logo/woles_primary_logo_uniform.png"
            alt="Woles"
            width={120}
            height={40}
            className="object-contain"
            priority
          />
        </div>

        <h1 className="mb-1 text-center font-display text-headline-md text-on-surface">
          Set new password
        </h1>
        <p className="mb-8 text-center text-body-md text-on-surface-variant">
          Choose a strong password for your account.
        </p>

        {errors.root?.message && (
          <div className="mb-5">
            <ErrorBanner message={errors.root.message} />
          </div>
        )}

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <div>
            <PasswordInput
              label="New Password"
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
            placeholder="Repeat your new password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <SubmitButton isLoading={isSubmitting}>
            {isSubmitting ? "Updating…" : "Update Password"}
          </SubmitButton>
        </form>
      </div>
    </AuthCard>
  );
}
