// components/fee-breakdown/context/FeeBreakdownContext.tsx
// ================ CONTEXT STARTS HERE ================

import React, { createContext, useContext, useState, useMemo, useRef, useEffect } from 'react'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import {
  FormData,
  BalancePayment,
  Receipt,
  FeeItem,
  feeItemsConfig
} from '../index'
import {
  generateReceiptNumber,
  calculateGrandTotal,
  calculateBalanceTotal,
  validateForm,
  saveToSupabase,
  updateReceiptInSupabase,
  deleteReceiptFromSupabase,
  searchReceiptsByStudent,
  downloadAsPDF,
  downloadAsJPEG
} from '../utils/receiptUtils'

const sanitizeForFilename = (value?: string): string => {
  if (!value) return ''
  return value
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
}

const buildReceiptFilename = (
  studentName?: string,
  grade?: string,
  receiptNumber?: string
): string => {
  const namePart = sanitizeForFilename(studentName) || 'student'
  const gradePart = sanitizeForFilename(grade) || 'grade'
  const receiptPart = sanitizeForFilename(receiptNumber)
  const suffix = receiptPart ? `-${receiptPart}` : ''
  return `receipt-${namePart}-${gradePart}${suffix}`
}

interface FeeBreakdownContextType {
  // State
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  balancePayments: BalancePayment[]
  setBalancePayments: React.Dispatch<React.SetStateAction<BalancePayment[]>>
  showReceipt: boolean
  setShowReceipt: React.Dispatch<React.SetStateAction<boolean>>
  receiptNumber: string
  setReceiptNumber: React.Dispatch<React.SetStateAction<string>>
  downloadFormat: string
  setDownloadFormat: React.Dispatch<React.SetStateAction<string>>
  validationErrors: Record<string, string>
  setValidationErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
  isSaving: boolean
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>
  saveStatus: string | null
  setSaveStatus: React.Dispatch<React.SetStateAction<string | null>>
  saveMessage: string
  setSaveMessage: React.Dispatch<React.SetStateAction<string>>
  
  // Search related
  searchQuery: string
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>
  searchResults: Receipt[]
  setSearchResults: React.Dispatch<React.SetStateAction<Receipt[]>>
  isSearching: boolean
  setIsSearching: React.Dispatch<React.SetStateAction<boolean>>
  showSearchResults: boolean
  setShowSearchResults: React.Dispatch<React.SetStateAction<boolean>>
  selectedReceipt: Receipt | null
  setSelectedReceipt: React.Dispatch<React.SetStateAction<Receipt | null>>
  searchError: string
  setSearchError: React.Dispatch<React.SetStateAction<string>>
  
  // Edit mode
  isEditMode: boolean
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>
  editingReceiptId: number | null
  setEditingReceiptId: React.Dispatch<React.SetStateAction<number | null>>
  
  // Modal
  isModalOpen: boolean
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  modalReceipt: Receipt | null
  setModalReceipt: React.Dispatch<React.SetStateAction<Receipt | null>>
  modalDownloadFormat: string
  setModalDownloadFormat: React.Dispatch<React.SetStateAction<string>>
  isModalDownloading: boolean
  setIsModalDownloading: React.Dispatch<React.SetStateAction<boolean>>
  
  // Delete confirmation
  showDeleteConfirm: boolean
  setShowDeleteConfirm: React.Dispatch<React.SetStateAction<boolean>>
  receiptToDelete: Receipt | null
  setReceiptToDelete: React.Dispatch<React.SetStateAction<Receipt | null>>
  isDeleting: boolean
  setIsDeleting: React.Dispatch<React.SetStateAction<boolean>>
  
  // Balance payments form
  showAddBalance: boolean
  setShowAddBalance: React.Dispatch<React.SetStateAction<boolean>>
  selectedBalanceItem: string
  setSelectedBalanceItem: React.Dispatch<React.SetStateAction<string>>
  balanceAmount: string
  setBalanceAmount: React.Dispatch<React.SetStateAction<string>>
  balanceDescription: string
  setBalanceDescription: React.Dispatch<React.SetStateAction<string>>
  balanceDate: string
  setBalanceDate: React.Dispatch<React.SetStateAction<string>>
  
  // Refs
  receiptRef: React.RefObject<HTMLDivElement | null>
  downloadContainerRef: React.RefObject<HTMLDivElement | null>
  modalDownloadRef: React.RefObject<HTMLDivElement | null>
  searchInputRef: React.RefObject<HTMLInputElement | null>
  
  // Computed
  initialFeeItems: FeeItem[]
  grandTotal: string
  balanceTotal: string
  availableFeeItems: { id: string; label: string }[]
  
  // Functions
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  handleGenerateReceipt: () => Promise<void>
  handleReset: () => void
  handleDownload: () => void
  searchReceipts: () => Promise<void>
  handleSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  clearSearch: () => void
  handleSearchKeyPress: (e: React.KeyboardEvent) => void
  editReceipt: (receipt: Receipt) => void
  cancelEdit: () => void
  updateReceipt: () => Promise<void>
  openReceiptModal: (receipt: Receipt) => void
  closeModal: () => void
  confirmDelete: (receipt: Receipt) => void
  cancelDelete: () => void
  deleteReceipt: () => Promise<void>
  handleModalDownload: () => void
  clearAllBalances: () => void
  addBalancePayment: () => void
  removeBalancePayment: (id: string) => void
}

const FeeBreakdownContext = createContext<FeeBreakdownContextType | undefined>(undefined)

export const useFeeBreakdown = () => {
  const context = useContext(FeeBreakdownContext)
  if (!context) {
    throw new Error('useFeeBreakdown must be used within FeeBreakdownProvider')
  }
  return context
}

export const FeeBreakdownProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ================ REFS ================
  const receiptRef = useRef<HTMLDivElement>(null)
  const downloadContainerRef = useRef<HTMLDivElement>(null)
  const modalDownloadRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // ================ FORM STATE ================
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    studentName: '',
    grade: '',
    term: '',
    admissionNumber: '',
    parentName: '',
    tuitionFee: '',
    lessonLevy: '',
    ptaLevyOld: '',
    extraCurriculum: '',
    developmentLevy: '',
    ptaLevyNew: '',
    registrationForm: '',
    schoolUniform: '',
    peOutfit: '',
    stockings: '',
    cardigan: '',
    idCard: '',
    assessmentBooklet: '',
    endOfYearParty: '',
    endOfSessionParty: '',
    transportation: '',
    juniorWaec: '',
    seniorWaec: ''
  })

  // ================ BALANCE PAYMENTS STATE ================
  const [balancePayments, setBalancePayments] = useState<BalancePayment[]>([])
  const [showAddBalance, setShowAddBalance] = useState(false)
  const [selectedBalanceItem, setSelectedBalanceItem] = useState('')
  const [balanceAmount, setBalanceAmount] = useState('')
  const [balanceDescription, setBalanceDescription] = useState('')
  const [balanceDate, setBalanceDate] = useState(new Date().toISOString().split('T')[0])

  // ================ RECEIPT STATE ================
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptNumber, setReceiptNumber] = useState('')
  const [downloadFormat, setDownloadFormat] = useState('pdf')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState('')

  // ================ SEARCH STATE ================
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Receipt[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [searchError, setSearchError] = useState('')
  
  // ================ EDIT MODE STATE ================
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingReceiptId, setEditingReceiptId] = useState<number | null>(null)

  // ================ MODAL STATE ================
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalReceipt, setModalReceipt] = useState<Receipt | null>(null)
  const [modalDownloadFormat, setModalDownloadFormat] = useState('pdf')
  const [isModalDownloading, setIsModalDownloading] = useState(false)

  // ================ DELETE CONFIRMATION STATE ================
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [receiptToDelete, setReceiptToDelete] = useState<Receipt | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // ================ COMPUTED VALUES ================
  const initialFeeItems = useMemo(() => {
    return feeItemsConfig
      .map(item => {
        const value = formData[item.id as keyof FormData] as string
        return {
          id: item.id,
          description: item.label,
          amount: value && parseFloat(value) > 0 ? parseFloat(value).toFixed(2) : null
        }
      })
      .filter(item => item.amount !== null) as FeeItem[]
  }, [formData])

  const grandTotal = useMemo(() => {
    return calculateGrandTotal(initialFeeItems)
  }, [initialFeeItems])

  const balanceTotal = useMemo(() => {
    return calculateBalanceTotal(balancePayments)
  }, [balancePayments])

  const availableFeeItems = useMemo(() => {
    return feeItemsConfig.map(item => ({
      id: item.id,
      label: item.label
    }))
  }, [])

  // ================ HANDLER FUNCTIONS ================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value === undefined ? '' : value
    }))
    
    if (validationErrors[id]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[id]
        return newErrors
      })
    }
  }

  const validateFormBeforeSubmit = (): boolean => {
    const errors = validateForm(formData, initialFeeItems, balancePayments)
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleGenerateReceipt = async () => {
    if (!validateFormBeforeSubmit()) return

    const newReceiptNumber = generateReceiptNumber() || `RCP-${Date.now()}`
    setReceiptNumber(newReceiptNumber)
    setShowReceipt(true)
    setSaveStatus(null)
    setSaveMessage('')
    setSelectedReceipt(null)
    setIsEditMode(false)
    setEditingReceiptId(null)
    
    setIsSaving(true)
    
    const receiptData = {
      receiptNumber: newReceiptNumber,
      date: formData.date,
      studentName: formData.studentName,
      grade: formData.grade,
      term: formData.term,
      admissionNumber: formData.admissionNumber,
      parentName: formData.parentName
    }

    const result = await saveToSupabase(receiptData, initialFeeItems, balancePayments, grandTotal, balanceTotal)
    
    if (result.success) {
      setSaveStatus('success')
      setSaveMessage('Receipt saved to Supabase successfully!')
    } else {
      setSaveStatus('error')
      setSaveMessage(`Failed to save receipt: ${result.error}`)
    }
    
    setIsSaving(false)
    
    setTimeout(() => {
      setSaveStatus(null)
      setSaveMessage('')
    }, 3000)
  }

  const handleReset = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      studentName: '',
      grade: '',
      term: '',
      admissionNumber: '',
      parentName: '',
      tuitionFee: '',
      lessonLevy: '',
      ptaLevyOld: '',
      extraCurriculum: '',
      developmentLevy: '',
      ptaLevyNew: '',
      registrationForm: '',
      schoolUniform: '',
      peOutfit: '',
      stockings: '',
      cardigan: '',
      idCard: '',
      assessmentBooklet: '',
      endOfYearParty: '',
      endOfSessionParty: '',
      transportation: '',
      juniorWaec: '',
      seniorWaec: ''
    })
    setBalancePayments([])
    setShowReceipt(false)
    setValidationErrors({})
    setReceiptNumber('')
    setSaveStatus(null)
    setSaveMessage('')
    setSelectedReceipt(null)
    setIsEditMode(false)
    setEditingReceiptId(null)
  }

  const handleDownload = async () => {
    const targetElement = downloadContainerRef.current || receiptRef.current
    if (!targetElement) {
      alert('Receipt content is not available for download.')
      return
    }

    const fallbackId = receiptNumber || new Date().toISOString().split('T')[0]
    const filename = buildReceiptFilename(formData.studentName, formData.grade, fallbackId)

    try {
      if (downloadFormat === 'pdf') {
        await downloadAsPDF(targetElement, filename, html2canvas, jsPDF)
      } else {
        await downloadAsJPEG(targetElement, filename, html2canvas)
      }
    } catch (error) {
      console.error('Error downloading receipt:', error)
      alert('Failed to download receipt. Please try again.')
    }
  }

  const searchReceipts = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a student name to search')
      return
    }

    setIsSearching(true)
    setSearchError('')
    setSearchResults([])

    const result = await searchReceiptsByStudent(searchQuery)
    
    if (result.success) {
      setSearchResults(result.data || [])
      setShowSearchResults(true)
      
      if (result.data?.length === 0) {
        setSearchError('No receipts found for this student')
      }
    } else {
      setSearchError('Failed to search receipts. Please try again.')
    }
    
    setIsSearching(false)
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    if (e.target.value === '') {
      setShowSearchResults(false)
      setSearchResults([])
      setSearchError('')
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setShowSearchResults(false)
    setSearchError('')
    setSelectedReceipt(null)
    setIsEditMode(false)
    setEditingReceiptId(null)
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchReceipts()
    }
  }

  const editReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt)
    setEditingReceiptId(receipt.id)
    setIsEditMode(true)
    setShowSearchResults(false)
    
    const feeItems = receipt.fee_items || []
    const feeData: Partial<FormData> = {}
    
    feeItems.forEach(item => {
      const fieldId = feeItemsConfig.find(config => config.label === item.description)?.id
      if (fieldId) {
        feeData[fieldId as keyof FormData] = item.amount || ''
      }
    })

    if (receipt.balance_payments) {
      setBalancePayments(receipt.balance_payments)
    } else {
      setBalancePayments([])
    }

    setFormData(prev => ({
      ...prev,
      date: receipt.date,
      studentName: receipt.student_name,
      grade: receipt.grade,
      term: receipt.term,
      admissionNumber: receipt.admission_number,
      parentName: receipt.parent_name,
      ...feeData
    }))

    setReceiptNumber(receipt.receipt_number)
    setShowReceipt(true)
  }

  const cancelEdit = () => {
    setIsEditMode(false)
    setEditingReceiptId(null)
    setSelectedReceipt(null)
    handleReset()
  }

  const updateReceipt = async () => {
    if (!validateFormBeforeSubmit() || !editingReceiptId) return

    setIsSaving(true)
    setSaveStatus(null)
    setSaveMessage('')
    
    const receiptData = {
      date: formData.date,
      studentName: formData.studentName,
      grade: formData.grade,
      term: formData.term,
      admissionNumber: formData.admissionNumber,
      parentName: formData.parentName
    }

    const result = await updateReceiptInSupabase(
      editingReceiptId,
      receiptData,
      initialFeeItems,
      balancePayments,
      grandTotal,
      balanceTotal
    )
    
    if (result.success) {
      setSaveStatus('success')
      setSaveMessage('Receipt updated successfully!')
      
      if (searchQuery) {
        searchReceipts()
      }
    } else {
      setSaveStatus('error')
      setSaveMessage(`Failed to update receipt: ${result.error}`)
    }
    
    setIsSaving(false)
    
    setTimeout(() => {
      setSaveStatus(null)
      setSaveMessage('')
    }, 3000)
  }

  const openReceiptModal = (receipt: Receipt) => {
    setModalReceipt(receipt)
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalReceipt(null)
    document.body.style.overflow = 'unset'
  }

  const confirmDelete = (receipt: Receipt) => {
    setReceiptToDelete(receipt)
    setShowDeleteConfirm(true)
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setReceiptToDelete(null)
  }

  const deleteReceipt = async () => {
    if (!receiptToDelete) return

    setIsDeleting(true)

    const result = await deleteReceiptFromSupabase(receiptToDelete.id)
    
    if (result.success) {
      setSearchResults(prevResults => 
        prevResults.filter(r => r.id !== receiptToDelete.id)
      )

      if (isModalOpen && modalReceipt?.id === receiptToDelete.id) {
        closeModal()
      }

      if (editingReceiptId === receiptToDelete.id) {
        cancelEdit()
      }

      setSaveStatus('success')
      setSaveMessage('Receipt deleted successfully!')
    } else {
      setSaveStatus('error')
      setSaveMessage('Failed to delete receipt. Please try again.')
    }
    
    setIsDeleting(false)
    setShowDeleteConfirm(false)
    setReceiptToDelete(null)
    
    setTimeout(() => {
      setSaveStatus(null)
      setSaveMessage('')
    }, 3000)
  }

  const handleModalDownload = async () => {
    if (!modalReceipt) return
    if (!modalDownloadRef.current) {
      alert('Receipt content is not available for download.')
      return
    }

    setIsModalDownloading(true)
    const modalReceiptId = modalReceipt.receipt_number || modalReceipt.id?.toString()
    const filename = buildReceiptFilename(modalReceipt.student_name, modalReceipt.grade, modalReceiptId)

    try {
      if (modalDownloadFormat === 'pdf') {
        await downloadAsPDF(modalDownloadRef.current, filename, html2canvas, jsPDF)
      } else {
        await downloadAsJPEG(modalDownloadRef.current, filename, html2canvas)
      }
    } catch (error) {
      console.error('Error downloading modal receipt:', error)
      alert('Failed to download receipt. Please try again.')
    } finally {
      setIsModalDownloading(false)
    }
  }

  const clearAllBalances = () => {
    if (balancePayments.length > 0 && window.confirm('Clear all balance payments?')) {
      setBalancePayments([])
    }
  }

  const addBalancePayment = () => {
    if (!selectedBalanceItem) {
      alert('Please select a fee item')
      return
    }

    if (!balanceAmount || parseFloat(balanceAmount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    const selectedItem = feeItemsConfig.find(item => item.id === selectedBalanceItem)
    if (!selectedItem) return

    const newBalancePayment: BalancePayment = {
      id: Date.now().toString(),
      itemId: selectedBalanceItem,
      itemName: selectedItem.label,
      amount: parseFloat(balanceAmount).toFixed(2),
      description: balanceDescription || `Balance payment for ${selectedItem.label}`,
      date: balanceDate
    }

    setBalancePayments([...balancePayments, newBalancePayment])
    
    // Reset form
    setSelectedBalanceItem('')
    setBalanceAmount('')
    setBalanceDescription('')
    setShowAddBalance(false)
  }

  const removeBalancePayment = (id: string) => {
    setBalancePayments(balancePayments.filter(item => item.id !== id))
  }

  // ================ CLEANUP EFFECTS ================
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // ================ CONTEXT VALUE ================
  const value: FeeBreakdownContextType = {
    // State
    formData,
    setFormData,
    balancePayments,
    setBalancePayments,
    showReceipt,
    setShowReceipt,
    receiptNumber,
    setReceiptNumber,
    downloadFormat,
    setDownloadFormat,
    validationErrors,
    setValidationErrors,
    isSaving,
    setIsSaving,
    saveStatus,
    setSaveStatus,
    saveMessage,
    setSaveMessage,
    
    // Search
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
    setIsSearching,
    showSearchResults,
    setShowSearchResults,
    selectedReceipt,
    setSelectedReceipt,
    searchError,
    setSearchError,
    
    // Edit mode
    isEditMode,
    setIsEditMode,
    editingReceiptId,
    setEditingReceiptId,
    
    // Modal
    isModalOpen,
    setIsModalOpen,
    modalReceipt,
    setModalReceipt,
    modalDownloadFormat,
    setModalDownloadFormat,
    isModalDownloading,
    setIsModalDownloading,
    
    // Delete
    showDeleteConfirm,
    setShowDeleteConfirm,
    receiptToDelete,
    setReceiptToDelete,
    isDeleting,
    setIsDeleting,
    
    // Balance form
    showAddBalance,
    setShowAddBalance,
    selectedBalanceItem,
    setSelectedBalanceItem,
    balanceAmount,
    setBalanceAmount,
    balanceDescription,
    setBalanceDescription,
    balanceDate,
    setBalanceDate,
    
    // Refs
    receiptRef,
    downloadContainerRef,
    modalDownloadRef,
    searchInputRef,
    
    // Computed
    initialFeeItems,
    grandTotal,
    balanceTotal,
    availableFeeItems,
    
    // Functions
    handleInputChange,
    handleGenerateReceipt,
    handleReset,
    handleDownload,
    searchReceipts,
    handleSearchInputChange,
    clearSearch,
    handleSearchKeyPress,
    editReceipt,
    cancelEdit,
    updateReceipt,
    openReceiptModal,
    closeModal,
    confirmDelete,
    cancelDelete,
    deleteReceipt,
    handleModalDownload,
    clearAllBalances,
    addBalancePayment,
    removeBalancePayment
  }

  return (
    <FeeBreakdownContext.Provider value={value}>
      {children}
    </FeeBreakdownContext.Provider>
  )
}
// ================ CONTEXT ENDS HERE ================
