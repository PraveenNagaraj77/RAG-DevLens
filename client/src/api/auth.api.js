import { api } from "./client"

export const authApi = {
  login(credentials) {
    return api.post(
      "/api/auth/login",
      credentials
    )
  },

  register(user) {
    return api.post(
      "/api/users",
      user
    )
  },

  getProfile() {
    return api.get(
      "/api/users/profile"
    )
  },
}