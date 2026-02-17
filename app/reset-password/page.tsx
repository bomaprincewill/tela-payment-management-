'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anonKey) return null
    return createClient(url, anonKey)
  }, [])

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!supabase) {
      setErrorMessage('Supabase credentials are missing.')
      return
    }

    if (!password.trim() || !confirmPassword.trim()) {
      setErrorMessage('Both password fields are required.')
      return
    }

    if (password.trim().length < 8) {
      setErrorMessage('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase.auth.updateUser({
      password: password.trim()
    })

    if (error) {
      setErrorMessage(
        error.message ||
          'Unable to reset password. Open this page from your email reset link and try again.'
      )
      setIsSubmitting(false)
      return
    }

    await supabase.auth.signOut()
    setSuccessMessage('Password reset successful. Redirecting to login...')

    setTimeout(() => {
      router.push('/login')
      router.refresh()
    }, 1200)
  }

  return (
    <div className='min-h-screen bg-green-50 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md border-green-200 shadow-sm'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-green-700 text-center'>
            Reset Password
          </CardTitle>
          <p className='text-sm text-gray-600 text-center'>
            Set a new password for your account
          </p>
        </CardHeader>
        <CardContent>
          <form className='space-y-4' onSubmit={handleReset}>
            <div>
              <label htmlFor='password' className='text-sm font-medium text-gray-700'>
                New Password
              </label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter new password'
                autoComplete='new-password'
              />
            </div>

            <div>
              <label htmlFor='confirmPassword' className='text-sm font-medium text-gray-700'>
                Confirm Password
              </label>
              <Input
                id='confirmPassword'
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='Confirm new password'
                autoComplete='new-password'
              />
            </div>

            {errorMessage && (
              <p className='text-sm text-green-700 bg-green-100 border border-green-200 rounded-md px-3 py-2'>
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className='text-sm text-green-700 bg-green-100 border border-green-200 rounded-md px-3 py-2'>
                {successMessage}
              </p>
            )}

            <Button
              type='submit'
              className='w-full bg-green-600 hover:bg-green-700 text-white'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
