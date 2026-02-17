'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const ALLOWED_EMAILS = ['fastidous@gmail.com', 'fastidious@gmail.com']
const AUTH_COOKIE_NAME = 'tela_auth'
const AUTH_COOKIE_VALUE = 'allowed'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [resetError, setResetError] = useState('')
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [showResetForm, setShowResetForm] = useState(false)

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anonKey) return null
    return createClient(url, anonKey)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage('')

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Email and password are required.')
      return
    }

    if (!supabase) {
      setErrorMessage('Supabase credentials are missing.')
      return
    }

    setIsLoading(true)

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPassword = password.trim()

    if (!ALLOWED_EMAILS.includes(normalizedEmail)) {
      setErrorMessage('Invalid email or password.')
      setIsLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: normalizedPassword
    })

    if (error) {
      setErrorMessage(error.message || 'Invalid email or password.')
      setIsLoading(false)
      return
    }

    document.cookie = `${AUTH_COOKIE_NAME}=${AUTH_COOKIE_VALUE}; path=/; max-age=86400; SameSite=Lax`
    router.push('/dashboard')
    router.refresh()
  }

  const handleSendResetCode = async () => {
    setResetMessage('')
    setResetError('')

    const normalizedResetEmail = (resetEmail || email).trim().toLowerCase()

    if (!supabase) {
      setResetError('Supabase credentials are missing.')
      return
    }

    if (!ALLOWED_EMAILS.includes(normalizedResetEmail)) {
      setResetError('Reset is only available for the authorized login email.')
      return
    }

    setIsSendingCode(true)

    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizedResetEmail,
      {
        redirectTo: `${window.location.origin}/reset-password`
      }
    )

    if (error) {
      setResetError(error.message || 'Failed to send reset code.')
      setIsSendingCode(false)
      return
    }

    setResetEmail(normalizedResetEmail)
    setResetMessage('A password reset link has been sent to your email.')
    setIsSendingCode(false)
  }

  return (
    <div className='min-h-screen bg-green-50 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md border-green-200 shadow-sm'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-green-700 text-center'>
            Tela Login
          </CardTitle>
          <p className='text-sm text-gray-600 text-center'>
            Sign in to access receipt management
          </p>
        </CardHeader>
        <CardContent>
          <form className='space-y-4' onSubmit={handleSubmit}>
            <div>
              <label htmlFor='email' className='text-sm font-medium text-gray-700'>
                Email
              </label>
              <Input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='name@example.com'
                autoComplete='email'
              />
            </div>

            <div>
              <label htmlFor='password' className='text-sm font-medium text-gray-700'>
                Password
              </label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter your password'
                autoComplete='current-password'
              />
            </div>

            {errorMessage && (
              <p className='text-sm text-green-700 bg-green-100 border border-green-200 rounded-md px-3 py-2'>
                {errorMessage}
              </p>
            )}

            <Button
              type='submit'
              className='w-full bg-green-600 hover:bg-green-700 text-white'
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className='mt-4 border-t border-green-100 pt-4'>
            <button
              type='button'
              className='text-sm text-green-700 hover:text-green-800 underline'
              onClick={() => {
                setShowResetForm(prev => !prev)
                setResetMessage('')
                setResetError('')
              }}
            >
              {showResetForm ? 'Hide password reset' : 'Forgot password?'}
            </button>

            {showResetForm && (
              <div className='mt-3 space-y-3'>
                <div>
                  <label htmlFor='resetEmail' className='text-sm font-medium text-gray-700'>
                    Login Email
                  </label>
                  <Input
                    id='resetEmail'
                    type='email'
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder='fastidous@gmail.com'
                    autoComplete='email'
                  />
                </div>

                <Button
                  type='button'
                  onClick={handleSendResetCode}
                  className='w-full bg-green-600 hover:bg-green-700 text-white'
                  disabled={isSendingCode}
                >
                  {isSendingCode ? 'Sending link...' : 'Send Reset Link'}
                </Button>

                {resetMessage && (
                  <p className='text-sm text-green-700 bg-green-100 border border-green-200 rounded-md px-3 py-2'>
                    {resetMessage}
                  </p>
                )}

                {resetError && (
                  <p className='text-sm text-green-700 bg-green-100 border border-green-200 rounded-md px-3 py-2'>
                    {resetError}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
