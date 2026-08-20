import { api } from "./client"

export const conversationsApi = {
  create(data) {
    return api.post(
      "/api/conversations",
      data
    )
  },
}