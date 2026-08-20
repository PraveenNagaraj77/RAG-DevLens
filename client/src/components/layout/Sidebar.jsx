import {
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
  X,
} from "lucide-react"
import { NavLink } from "react-router-dom"

import { useAuth } from "@/context/AuthContext"

const navigation = [
  {
    label: "Dashboard",
    href: "/app/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    href: "/app/projects",
    icon: FolderKanban,
  },
]

const secondaryNavigation = [
  {
    label: "Profile",
    href: "/app/profile",
    icon: UserRound,
  },
  {
    label: "Settings",
    href: "/app/settings",
    icon: Settings,
  },
]

function NavigationItem({ item, onClick }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.href}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-lg px-3 py-2.5",
          "text-sm font-medium",
          "transition-colors duration-150",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
        ].join(" ")
      }
    >
      <Icon className="size-4 shrink-0" />
      <span>{item.label}</span>
    </NavLink>
  )
}

function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  console.log(user);

  const userName = user?.name || "Developer"
  const userEmail = user?.email || ""
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col",
        "border-r border-sidebar-border bg-sidebar",
        "transition-transform duration-200 ease-out",
        open ? "translate-x-0" : "-translate-x-full",
        "lg:relative lg:translate-x-0",
      ].join(" ")}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
            D
          </div>

          <span className="text-sm font-semibold tracking-tight">
            DevLens
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
          aria-label="Close navigation"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <p className="mb-2 px-3 pt-2 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
          Workspace
        </p>

        <div className="space-y-1">
          {navigation.map((item) => (
            <NavigationItem
              key={item.href}
              item={item}
              onClick={onClose}
            />
          ))}
        </div>

        <div className="my-5 h-px bg-sidebar-border" />

        <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
          Account
        </p>

        <div className="space-y-1">
          {secondaryNavigation.map((item) => (
            <NavigationItem
              key={item.href}
              item={item}
              onClick={onClose}
            />
          ))}
        </div>
      </nav>

      {/* User */}
      <div className="shrink-0 border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold">
            {userInitial}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {userName}
            </p>

            <p className="truncate text-xs text-sidebar-foreground/50">
              {userEmail}
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-md p-1.5 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar