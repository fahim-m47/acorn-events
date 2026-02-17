export const CREATE_EVENT_PATH = '/events/new'

export function sanitizeRedirectPath(
  redirectPath: string | null | undefined,
  fallbackPath = '/'
) {
  if (!redirectPath) return fallbackPath
  if (!redirectPath.startsWith('/') || redirectPath.startsWith('//')) {
    return fallbackPath
  }
  return redirectPath
}

export function buildLoginPath(redirectPath?: string | null) {
  const safePath = sanitizeRedirectPath(redirectPath, '')

  if (!safePath || safePath === '/') {
    return '/login'
  }

  return `/login?next=${encodeURIComponent(safePath)}`
}
