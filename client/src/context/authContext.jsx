import {
  createContext,
  useContext,
  useState,
} from "react"

import { authApi } from "@/api/auth.api"

const AuthContext = createContext(null)

function getStoredUser() {
  const storedUser = localStorage.getItem("user")

  if (!storedUser || storedUser === "undefined") {
    return null
  }

  try {
    return JSON.parse(storedUser)
  } catch (error) {
    console.error("Invalid stored user:", error)

    localStorage.removeItem("user")

    return null
  }
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)

  const login = async (credentials) => {
    const response = await authApi.login(credentials)

    const loggedInUser = response.data.user
    const token = response.data.token

    localStorage.setItem("token", token)

    localStorage.setItem(
      "user",
      JSON.stringify(loggedInUser)
    )

    setUser(loggedInUser)

    return response
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    setUser(null)

    window.location.href = "/"
  }

  const token = localStorage.getItem("token")

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    )
  }

  return context
}

export {
  AuthProvider,
  useAuth,
}