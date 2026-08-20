import { Bell, Menu } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

function Topbar({ onMenuClick }) {
  const { user } = useAuth()

  console.log("TOPBAR USER:", user)

  const userName = user?.name || "User"
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            Dashboard
          </p>

          <p className="hidden text-xs text-muted-foreground sm:block">
            Your development workspace
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />

          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
        </button>

        <div className="hidden h-5 w-px bg-border sm:block" />

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {userInitial}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium">
              {userName}
            </p>

            <p className="text-xs text-muted-foreground">
              Developer
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Topbar