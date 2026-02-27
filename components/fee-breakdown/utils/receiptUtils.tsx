// components/fee-breakdown/utils/receiptUtils.tsx
// ================ UTILITIES START HERE ================

import { FormData, BalancePayment, FeeItem, Receipt, supabase } from '../index'

interface StudentWithOutstanding {
  grade: string
  totalOutstanding: number
  outstandingItems?: Array<unknown>
}

interface GradeGroup {
  students: StudentWithOutstanding[]
  totalOutstanding: number
  studentCount: number
  itemCount: number
}

type Html2CanvasFn = (
  element: HTMLElement,
  options?: Record<string, unknown>
) => Promise<HTMLCanvasElement>

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const maybeSupabase = error as {
      message?: string
      code?: string
      details?: string
      hint?: string
    }

    const parts = [
      maybeSupabase.message,
      maybeSupabase.code ? `(code: ${maybeSupabase.code})` : undefined,
      maybeSupabase.details ? `details: ${maybeSupabase.details}` : undefined,
      maybeSupabase.hint ? `hint: ${maybeSupabase.hint}` : undefined
    ].filter(Boolean)

    if (parts.length > 0) {
      return parts.join(' | ')
    }
  }

  return error instanceof Error ? error.message : 'Unknown error occurred'
}

const formatSupabaseError = (error: unknown): string => {
  const message = getErrorMessage(error)
  if (message !== 'Unknown error occurred') {
    return message
  }

  if (typeof error === 'object' && error !== null) {
    const keys = Object.getOwnPropertyNames(error)
    if (keys.length > 0) {
      const details = keys
        .map((key) => {
          const value = (error as Record<string, unknown>)[key]
          return `${key}: ${String(value)}`
        })
        .join(', ')
      return `Supabase returned an unexpected error object (${details})`
    }
  }

  return 'Supabase returned an empty error object. Check table permissions (RLS), schema columns, and API key settings.'
}

/**
 * Generate a unique receipt number
 * Format: RCP-YYYYMMDD-XXXXX (e.g., RCP-20250217-ABC12)
 */
export const generateReceiptNumber = (): string => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateStr = `${year}${month}${day}`
  
  // Generate random alphanumeric string
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  
  return `RCP-${dateStr}-${random}`
}

/**
 * Calculate grand total from fee items
 */
export const calculateGrandTotal = (items: FeeItem[]): string => {
  return items.reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0).toFixed(2)
}

/**
 * Calculate total from balance payments
 */
export const calculateBalanceTotal = (payments: BalancePayment[]): string => {
  return payments.reduce((sum, item) => sum + parseFloat(item.amount), 0).toFixed(2)
}

/**
 * Validate form before submission
 */
export const validateForm = (
  formData: FormData,
  initialFeeItems: FeeItem[],
  balancePayments: BalancePayment[]
): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  // Student information validation
  if (!formData.studentName?.trim()) {
    errors.studentName = 'Student name is required'
  }
  if (!formData.grade) {
    errors.grade = 'Grade is required'
  }
  if (!formData.term) {
    errors.term = 'Term is required'
  }
  if (!formData.admissionNumber?.trim()) {
    errors.admissionNumber = 'Parent/Guardian contact is required'
  }
  if (!formData.parentName?.trim()) {
    errors.parentName = 'Parent/Guardian name is required'
  }

  // Fee items validation
  const hasFeeItem = initialFeeItems.length > 0
  if (!hasFeeItem && balancePayments.length === 0) {
    errors.feeItems = 'At least one fee item or balance payment must be entered'
  }

  return errors
}

/**
 * Save new receipt to Supabase
 */
export const saveToSupabase = async (
  receiptData: {
    receiptNumber: string
    date: string
    studentName: string
    grade: string
    term: string
    admissionNumber: string
    parentName: string
  },
  initialItems: FeeItem[],
  balanceItems: BalancePayment[],
  grandTotal: string,
  balanceTotal: string
): Promise<{ success: boolean; data?: Receipt[]; error?: string }> => {
  try {
    console.log('Attempting to save to Supabase...')
    
    const { error } = await supabase
      .from('receipts')
      .insert([
        {
          receipt_number: receiptData.receiptNumber,
          date: receiptData.date,
          student_name: receiptData.studentName,
          grade: receiptData.grade,
          term: receiptData.term,
          admission_number: receiptData.admissionNumber,
          parent_name: receiptData.parentName,
          payment_method: 'Cash',
          total_amount: parseFloat(grandTotal),
          balance_total: parseFloat(balanceTotal),
          fee_items: initialItems,
          balance_payments: balanceItems
        }
      ])

    if (error) {
      const formattedError = formatSupabaseError(error)
      console.error('Supabase error:', error)
      console.error('Supabase error details:', formattedError)
      return { success: false, error: formattedError }
    }
    
    console.log('Successfully saved to Supabase')
    return { success: true }
  } catch (error: unknown) {
    const formattedError = formatSupabaseError(error)
    console.error('Error in saveToSupabase:', error)
    console.error('Error in saveToSupabase (formatted):', formattedError)
    return { success: false, error: formattedError }
  }
}

/**
 * Update existing receipt in Supabase
 */
export const updateReceiptInSupabase = async (
  receiptId: number,
  receiptData: {
    date: string
    studentName: string
    grade: string
    term: string
    admissionNumber: string
    parentName: string
  },
  initialItems: FeeItem[],
  balanceItems: BalancePayment[],
  grandTotal: string,
  balanceTotal: string
): Promise<{ success: boolean; data?: Receipt[]; error?: string }> => {
  try {
    console.log('Attempting to update receipt in Supabase...')
    
    const { error } = await supabase
      .from('receipts')
      .update({
        date: receiptData.date,
        student_name: receiptData.studentName,
        grade: receiptData.grade,
        term: receiptData.term,
        admission_number: receiptData.admissionNumber,
        parent_name: receiptData.parentName,
        payment_method: 'Cash',
        total_amount: parseFloat(grandTotal),
        balance_total: parseFloat(balanceTotal),
        fee_items: initialItems,
        balance_payments: balanceItems
      })
      .eq('id', receiptId)

    if (error) {
      const formattedError = formatSupabaseError(error)
      console.error('Supabase error:', error)
      console.error('Supabase error details:', formattedError)
      return { success: false, error: formattedError }
    }
    
    console.log('Successfully updated receipt')
    return { success: true }
  } catch (error: unknown) {
    const formattedError = formatSupabaseError(error)
    console.error('Error in updateReceiptInSupabase:', error)
    console.error('Error in updateReceiptInSupabase (formatted):', formattedError)
    return { success: false, error: formattedError }
  }
}

/**
 * Delete receipt from Supabase
 */
export const deleteReceiptFromSupabase = async (
  receiptId: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Attempting to delete receipt from Supabase...')
    
    const { error } = await supabase
      .from('receipts')
      .delete()
      .eq('id', receiptId)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    console.log('Successfully deleted receipt')
    return { success: true }
  } catch (error: unknown) {
    console.error('Error in deleteReceiptFromSupabase:', error)
    return { success: false, error: getErrorMessage(error) }
  }
}

/**
 * Search receipts by student name
 */
export const searchReceiptsByStudent = async (
  searchQuery: string
): Promise<{ success: boolean; data?: Receipt[]; error?: string }> => {
  try {
    console.log('Searching for receipts:', searchQuery)
    
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .ilike('student_name', `%${searchQuery}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Search results:', data)
    return { success: true, data }
  } catch (error: unknown) {
    console.error('Error in searchReceiptsByStudent:', error)
    return { success: false, error: getErrorMessage(error) }
  }
}

/**
 * Get all receipts (for outstanding balances page)
 */
export const getAllReceipts = async (): Promise<{ success: boolean; data?: Receipt[]; error?: string }> => {
  try {
    console.log('Fetching all receipts...')
    
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Fetched receipts:', data?.length)
    return { success: true, data }
  } catch (error: unknown) {
    console.error('Error in getAllReceipts:', error)
    return { success: false, error: getErrorMessage(error) }
  }
}

/**
 * Format currency in Naira
 */
export const formatNaira = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return `₦${numAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

/**
 * Parse date to local string
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Calculate outstanding balances for a student
 */
export const calculateStudentOutstanding = (
  feeItems: FeeItem[],
  balancePayments: BalancePayment[]
): {
  totalOutstanding: number
  outstandingItems: Array<{
    itemId: string
    itemName: string
    originalAmount: number
    paidAmount: number
    outstanding: number
  }>
} => {
  // Group balance payments by item
  const paymentsByItem: Record<string, number> = {}
  balancePayments.forEach(payment => {
    if (!paymentsByItem[payment.itemId]) {
      paymentsByItem[payment.itemId] = 0
    }
    paymentsByItem[payment.itemId] += parseFloat(payment.amount)
  })

  let totalOutstanding = 0
  const outstandingItems: Array<{
    itemId: string
    itemName: string
    originalAmount: number
    paidAmount: number
    outstanding: number
  }> = []

  // Calculate outstanding for each fee item
  feeItems.forEach(item => {
    const itemAmount = parseFloat(item.amount || '0')
    const paidAmount = paymentsByItem[item.id] || 0
    const outstanding = itemAmount - paidAmount

    if (outstanding > 0.01) { // Using small threshold to avoid floating point issues
      outstandingItems.push({
        itemId: item.id,
        itemName: item.description,
        originalAmount: itemAmount,
        paidAmount: paidAmount,
        outstanding: outstanding
      })
      totalOutstanding += outstanding
    }
  })

  return { totalOutstanding, outstandingItems }
}

/**
 * Group students by grade
 */
export const groupStudentsByGrade = (students: StudentWithOutstanding[]): Record<string, GradeGroup> => {
  const grouped: Record<string, GradeGroup> = {}
  
  students.forEach(student => {
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
    grouped[student.grade].itemCount += student.outstandingItems?.length || 0
  })

  return grouped
}

/**
 * Export data to CSV
 */
export const exportToCSV = (data: Array<Record<string, unknown>>, filename: string): void => {
  if (!data || data.length === 0) return

  // Get headers from first object
  const headers = Object.keys(data[0]).join(',')
  
  // Convert data to CSV rows
  const rows = data.map(obj => 
    Object.values(obj).map(value => 
      typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value
    ).join(',')
  ).join('\n')

  const csv = `${headers}\n${rows}`
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

/**
 * Download receipt as PDF (utility function)
 */
export const downloadAsPDF = async (
  element: HTMLElement,
  filename: string,
  html2canvas: Html2CanvasFn,
  jsPDF: unknown
): Promise<void> => {
  try {
    // Add temporary padding for capture
    element.style.padding = '40px'
    element.style.backgroundColor = '#ffffff'
    
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: false,
      useCORS: true,
      windowWidth: element.scrollWidth + 80,
      windowHeight: element.scrollHeight + 80
    })
    
    // Remove temporary padding
    element.style.padding = ''
    element.style.backgroundColor = ''
    
    const imgData = canvas.toDataURL('image/png')
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    const PDFConstructor = jsPDF as {
      new (options?: Record<string, unknown>): {
        addImage: (...args: unknown[]) => unknown
        save: (outputFilename: string) => void
      }
    }

    const pdf = new PDFConstructor({
      orientation: imgHeight > pageHeight ? 'portrait' : 'portrait',
      unit: 'mm'
    })
    
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth - 20, imgHeight - 20)
    pdf.save(`${filename}.pdf`)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}

/**
 * Download receipt as JPEG (utility function)
 */
export const downloadAsJPEG = async (
  element: HTMLElement,
  filename: string,
  html2canvas: Html2CanvasFn
): Promise<void> => {
  try {
    // Add temporary padding for capture
    element.style.padding = '40px'
    element.style.backgroundColor = '#ffffff'
    
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: false,
      useCORS: true
    })
    
    // Remove temporary padding
    element.style.padding = ''
    element.style.backgroundColor = ''
    
    // Create a new canvas with white border
    const padding = 40
    const borderedCanvas = document.createElement('canvas')
    borderedCanvas.width = canvas.width + (padding * 2)
    borderedCanvas.height = canvas.height + (padding * 2)
    
    const ctx = borderedCanvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, borderedCanvas.width, borderedCanvas.height)
      ctx.drawImage(canvas, padding, padding, canvas.width, canvas.height)
    }
    
    const link = document.createElement('a')
    link.download = `${filename}.jpeg`
    link.href = borderedCanvas.toDataURL('image/jpeg', 0.95)
    link.click()
  } catch (error) {
    console.error('Error generating JPEG:', error)
    throw error
  }
}

// ================ UTILITIES END HERE ================
