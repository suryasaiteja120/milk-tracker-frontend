import { API_URL } from '../config'

let onUnauthorized = null

/** Registered once by AuthProvider so any 401/403 signs the user out. */
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

/**
 * Small fetch wrapper used by the whole app.
 *  - sends cookies (session auth)
 *  - JSON-encodes `body`
 *  - `parse: 'text'` for endpoints that answer with plain text
 *  - `auth: false` for public endpoints (login, reset password…)
 *  - `errorMessage` overrides the message shown for failed responses
 */

function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}


async function initializeCsrf() {
  const response = await fetch(`${API_URL}/api/csrf`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new ApiError('Could not initialize security token. Please try again.', response.status);
  }

  const data = await response.json();

  if (!data.token) {
    throw new ApiError('Could not initialize security token. Please try again.', 0);
  }

  return data.token;
}


export async function api(path, { method = 'GET', body, parse = 'json', auth = true, errorMessage } = {}) {
  let response
  const unsafeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

let csrfToken = null;

if (unsafeMethods.includes(method.toUpperCase())) {
  csrfToken = await initializeCsrf();
}
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: 'include',
      
headers: {
  ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
  ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}),
},

      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0)
  }

  if (auth && (response.status === 401 || response.status === 403)) {
    if (onUnauthorized) onUnauthorized()
    throw new ApiError('Your session has expired. Please sign in again.', response.status)
  }

  if (!response.ok) {
    let text = ''
    try {
      text = await response.text()
    } catch {
      /* ignore */
    }
    const readable = text && text.length < 200 && !text.trim().startsWith('{') ? text : ''
    throw new ApiError(errorMessage || readable || 'Something went wrong. Please try again.', response.status)
  }

  if (parse === 'text') return response.text()
  const text = await response.text()
  return text ? JSON.parse(text) : null
}
