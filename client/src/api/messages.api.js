import { api } from "./client"

export const messagesApi = {
  send(conversationId, message) {
    return api.post(
      `/api/messages/${conversationId}`,
      message
    )
  },
}