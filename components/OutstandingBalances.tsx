// components/OutstandingBalances.tsx
// ================ COMPONENT STARTS HERE ================

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { 
  Search, 
  Users, 
  GraduationCap, 
  AlertTriangle,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Home,
  Receipt,
  LogOut
} from 'lucide-react'

// Types
interface BalancePayment {
  id: string
  itemId: string
  itemName: string
  amount: string
  description: string
  date: string
}

interface FeeItem {
  id: string
  description: string
  amount: string
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
  fee_items: FeeItem[]
  balance_payments: BalancePayment[]
  created_at: string
}

interface OutstandingItem {
  receiptNumber: string
  receiptDate: string
  term: string
  itemName: string
  originalAmount: number
  paidAmount: number
  outstanding: number
}

interface StudentReceipt {
  receiptNumber: string
  date: string
  term: string
  totalAmount: number
}

interface StudentBalance {
  id: number
  studentName: string
  admissionNumber: string
  grade: string
  parentName: string
  receipts: StudentReceipt[]
  totalOutstanding: number
  outstandingItems: OutstandingItem[]
}

interface GradeData {
  students: StudentBalance[]
  totalOutstanding: number
  studentCount: number
  itemCount: number
}

interface GroupedStudents {
  [grade: string]: GradeData
}

interface Stats {
  totalStudents: number
  totalOutstandingItems: number
  totalBalanceAmount: number
}

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://icbnxkjatnqjyyxsahzo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljYm54a2phdG5xanl5eHNhaHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNTg2MjUsImV4cCI6MjA4NjgzNDYyNX0.4XVrHFunHPu18gHwwJvwWpNryKAqt8GL4bOEfGGWp4o'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function OutstandingBalances() {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [studentsByGrade, setStudentsByGrade] = useState<GroupedStudents>({})
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [expandedGrades, setExpandedGrades] = useState<Record<string, boolean>>({})
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalOutstandingItems: 0,
    totalBalanceAmount: 0
  })
  const [filterGrade, setFilterGrade] = useState<string>('all')
  const [availableGrades, setAvailableGrades] = useState<string[]>([])

  // Grade options for filter
  const gradeOptions: string[] = [
    'Rainbow',
    'Glorious Star',
    'Bright Star',
    'Lavender',
    'Grade 1',
    'Grade 2',
    'Grade 3',
    'Grade 4',
    'Grade 5',
    'Grade 6',
    'JSS 1',
    'JSS 2',
    'JSS 3',
    'SS 1',
    'SS 2',
    'SS 3'
  ]

  // Fetch all receipts and calculate outstanding balances
  const fetchOutstandingBalances = async (): Promise<void> => {
    const parseAmount = (value: string | number | null | undefined): number => {
      if (typeof value === 'number') return Number.isFinite(value) ? value : 0
      if (typeof value !== 'string') return 0
      const cleaned = value.replace(/[^0-9.-]/g, '')
      const parsed = parseFloat(cleaned)
      return Number.isFinite(parsed) ? parsed : 0
    }

    try {
      setRefreshing(true)
      
      // Fetch all receipts
      const { data: receipts, error } = await supabase
        .from('receipts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching receipts:', error)
        throw error
      }

      if (!receipts) return

      // Process receipts to calculate outstanding balances per student
      const studentMap = new Map<string, StudentBalance>()
      let totalOutstandingItems = 0
      let totalBalanceAmount = 0

      receipts.forEach((receipt: Receipt) => {
        const studentKey = receipt.admission_number
        
        if (!studentMap.has(studentKey)) {
          studentMap.set(studentKey, {
            id: receipt.id,
            studentName: receipt.student_name,
            admissionNumber: receipt.admission_number,
            grade: receipt.grade,
            parentName: receipt.parent_name,
            receipts: [],
            totalOutstanding: 0,
            outstandingItems: []
          })
        }

        const student = studentMap.get(studentKey)!
        
        student.receipts.push({
          receiptNumber: receipt.receipt_number,
          date: receipt.date,
          term: receipt.term,
          totalAmount: receipt.total_amount
        })

        const feeItems = receipt.fee_items || []
        const balancePayments = receipt.balance_payments || []
        
        const paymentsByItem: Record<string, number> = {}
        balancePayments.forEach((payment: BalancePayment) => {
          if (!paymentsByItem[payment.itemId]) {
            paymentsByItem[payment.itemId] = 0
          }
          paymentsByItem[payment.itemId] += parseFloat(payment.amount)
        })

        let hasComputedOutstandingFromFeeItems = false

        feeItems.forEach((item: FeeItem) => {
          const itemAmount = parseAmount(item.amount)
          const paidAmount = paymentsByItem[item.id] || 0
          const outstanding = itemAmount - paidAmount

          if (outstanding > 0.01) {
            hasComputedOutstandingFromFeeItems = true
            student.outstandingItems.push({
              receiptNumber: receipt.receipt_number,
              receiptDate: receipt.date,
              term: receipt.term,
              itemName: item.description,
              originalAmount: itemAmount,
              paidAmount: paidAmount,
              outstanding: outstanding
            })
            student.totalOutstanding += outstanding
            totalOutstandingItems++
            totalBalanceAmount += outstanding
          }
        })

        // Fallback path:
        // Some receipts store outstanding values directly in balance_payments and may have no fee_items.
        if (!hasComputedOutstandingFromFeeItems && balancePayments.length > 0) {
          balancePayments.forEach((payment: BalancePayment) => {
            const outstanding = parseAmount(payment.amount)
            if (outstanding > 0.01) {
              student.outstandingItems.push({
                receiptNumber: receipt.receipt_number,
                receiptDate: payment.date || receipt.date,
                term: receipt.term,
                itemName: payment.itemName || payment.description || 'Balance',
                originalAmount: outstanding,
                paidAmount: 0,
                outstanding
              })
              student.totalOutstanding += outstanding
              totalOutstandingItems++
              totalBalanceAmount += outstanding
            }
          })
        }
      })

      const studentsWithBalances: StudentBalance[] = Array.from(studentMap.values())
        .filter(student => student.outstandingItems.length > 0)
        .sort((a, b) => a.grade.localeCompare(b.grade) || a.studentName.localeCompare(b.studentName))

      const grouped: GroupedStudents = {}
      studentsWithBalances.forEach(student => {
        if (!grouped[student.grade]) {
          grouped[student.grade] = {
            students: [],
            totalOutstanding: 0,
            studentCount: 0,
            itemCount: 0
          }
        }
        grouped[student.grade].students.push(student)
        grouped[student.grade].totalOutstanding += student.totalOutstanding
        grouped[student.grade].studentCount++
        grouped[student.grade].itemCount += student.outstandingItems.length
      })

      const grades = Object.keys(grouped).sort()
      setAvailableGrades(grades)

      const initialExpanded: Record<string, boolean> = {}
      grades.forEach(grade => {
        initialExpanded[grade] = true
      })
      setExpandedGrades(initialExpanded)

      setStudentsByGrade(grouped)
      setStats({
        totalStudents: studentsWithBalances.length,
        totalOutstandingItems: totalOutstandingItems,
        totalBalanceAmount: totalBalanceAmount
      })

    } catch (error) {
      console.error('Error fetching outstanding balances:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchOutstandingBalances()
  }, [])

  const toggleGrade = (grade: string): void => {
    setExpandedGrades(prev => ({
      ...prev,
      [grade]: !prev[grade]
    }))
  }

  const expandAll = (): void => {
    const expanded: Record<string, boolean> = {}
    Object.keys(studentsByGrade).forEach(grade => {
      expanded[grade] = true
    })
    setExpandedGrades(expanded)
  }

  const collapseAll = (): void => {
    const collapsed: Record<string, boolean> = {}
    Object.keys(studentsByGrade).forEach(grade => {
      collapsed[grade] = false
    })
    setExpandedGrades(collapsed)
  }

  const handleLogout = async (): Promise<void> => {
    await supabase.auth.signOut()
    document.cookie = 'tela_auth=; path=/; max-age=0; SameSite=Lax'
    router.push('/login')
    router.refresh()
  }

  const getFilteredStudents = (): GroupedStudents => {
    const filtered: GroupedStudents = {}
    
    Object.entries(studentsByGrade).forEach(([grade, data]) => {
      if (filterGrade !== 'all' && grade !== filterGrade) return
      
      const filteredStudents = data.students.filter(student => 
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentName.toLowerCase().includes(searchTerm.toLowerCase())
      )

      if (filteredStudents.length > 0) {
        filtered[grade] = {
          students: filteredStudents,
          totalOutstanding: filteredStudents.reduce((sum, s) => sum + s.totalOutstanding, 0),
          studentCount: filteredStudents.length,
          itemCount: filteredStudents.reduce((sum, s) => sum + s.outstandingItems.length, 0)
        }
      }
    })

    return filtered
  }

  const exportToCSV = (): void => {
    const filtered = getFilteredStudents()
    let csv = 'Grade,Student Name,Admission Number,Parent Name,Item Description,Term,Original Amount (₦),Paid Amount (₦),Outstanding (₦),Receipt Number,Date\n'

    Object.entries(filtered).forEach(([grade, data]) => {
      data.students.forEach(student => {
        student.outstandingItems.forEach(item => {
          csv += `"${grade}","${student.studentName}","${student.admissionNumber}","${student.parentName}","${item.itemName}","${item.term}",₦${item.originalAmount.toFixed(2)},₦${item.paidAmount.toFixed(2)},₦${item.outstanding.toFixed(2)},"${item.receiptNumber}","${new Date(item.receiptDate).toLocaleDateString()}"\n`
        })
      })
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `outstanding-balances-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filteredStudents = getFilteredStudents()

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <RefreshCw className='w-12 h-12 animate-spin text-green-500 mx-auto mb-4' />
          <p className='text-gray-600'>Loading outstanding balances...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      {/* Navigation Header */}
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link href='/dashboard'>
            <Button variant='outline' size='sm' className='flex items-center gap-2'>
              <ArrowLeft className='w-4 h-4' />
              Back to Fee Breakdown
            </Button>
          </Link>
          <div className='h-6 w-px bg-gray-300' />
          <div className='flex items-center gap-2'>
            
            <span className='text-sm text-gray-600'>Outstanding Balances</span>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Link href='/dashboard'>
            <Button size='sm' className='bg-green-600 hover:bg-green-700'>
              <Home className='w-4 h-4 mr-2' />
              Home
            </Button>
          </Link>
          <Button
            type='button'
            variant='outline'
            className='border-green-200 text-green-700 hover:bg-green-50'
            onClick={handleLogout}
          >
            <LogOut className='w-4 h-4 mr-2' />
            Log Out
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>Outstanding Balances</h1>
        <p className='text-gray-600'>Track students with pending payments across all grades</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <Card className='bg-green-50 border-green-200'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-green-600 mb-1'>Students with Balances</p>
                <p className='text-3xl font-bold text-green-700'>{stats.totalStudents}</p>
              </div>
              <Users className='w-12 h-12 text-green-400' />
            </div>
          </CardContent>
        </Card>

        <Card className='bg-green-50 border-green-200'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-green-600 mb-1'>Outstanding Items</p>
                <p className='text-3xl font-bold text-green-700'>{stats.totalOutstandingItems}</p>
              </div>
              <AlertTriangle className='w-12 h-12 text-green-400' />
            </div>
          </CardContent>
        </Card>

        <Card className='bg-green-50 border-green-200'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-green-600 mb-1'>Total Outstanding</p>
                <p className='text-3xl font-bold text-green-700'>₦{stats.totalBalanceAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <Card className='mb-6'>
        <CardContent className='p-4'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1 relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <Input
                type='text'
                placeholder='Search by student name, admission number, or parent name...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
            <div className='flex gap-2'>
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-w-[150px]'
              >
                <option value='all'>All Grades</option>
                {gradeOptions.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
              <Button
                onClick={fetchOutstandingBalances}
                variant='outline'
                disabled={refreshing}
                className='whitespace-nowrap'
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={exportToCSV}
                className='bg-green-600 hover:bg-green-700 text-white whitespace-nowrap'
              >
                <Download className='w-4 h-4 mr-2' />
                Export CSV
              </Button>
            </div>
          </div>
          
          {/* Expand/Collapse Controls */}
          {Object.keys(filteredStudents).length > 0 && (
            <div className='flex justify-end gap-2 mt-4'>
              <Button
                size='sm'
                variant='ghost'
                onClick={expandAll}
                className='text-green-600'
              >
                <ChevronDown className='w-4 h-4 mr-1' />
                Expand All
              </Button>
              <Button
                size='sm'
                variant='ghost'
                onClick={collapseAll}
                className='text-green-600'
              >
                <ChevronUp className='w-4 h-4 mr-1' />
                Collapse All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outstanding Balances by Grade */}
      {Object.keys(filteredStudents).length > 0 ? (
        <div className='space-y-4'>
          {Object.entries(filteredStudents).map(([grade, data]) => (
            <Card key={grade} className='overflow-hidden border-2 border-gray-200'>
              {/* Grade Header */}
              <div 
                className='bg-gradient-to-r from-gray-50 to-gray-100 p-4 cursor-pointer hover:from-gray-100 hover:to-gray-200 transition-all'
                onClick={() => toggleGrade(grade)}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='bg-green-100 p-2 rounded-lg'>
                      <GraduationCap className='w-6 h-6 text-green-600' />
                    </div>
                    <div>
                      <h2 className='text-xl font-semibold text-gray-800'>{grade}</h2>
                      <div className='flex gap-4 mt-1 text-sm'>
                        <span className='text-gray-600'>{data.studentCount} students</span>
                        <span className='text-gray-600'>•</span>
                        <span className='text-gray-600'>{data.itemCount} outstanding items</span>
                        <span className='text-gray-600'>•</span>
                        <span className='font-medium text-green-600'>₦{data.totalOutstanding.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-4'>
                    <span className='text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full'>
                      {stats.totalBalanceAmount > 0 
                        ? ((data.totalOutstanding / stats.totalBalanceAmount) * 100).toFixed(1) 
                        : '0'}% of total
                    </span>
                    {expandedGrades[grade] ? (
                      <ChevronUp className='w-5 h-5 text-gray-500' />
                    ) : (
                      <ChevronDown className='w-5 h-5 text-gray-500' />
                    )}
                  </div>
                </div>
              </div>

              {/* Students List */}
              {expandedGrades[grade] && (
                <div className='p-4 space-y-4 bg-white'>
                  {data.students.map((student) => (
                    <div key={student.admissionNumber} className='border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow'>
                      {/* Student Header */}
                      <div className='bg-green-50 p-3 border-b'>
                        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
                          <div>
                            <h3 className='font-semibold text-gray-800'>{student.studentName}</h3>
                            <p className='text-sm text-gray-600'>
                              Adm: {student.admissionNumber} • Parent: {student.parentName}
                            </p>
                          </div>
                          <div className='text-right'>
                            <p className='text-sm font-medium text-gray-600'>Total Outstanding</p>
                            <p className='text-lg font-bold text-green-600'>₦{student.totalOutstanding.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Outstanding Items Table */}
                      <div className='overflow-x-auto'>
                        <table className='w-full'>
                          <thead className='bg-gray-50'>
                            <tr>
                              <th className='text-left p-3 text-xs font-medium text-gray-500 uppercase'>Receipt #</th>
                              <th className='text-left p-3 text-xs font-medium text-gray-500 uppercase'>Term</th>
                              <th className='text-left p-3 text-xs font-medium text-gray-500 uppercase'>Item</th>
                              <th className='text-right p-3 text-xs font-medium text-gray-500 uppercase'>Original (₦)</th>
                              <th className='text-right p-3 text-xs font-medium text-gray-500 uppercase'>Paid (₦)</th>
                              <th className='text-right p-3 text-xs font-medium text-gray-500 uppercase'>Outstanding (₦)</th>
                            </tr>
                          </thead>
                          <tbody className='divide-y'>
                            {student.outstandingItems.map((item, itemIdx) => (
                              <tr key={itemIdx} className='hover:bg-gray-50'>
                                <td className='p-3 text-sm font-mono'>{item.receiptNumber}</td>
                                <td className='p-3 text-sm'>{item.term}</td>
                                <td className='p-3 text-sm'>{item.itemName}</td>
                                <td className='p-3 text-sm text-right'>₦{item.originalAmount.toFixed(2)}</td>
                                <td className='p-3 text-sm text-right text-green-600'>₦{item.paidAmount.toFixed(2)}</td>
                                <td className='p-3 text-sm text-right font-medium text-green-600'>₦{item.outstanding.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Student Receipts Summary */}
                      <div className='bg-gray-50 p-2 text-xs text-gray-500 border-t'>
                        <span className='font-medium'>Receipts: </span>
                        {student.receipts.map((r, i) => (
                          <span key={i}>
                            {i > 0 && ', '}
                            {r.receiptNumber} ({r.term})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className='p-12 text-center'>
            <div className='flex justify-center mb-4'>
              <div className='bg-green-100 p-3 rounded-full'>
                <AlertTriangle className='w-12 h-12 text-green-600' />
              </div>
            </div>
            <h3 className='text-xl font-semibold text-gray-800 mb-2'>No Outstanding Balances</h3>
            <p className='text-gray-600 mb-4'>
              {searchTerm || filterGrade !== 'all' 
                ? 'No students match your search criteria.' 
                : 'All students have fully paid their fees.'}
            </p>
            {(searchTerm || filterGrade !== 'all') && (
              <Button
                onClick={() => {
                  setSearchTerm('')
                  setFilterGrade('all')
                }}
                variant='outline'
              >
                Clear Filters
              </Button>
            )}
            <div className='mt-4'>
              <Link href='/dashboard'>
                <Button className='bg-green-600 hover:bg-green-700'>
                  Go to Fee Breakdown
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Footer */}
      {Object.keys(filteredStudents).length > 0 && (
        <Card className='mt-6 bg-gray-50'>
          <CardContent className='p-4'>
            <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
              <div className='text-sm text-gray-600'>
                Showing {Object.values(filteredStudents).reduce((acc, data) => acc + data.students.length, 0)} students across {Object.keys(filteredStudents).length} grades
              </div>
              <div className='flex gap-6'>
                <div>
                  <span className='text-sm font-medium text-gray-600'>Total Outstanding: </span>
                  <span className='text-lg font-bold text-green-600'>₦{stats.totalBalanceAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
// ================ COMPONENT ENDS HERE ================


