import { useAuth } from '@clerk/clerk-react'
import { useCallback } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_URL

export function useAuthFetch() {
  const { getToken } = useAuth()

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const token = await getToken()

      return fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })
    },
    [getToken]
  )

  return { authFetch }
}
