const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://devlens-backend-c43e3.containers.snapdeploy.app"

async function apiRequest(
  endpoint,
  {
    method = "GET",
    body,
    headers = {},
  } = {}
) {
  const token = localStorage.getItem("token")

  const requestHeaders = {
    ...headers,
  }

  if (!(body instanceof FormData)) {
    requestHeaders["Content-Type"] =
      "application/json"
  }

  if (token) {
    requestHeaders.Authorization =
      `Bearer ${token}`
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method,
      headers: requestHeaders,
      body:
        body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    }
  )

  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Something went wrong"
    )
  }

  return data
}

export const api = {
  get(endpoint) {
    return apiRequest(endpoint)
  },

  post(endpoint, body) {
    return apiRequest(endpoint, {
      method: "POST",
      body,
    })
  },

  put(endpoint, body) {
    return apiRequest(endpoint, {
      method: "PUT",
      body,
    })
  },

  delete(endpoint) {
    return apiRequest(endpoint, {
      method: "DELETE",
    })
  },
}