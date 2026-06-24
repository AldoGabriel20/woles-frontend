"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { AuthCard } from "@/components/auth/form-fields";

// The backend does not yet expose a verify endpoint — this page handles
// the email verification link click and will call the endpoint when ready.
// For now it shows appropriate UI based on the presence / absence of `token`.

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "missing">(
    token ? "loading" : "missing",
  );

  useEffect(() => {
    if (!token) {
      setStatus("missing");
      return;
    }

    // TODO: replace with real API call once backend implements the endpoint.
    // e.g. await apiClient.get(`/auth/verify?token=${token}`)
    const timer = setTimeout(() => {
      // Simulate — mark success when token present; in prod call the endpoint.
      setStatus("success");
    }, 1000);

    return () => clearTimeout(timer);
  }, [token]);

  return (
    <AuthCard>
      <div className="flex flex-col items-center px-8 py-14 text-center">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logo/woles_primary_logo_uniform.png"
            alt="Woles"
            width={120}
            height={40}
            className="object-contain"
            priority
          />
        </div>

        {status === "loading" && (
          <>
            <Loader2 size={40} className="mb-4 animate-spin text-primary" />
            <h2 className="font-display text-headline-md text-on-surface">
              Verifying your email…
            </h2>
          </>
        )}

        {status === "success" && (
          <>
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle size={32} className="text-primary" />
            </span>
            <h2 className="mb-2 font-display text-headline-md text-on-surface">
              Email verified!
            </h2>
            <p className="mb-6 text-body-md text-on-surface-variant">
              Your account is now active. You can sign in.
            </p>
            <Link
              href="/login"
              className="rounded-md bg-primary px-6 py-2.5 text-label-md font-medium text-on-primary hover:opacity-90"
            >
              Go to Sign In
            </Link>
          </>
        )}

        {(status === "error" || status === "missing") && (
          <>
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error-container">
              <AlertCircle size={32} className="text-error" />
            </span>
            <h2 className="mb-2 font-display text-headline-md text-on-surface">
              {status === "missing" ? "Invalid link" : "Verification failed"}
            </h2>
            <p className="mb-6 text-body-md text-on-surface-variant">
              {status === "missing"
                ? "This verification link is missing a token. Please check your email."
                : "This link has expired or is invalid. Please request a new verification email."}
            </p>
            <Link
              href="/login"
              className="text-label-md font-medium text-primary hover:underline"
            >
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </AuthCard>
  );
}
