"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { resetPasswordRequest } from "@/lib/api/auth";
import {
  AuthCard,
  ErrorBanner,
  SubmitButton,
  TextInput,
} from "@/components/auth/form-fields";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await resetPasswordRequest(data.email);
      setIsSuccess(true);
    } catch {
      // Always show success — backend returns 200 regardless (anti-enumeration).
      setIsSuccess(true);
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
            width={120}
            height={40}
            className="object-contain"
            priority
          />
        </div>

        {isSuccess ? (
          <div className="flex flex-col items-center text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle size={28} className="text-primary" />
            </span>
            <h2 className="mb-2 font-display text-headline-md text-on-surface">
              Check your email
            </h2>
            <p className="mb-6 text-body-md text-on-surface-variant">
              If that email is registered, we&apos;ve sent a password reset link.
            </p>
            <Link
              href="/login"
              className="text-label-md font-medium text-primary hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mb-1 text-center font-display text-headline-md text-on-surface">
              Forgot password?
            </h1>
            <p className="mb-8 text-center text-body-md text-on-surface-variant">
              Enter your email and we&apos;ll send a reset link.
            </p>

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
              <SubmitButton isLoading={isSubmitting}>
                {isSubmitting ? "Sending…" : "Send Reset Link"}
              </SubmitButton>
            </form>

            <Link
              href="/login"
              className="mt-6 flex items-center justify-center gap-1 text-label-md text-on-surface-variant hover:text-on-surface"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </AuthCard>
  );
}
