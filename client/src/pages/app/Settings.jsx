import {
  Bell,
  Palette,
  Settings as SettingsIcon,
  Shield,
} from "lucide-react";

function Settings() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <section className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Settings
        </h1>

        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Manage your DevLens preferences and account settings.
        </p>
      </section>

      {/* Settings */}
      <div className="overflow-hidden rounded-2xl border bg-card">
        {/* General */}
        <div className="border-b p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <SettingsIcon className="size-5" />
            </div>

            <div>
              <h2 className="font-semibold">
                General
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                General application preferences.
              </p>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="flex items-center justify-between gap-4 border-b p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
              <Palette className="size-5" />
            </div>

            <div>
              <p className="text-sm font-medium">
                Appearance
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Customize how DevLens looks.
              </p>
            </div>
          </div>

          <span className="text-xs text-muted-foreground">
            System
          </span>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between gap-4 border-b p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
              <Bell className="size-5" />
            </div>

            <div>
              <p className="text-sm font-medium">
                Notifications
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Manage your notification preferences.
              </p>
            </div>
          </div>

          <span className="text-xs text-muted-foreground">
            Default
          </span>
        </div>

        {/* Security */}
        <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
              <Shield className="size-5" />
            </div>

            <div>
              <p className="text-sm font-medium">
                Security
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Manage your account security.
              </p>
            </div>
          </div>

          <span className="text-xs text-muted-foreground">
            Account
          </span>
        </div>
      </div>
    </div>
  );
}

export default Settings;