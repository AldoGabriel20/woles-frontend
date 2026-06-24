"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

// ─── TextInput ────────────────────────────────────────────────────────────────

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput({ label, error, hint, id, className, ...rest }, ref) {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={inputId}
          className="text-label-md font-medium text-on-surface"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={[
            "w-full rounded border px-3 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors",
            "bg-surface-container-lowest",
            error
              ? "border-error focus:ring-2 focus:ring-error/30"
              : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20",
            className ?? "",
          ].join(" ")}
          {...rest}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-label-sm text-error">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-label-sm text-on-surface-variant">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

// ─── PasswordInput ────────────────────────────────────────────────────────────

export interface PasswordInputProps extends Omit<TextInputProps, "type"> {}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ label, error, hint, id, className, ...rest }, ref) {
    const [show, setShow] = useState(false);
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={inputId}
          className="text-label-md font-medium text-on-surface"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={show ? "text" : "password"}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={[
              "w-full rounded border px-3 py-2.5 pr-10 text-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors",
              "bg-surface-container-lowest",
              error
                ? "border-error focus:ring-2 focus:ring-error/30"
                : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20",
              className ?? "",
            ].join(" ")}
            {...rest}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-label-sm text-error">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-label-sm text-on-surface-variant">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

// ─── PasswordStrength ─────────────────────────────────────────────────────────

interface PasswordStrengthProps {
  password: string;
}

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-error" };
  if (score <= 2) return { score, label: "Fair", color: "bg-amber-500" };
  if (score <= 3) return { score, label: "Good", color: "bg-yellow-400" };
  return { score, label: "Strong", color: "bg-primary" };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;
  const { score, label, color } = getStrength(password);
  const bars = [1, 2, 3, 4];

  return (
    <div className="flex items-center gap-2 pt-1">
      <div className="flex flex-1 gap-1">
        {bars.map((b) => (
          <div
            key={b}
            className={[
              "h-1 flex-1 rounded-full transition-colors",
              b <= score ? color : "bg-outline-variant",
            ].join(" ")}
          />
        ))}
      </div>
      <span className="text-label-sm text-on-surface-variant">{label}</span>
    </div>
  );
}

// ─── ErrorBanner ─────────────────────────────────────────────────────────────

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded border border-error/40 bg-error-container px-4 py-3 text-body-md text-error"
    >
      {message}
    </div>
  );
}

// ─── AuthCard ─────────────────────────────────────────────────────────────────

export function AuthCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "w-full max-w-[440px] rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

// ─── SubmitButton ─────────────────────────────────────────────────────────────

interface SubmitButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
}

export function SubmitButton({ children, isLoading, disabled }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading || disabled}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-label-md font-medium text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading && (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary/30 border-t-on-primary"
        />
      )}
      {children}
    </button>
  );
}
