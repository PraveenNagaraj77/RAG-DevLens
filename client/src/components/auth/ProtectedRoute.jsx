import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "@/context/AuthContext"

function ProtectedRoute() {
  const {
    isAuthenticated,
    loading,
  } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">
          Loading...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return <Outlet />
}

export default ProtectedRoute