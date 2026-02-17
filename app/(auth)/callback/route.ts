import { NextResponse } from 'next/server'
import { buildLoginPath, sanitizeRedirectPath } from '@/lib/auth-redirect'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const nextPath = sanitizeRedirectPath(requestUrl.searchParams.get('next'))

  // Handle OAuth errors from provider
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    const loginUrl = new URL(buildLoginPath(nextPath), requestUrl.origin)
    loginUrl.searchParams.set('error', errorDescription || error)
    return NextResponse.redirect(loginUrl)
  }

  if (!code) {
    const loginUrl = new URL(buildLoginPath(nextPath), requestUrl.origin)
    loginUrl.searchParams.set('error', 'No authorization code provided')
    return NextResponse.redirect(loginUrl)
  }

  try {
    const supabase = await createServerSupabaseClient()

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError)
      const loginUrl = new URL(buildLoginPath(nextPath), requestUrl.origin)
      loginUrl.searchParams.set('error', exchangeError.message)
      return NextResponse.redirect(loginUrl)
    }

    // Successfully authenticated - redirect to requested path
    return NextResponse.redirect(new URL(nextPath, requestUrl.origin))
  } catch (err) {
    console.error('Unexpected error during auth callback:', err)
    const loginUrl = new URL(buildLoginPath(nextPath), requestUrl.origin)
    loginUrl.searchParams.set('error', 'An unexpected error occurred')
    return NextResponse.redirect(loginUrl)
  }
}
