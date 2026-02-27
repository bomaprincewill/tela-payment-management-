// components/PaidReceipts.tsx
// ================ COMPONENT STARTS HERE ================

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Home, Users, LogOut } from 'lucide-react'
import { gradeOptions } from './fee-breakdown/index'

interface BalancePayment {
  id: string
  itemId: string
  itemName: string
  amount: string
  description: string
  date: string
}

interface Receipt {
  id: number
  receipt_number: string
  date: string
  student_name: string
  grade: string
  term: string
  admission_number: string
  parent_name: string
  total_amount: number
  balance_total: number
  fee_items: Array<{
    id: string
    description: string
    amount: string
  }>
  balance_payments: BalancePayment[] | null
  created_at: string
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://icbnxkjatnqjyyxsahzo.supabase.co'
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljYm54a2phdG5xanl5eHNhaHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNTg2MjUsImV4cCI6MjA4NjgzNDYyNX0.4XVrHFunHPu18gHwwJvwWpNryKAqt8GL4bOEfGGWp4o'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const NAIRA_SYMBOL = '\u20A6'

const formatCurrency = (value?: number | string): string => {
  const amount =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? parseFloat(value.replace(/[^0-9.-]/g, '')) || 0
        : 0
  return `${NAIRA_SYMBOL}${amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

const formatDate = (value?: string): string => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  })
}

const PaidReceipts = () => {
  const router = useRouter()
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [selectedGrade, setSelectedGrade] = useState<string>('')

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (logoutError) {
      console.error('Failed to sign out:', logoutError)
    } finally {
      document.cookie = 'tela_auth=; path=/; max-age=0; SameSite=Lax'
      router.push('/login')
      router.refresh()
    }
  }

  const goToHome = () => {
    router.push('/dashboard')
  }

  const goToOutstanding = () => {
    router.push('/outstanding-balances')
  }

  const fetchReceipts = useCallback(async () => {
    setError('')
    setRefreshing(true)

    try {
      const { data, error: fetchError } = await supabase
        .from('receipts')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      const filteredReceipts = (data || []).filter(receipt => {
        const payments = receipt.balance_payments
        return !Array.isArray(payments) || payments.length === 0
      })

      setReceipts(filteredReceipts as Receipt[])
    } catch (err: unknown) {
      console.error('Failed to load paid receipts:', err)
      setError('Unable to load paid receipts right now. Please try again.')
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchReceipts()
  }, [fetchReceipts])

  const filteredReceipts = useMemo(() => {
    if (!selectedGrade) return receipts
    const normalized = selectedGrade.toLowerCase()
    return receipts.filter(receipt =>
      (receipt.grade || '').toLowerCase().includes(normalized)
    )
  }, [receipts, selectedGrade])

  const totalAmount = useMemo(
    () =>
      filteredReceipts.reduce((sum, receipt) => {
        const amount =
          typeof receipt.total_amount === 'number'
            ? receipt.total_amount
            : parseFloat(`${receipt.total_amount}`) || 0
        return sum + amount
      }, 0),
    [filteredReceipts]
  )

  const hasReceipts = receipts.length > 0
  const hasFilteredReceipts = filteredReceipts.length > 0
  const gradeLabel = selectedGrade || 'selected grade'

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen px-4'>
        <div className='text-center'>
          <RefreshCw className='w-12 h-12 text-green-500 animate-spin mx-auto mb-3' />
          <p className='text-gray-600'>Loading paid receipts...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className='bg-gray-50 min-h-screen'
      style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
    >
      <div className='max-w-6xl mx-auto px-4 py-6 sm:py-8'>
      <div className='mb-6'>
        <div className='flex items-start justify-between gap-4 flex-col sm:flex-row'>
          <div>
            <h1 className='text-3xl font-bold text-gray-800'>Paid Receipts</h1>
            <p className='text-gray-600'>
              All receipts that have been fully settled—no outstanding balance entries remain.
            </p>
          </div>
          <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
            <Button
              size='sm'
              variant='outline'
              className='border-green-200 text-green-700 hover:bg-green-50 w-full sm:w-auto flex items-center justify-center gap-2'
              onClick={fetchReceipts}
              disabled={refreshing}
            >
              <RefreshCw className='w-4 h-4' />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      <div className='flex flex-wrap gap-2 mb-4'>
        <Button
          size='sm'
          variant='outline'
          className='border-green-200 text-green-700 hover:bg-green-50 flex items-center gap-2'
          onClick={goToHome}
        >
          <Home className='w-4 h-4' />
          Home
        </Button>
        <Button
          size='sm'
          variant='outline'
          className='border-green-200 text-green-700 hover:bg-green-50 flex items-center gap-2'
          onClick={goToOutstanding}
        >
          <Users className='w-4 h-4' />
          Outstanding Payments
        </Button>
        <Button
          size='sm'
          variant='outline'
          className='border-red-200 text-red-700 hover:bg-red-50 flex items-center gap-2'
          onClick={handleLogout}
        >
          <LogOut className='w-4 h-4' />
          Log Out
        </Button>
      </div>

      <div className='flex flex-col sm:flex-row sm:items-center gap-3 mb-6'>
        <label className='text-sm font-medium text-gray-700' htmlFor='grade-filter'>
          Filter by grade
        </label>
        <select
          id='grade-filter'
          className='border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-500 flex-1 min-w-[200px]'
          value={selectedGrade}
          onChange={event => setSelectedGrade(event.target.value)}
        >
          <option value=''>All grades</option>
          {gradeOptions.map(grade => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
        <Card className='bg-green-50 border-green-200'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-green-600 mb-1'>Displayed Receipts</p>
                <p className='text-3xl font-bold text-green-700'>{filteredReceipts.length}</p>
                <p className='text-xs text-green-500'>of {receipts.length} total</p>
              </div>
              <Users className='w-12 h-12 text-green-400' />
            </div>
          </CardContent>
        </Card>
        <Card className='bg-green-50 border-green-200'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-green-600 mb-1'>Total Amount</p>
                <p className='text-3xl font-bold text-green-700'>{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='bg-green-50 border-green-200'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-green-600 mb-1'>Last updated</p>
                <p className='text-sm text-green-700'>
                  {new Date().toLocaleString('en-NG', {
                    hour: '2-digit',
                    minute: '2-digit',
                    month: 'short',
                    day: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className='bg-white border border-gray-100 shadow-sm'>
        <CardContent>
          {error && <p className='text-sm text-red-600 mb-4'>{error}</p>}

          {!hasReceipts ? (
            <p className='text-sm text-gray-600'>
              There are no paid receipts at the moment.
            </p>
          ) : !hasFilteredReceipts ? (
            <p className='text-sm text-gray-600'>
              No paid receipts found for {gradeLabel}.
            </p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-left text-sm text-gray-600'>
                <thead className='text-xs uppercase text-gray-500'>
                  <tr>
                    <th className='px-3 py-2'>Receipt #</th>
                    <th className='px-3 py-2'>Student</th>
                    <th className='px-3 py-2'>Grade</th>
                    <th className='px-3 py-2'>Term</th>
                    <th className='px-3 py-2 text-right'>Total</th>
                    <th className='px-3 py-2'>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReceipts.map(receipt => (
                    <tr
                      key={receipt.id}
                      className='border-t border-gray-100 hover:bg-gray-50'
                    >
                      <td className='px-3 py-2 font-medium text-gray-800'>
                        {receipt.receipt_number}
                      </td>
                      <td className='px-3 py-2'>{receipt.student_name || '-'}</td>
                      <td className='px-3 py-2'>{receipt.grade || '-'}</td>
                      <td className='px-3 py-2'>{receipt.term || '-'}</td>
                      <td className='px-3 py-2 text-right text-green-600 font-semibold'>
                        {formatCurrency(receipt.total_amount)}
                      </td>
                      <td className='px-3 py-2'>{formatDate(receipt.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
)
}

export default PaidReceipts

// ================ COMPONENT ENDS HERE ================
