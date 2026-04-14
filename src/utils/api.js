export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token)
  } else {
    localStorage.removeItem('token')
  }
}

export const getAuthToken = () => {
  return localStorage.getItem('token')
}

// Helper for making API calls with the JWT token
export const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken()
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  })

  // Optional: Automatically handle 401s by logging out here
  if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
    setAuthToken(null)
  }

  const data = await response.json().catch(() => null)
  
  if (!response.ok) {
    throw new Error(data?.error || `API request failed with status ${response.status}`)
  }

  return data
}
