import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Lock,
  Mail,
  ShieldCheck,
  User,
  Loader2,
} from "lucide-react";

import { authApi } from "@/api/auth.api";
import { useAuth } from "@/context/AuthContext";

function Profile() {
  const { user: authUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authApi.getProfile();

        setProfile(response.user);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setError("Failed to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleCopyUserId = async () => {
    if (!profile?.userId) return;

    try {
      await navigator.clipboard.writeText(profile.userId);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy user ID:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const name = authUser?.name || "User";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

      {/* Header */}
      <section className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Profile
        </h1>

        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Manage your DevLens account and security.
        </p>
      </section>

      {/* Profile Overview */}
      <section className="rounded-2xl border bg-card">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">

          {/* Avatar */}
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl font-semibold text-primary">
            {initial}
          </div>

          {/* User */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">
                {name}
              </h2>

              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                <Check className="size-3" />
                Authenticated
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-3.5 shrink-0" />

              <span className="truncate">
                {profile.email}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Account Information */}
      <section className="mt-6 overflow-hidden rounded-2xl border bg-card">

        <div className="border-b p-5 sm:p-6">
          <h2 className="font-semibold">
            Account Information
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Information associated with your DevLens account.
          </p>
        </div>

        <div className="divide-y">

          {/* Full Name */}
          <div className="flex items-center gap-4 p-5 sm:p-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
              <User className="size-5" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Full Name
              </p>

              <p className="mt-1 text-sm font-medium">
                {name}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-4 p-5 sm:p-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
              <Mail className="size-5" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Email Address
              </p>

              <p className="mt-1 break-all text-sm font-medium">
                {profile.email}
              </p>
            </div>
          </div>

          {/* User ID */}
          <div className="flex items-center gap-4 p-5 sm:p-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
              <ShieldCheck className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">
                User ID
              </p>

              <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                {profile.userId}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyUserId}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Copy User ID"
            >
              {copied ? (
                <Check className="size-4 text-emerald-500" />
              ) : (
                <Copy className="size-4" />
              )}
            </button>
          </div>

        </div>
      </section>

      {/* Security */}
      <section className="mt-6 overflow-hidden rounded-2xl border bg-card">

        <div className="border-b p-5 sm:p-6">
          <h2 className="font-semibold">
            Security
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account security.
          </p>
        </div>

        <div className="divide-y">

          {/* Authentication */}
          <div className="flex items-center justify-between gap-4 p-5 sm:p-6">

            <div className="flex items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
                <ShieldCheck className="size-5" />
              </div>

              <div>
                <p className="text-sm font-medium">
                  Authentication
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Your session is authenticated.
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Secure
            </span>

          </div>

          {/* Password */}
          <button
            type="button"
            className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-muted/30 sm:p-6"
          >
            <div className="flex items-center gap-4">

              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
                <Lock className="size-5" />
              </div>

              <div>
                <p className="text-sm font-medium">
                  Password
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Change your account password.
                </p>
              </div>

            </div>

            <span className="text-xs font-medium text-muted-foreground">
              Change
            </span>
          </button>

        </div>
      </section>

    </div>
  );
}

export default Profile;