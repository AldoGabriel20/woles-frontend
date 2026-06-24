"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, QrCode, LogOut, AlertTriangle, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  changePassword,
  enable2FA,
  verify2FA,
  disable2FA,
  getSessions,
  revokeSession,
  revokeAllSessions,
} from "@/lib/api/auth";
import { deleteAccount } from "@/lib/api/account";
import { useAuth } from "@/lib/auth/useAuth";
import type { UserSession } from "@/lib/api/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function maskIP(ip?: string | null): string {
  if (!ip) return "Unknown";
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.*.*`;
  return ip.slice(0, 6) + "…";
}

// ─── Change Password Modal ────────────────────────────────────────────────────

interface PasswordForm {
  old_password: string;
  new_password: string;
  confirm: string;
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<PasswordForm>();

  const mutation = useMutation({
    mutationFn: (d: PasswordForm) =>
      changePassword({ old_password: d.old_password, new_password: d.new_password }),
    onSuccess: () => onClose(),
    onError: () =>
      setError("old_password", { message: "Incorrect current password." }),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal
    >
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl">
        <h3 className="mb-4 font-display text-title-md text-on-surface">Update Password</h3>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-3">
          {/* Old password */}
          <div>
            <label className="mb-1 block text-label-md text-on-surface-variant">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showOld ? "text" : "password"}
                {...register("old_password", { required: "Required" })}
                className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2.5 pr-10 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowOld((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                aria-label="Toggle visibility"
              >
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.old_password && (
              <p className="mt-1 text-label-sm text-error">{errors.old_password.message}</p>
            )}
          </div>

          {/* New password */}
          <div>
            <label className="mb-1 block text-label-md text-on-surface-variant">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                {...register("new_password", { required: "Required", minLength: { value: 8, message: "Min 8 characters" } })}
                className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2.5 pr-10 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                aria-label="Toggle visibility"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.new_password && (
              <p className="mt-1 text-label-sm text-error">{errors.new_password.message}</p>
            )}
          </div>

          {/* Confirm */}
          <div>
            <label className="mb-1 block text-label-md text-on-surface-variant">
              Confirm New Password
            </label>
            <input
              type="password"
              {...register("confirm", {
                required: "Required",
                validate: (v) => v === watch("new_password") || "Passwords don't match",
              })}
              className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2.5 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {errors.confirm && (
              <p className="mt-1 text-label-sm text-error">{errors.confirm.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-outline-variant px-4 py-2 text-label-md text-on-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-label-md text-on-primary disabled:opacity-50"
            >
              {mutation.isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── 2FA setup modal ──────────────────────────────────────────────────────────

function Enable2FAModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"qr" | "verify">("qr");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");

  const setupMutation = useMutation({
    mutationFn: enable2FA,
    onSuccess: () => setStep("verify"),
  });

  const verifyMutation = useMutation({
    mutationFn: () => verify2FA(totpCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", "profile"] });
      onClose();
    },
    onError: () => setError("Invalid code. Please try again."),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal
    >
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl">
        {step === "qr" ? (
          <>
            <h3 className="mb-1 font-display text-title-md text-on-surface">
              Enable Two-Factor Auth
            </h3>
            <p className="mb-4 text-label-md text-on-surface-variant">
              Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
            {setupMutation.data ? (
              <div className="mb-4 flex flex-col items-center gap-3">
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(setupMutation.data.totp_uri)}`}
                  alt="QR Code"
                  width={180}
                  height={180}
                  className="rounded-lg border border-outline-variant"
                />
                <p className="text-center text-label-sm text-on-surface-variant">
                  Manual key: <code className="rounded bg-surface-container px-1 py-0.5 text-label-sm">{setupMutation.data.secret}</code>
                </p>
              </div>
            ) : (
              <div className="mb-4 flex flex-col items-center gap-3">
                <div className="flex h-44 w-44 items-center justify-center rounded-xl bg-surface-container">
                  <QrCode size={40} className="text-on-surface-variant" />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-outline-variant px-4 py-2 text-label-md text-on-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setupMutation.mutate()}
                disabled={setupMutation.isPending || !!setupMutation.data}
                className="rounded-lg bg-primary px-4 py-2 text-label-md text-on-primary disabled:opacity-50"
              >
                {setupMutation.data ? "Next →" : setupMutation.isPending ? "Loading…" : "Generate QR"}
              </button>
              {setupMutation.data && (
                <button
                  type="button"
                  onClick={() => setStep("verify")}
                  className="rounded-lg bg-primary px-4 py-2 text-label-md text-on-primary"
                >
                  Next →
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <h3 className="mb-1 font-display text-title-md text-on-surface">
              Verify Code
            </h3>
            <p className="mb-4 text-label-md text-on-surface-variant">
              Enter the 6-digit code from your authenticator app to confirm setup.
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
              className="mb-3 w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2.5 text-center text-body-md text-on-surface tracking-widest outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="000000"
            />
            {error && <p className="mb-2 text-label-sm text-error">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-outline-variant px-4 py-2 text-label-md text-on-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => verifyMutation.mutate()}
                disabled={totpCode.length < 6 || verifyMutation.isPending}
                className="rounded-lg bg-primary px-4 py-2 text-label-md text-on-primary disabled:opacity-50"
              >
                {verifyMutation.isPending ? "Verifying…" : "Verify & Enable"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Disable 2FA modal ────────────────────────────────────────────────────────

function Disable2FAModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const mutation = useMutation({
    mutationFn: () => disable2FA(password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", "profile"] });
      onClose();
    },
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal
    >
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl">
        <h3 className="mb-1 font-display text-title-md text-on-surface">Disable 2FA</h3>
        <p className="mb-4 text-label-md text-on-surface-variant">
          Enter your password to confirm disabling two-factor authentication.
        </p>
        <div className="relative mb-4">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Current password"
            className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2.5 pr-10 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShowPw((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {mutation.isError && (
          <p className="mb-2 text-label-sm text-error">Incorrect password.</p>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-outline-variant px-4 py-2 text-label-md text-on-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={!password || mutation.isPending}
            className="rounded-lg bg-error px-4 py-2 text-label-md text-on-primary disabled:opacity-50"
          >
            {mutation.isPending ? "Disabling…" : "Disable 2FA"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Account modal ─────────────────────────────────────────────────────

function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [confirm, setConfirm] = useState("");

  const mutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      await logout();
      router.replace("/");
    },
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal
    >
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl">
        <div className="mb-3 flex items-center gap-2 text-error">
          <AlertTriangle size={20} />
          <h3 className="font-display text-title-md">Delete Account</h3>
        </div>
        <p className="mb-3 text-label-md text-on-surface-variant">
          This action is irreversible. All your data — reminders, documents, family, goals — will
          be permanently deleted.
        </p>
        <p className="mb-2 text-label-md text-on-surface">
          Type <strong>DELETE</strong> to confirm:
        </p>
        <input
          type="text"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mb-4 w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2.5 text-body-md text-on-surface outline-none focus:border-error focus:ring-1 focus:ring-error"
          placeholder="DELETE"
        />
        {mutation.isError && (
          <p className="mb-2 text-label-sm text-error">Something went wrong. Please try again.</p>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-outline-variant px-4 py-2 text-label-md text-on-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={confirm !== "DELETE" || mutation.isPending}
            className="rounded-lg bg-error px-4 py-2 text-label-md text-white disabled:opacity-50"
          >
            {mutation.isPending ? "Deleting…" : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Session row ──────────────────────────────────────────────────────────────

function SessionRow({
  session,
  onRevoke,
}: {
  session: UserSession;
  onRevoke: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-label-md text-on-surface">
          {session.device_name ?? session.user_agent?.split(" ")[0] ?? "Unknown device"}
        </p>
        <p className="text-label-sm text-on-surface-variant">
          {maskIP(session.ip_address)} · {timeAgo(session.last_active_at)}
        </p>
      </div>
      <button
        onClick={onRevoke}
        className="shrink-0 rounded-lg border border-outline-variant px-3 py-1.5 text-label-sm text-on-surface hover:bg-surface-container"
      >
        Revoke
      </button>
    </li>
  );
}

// ─── Security & Privacy Section ───────────────────────────────────────────────

export function SecurityPrivacySection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionsExpanded, setSessionsExpanded] = useState(false);

  const { data: sessions } = useQuery({
    queryKey: ["auth", "sessions"],
    queryFn: getSessions,
    enabled: sessionsExpanded,
    staleTime: 30_000,
  });

  const revokeMutation = useMutation({
    mutationFn: revokeSession,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auth", "sessions"] }),
  });

  const revokeAllMutation = useMutation({
    mutationFn: revokeAllSessions,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auth", "sessions"] }),
  });

  const totpEnabled = user?.totp_enabled ?? false;

  return (
    <section className="space-y-6 p-6">
      <h2 className="font-display text-title-lg text-on-surface">Security &amp; Privacy</h2>

      {/* Password */}
      <div className="rounded-xl border border-outline-variant p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-label-lg text-on-surface">Password</p>
            <p className="text-label-md text-on-surface-variant">
              Update your account password
            </p>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="rounded-lg border border-outline-variant px-4 py-2 text-label-md text-on-surface hover:bg-surface-container"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* 2FA */}
      <div className="rounded-xl border border-outline-variant p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-on-surface" />
              <p className="font-display text-label-lg text-on-surface">Two-Factor Authentication</p>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-label-sm text-primary">
                RECOMMENDED
              </span>
            </div>
            <p className="mt-0.5 text-label-md text-on-surface-variant">
              {totpEnabled
                ? "2FA is active. Your account is secured."
                : "Add an extra layer of protection to your account."}
            </p>
          </div>
          {/* Toggle */}
          <button
            type="button"
            onClick={() => totpEnabled ? setShowDisable2FAModal(true) : setShow2FAModal(true)}
            className={[
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              totpEnabled ? "bg-primary" : "bg-outline-variant",
            ].join(" ")}
            role="switch"
            aria-checked={totpEnabled}
            aria-label="Toggle 2FA"
          >
            <span
              className={[
                "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
                totpEnabled ? "translate-x-6" : "translate-x-1",
              ].join(" ")}
            />
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="rounded-xl border border-outline-variant p-4">
        <button
          type="button"
          onClick={() => setSessionsExpanded((p) => !p)}
          className="flex w-full items-center justify-between"
        >
          <div className="text-left">
            <p className="font-display text-label-lg text-on-surface">Active Sessions</p>
            <p className="text-label-md text-on-surface-variant">
              Devices where your account is signed in
            </p>
          </div>
          <LogOut size={16} className="shrink-0 text-on-surface-variant" />
        </button>

        {sessionsExpanded && (
          <div className="mt-3 border-t border-outline-variant pt-3">
            {sessions && sessions.length > 0 ? (
              <ul className="divide-y divide-outline-variant">
                {sessions.map((s) => (
                  <SessionRow
                    key={s.id}
                    session={s}
                    onRevoke={() => revokeMutation.mutate(s.id)}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-label-md text-on-surface-variant">No active sessions found.</p>
            )}

            {sessions && sessions.length > 1 && (
              <button
                onClick={() => {
                  if (confirm("Sign out all other sessions?")) {
                    revokeAllMutation.mutate();
                  }
                }}
                className="mt-3 text-label-md text-error hover:underline"
              >
                Sign out all other sessions
              </button>
            )}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border-2 border-error/30 bg-error-container/10 p-4">
        <p className="mb-1 font-display text-label-lg text-error">Danger Zone</p>
        <p className="mb-3 text-label-md text-on-surface-variant">
          Permanently delete your account and all associated data.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="rounded-lg bg-error px-4 py-2 text-label-md text-white hover:brightness-110"
        >
          Delete Account
        </button>
      </div>

      {/* Modals */}
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
      {show2FAModal && <Enable2FAModal onClose={() => setShow2FAModal(false)} />}
      {showDisable2FAModal && <Disable2FAModal onClose={() => setShowDisable2FAModal(false)} />}
      {showDeleteModal && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />}
    </section>
  );
}
