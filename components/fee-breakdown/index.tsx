// components/fee-breakdown/index.tsx
// ================ COMPONENT STARTS HERE ================

import React from 'react'
import { createClient } from '@supabase/supabase-js'
import { FeeBreakdownProvider, useFeeBreakdown } from './context/FeeBreakdownContext'
import NavigationHeader from './NavigationHeader'
import SearchSection from './SearchSection'
import StudentInfoForm from './StudentInfoForm'
import FeeBreakdownGrid from './FeeBreakdownGrid'
import BalancePaymentsSection from './BalancePaymentsSection'
import TotalAmountsCard from './TotalAmountCard'
import ActionButtons from './ActionButtons'
import ReceiptPreview from './ReceiptPreview'
import ReceiptModal from './ReceiptModal'
import DeleteConfirmationModal from './DeleteConfirmationModal'
import { Edit, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://icbnxkjatnqjyyxsahzo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljYm54a2phdG5xanl5eHNhaHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNTg2MjUsImV4cCI6MjA4NjgzNDYyNX0.4XVrHFunHPu18gHwwJvwWpNryKAqt8GL4bOEfGGWp4o'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface BalancePayment {
  id: string
  itemId: string
  itemName: string
  amount: string
  description: string
  date: string
}

export interface FeeItem {
  id: string
  description: string
  amount: string | null
}

export interface Receipt {
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

export interface FormData {
  date: string
  studentName: string
  grade: string
  term: string
  admissionNumber: string
  parentName: string
  tuitionFee: string
  lessonLevy: string
  ptaLevyOld: string
  extraCurriculum: string
  developmentLevy: string
  ptaLevyNew: string
  registrationForm: string
  schoolUniform: string
  peOutfit: string
  stockings: string
  cardigan: string
  idCard: string
  assessmentBooklet: string
  endOfYearParty: string
  endOfSessionParty: string
  transportation: string
  juniorWaec: string
  seniorWaec: string
}

export const gradeOptions = [
  'Angel',
  'Rainbow',
  'Glorious Star',
  'Bright Star',
  'Lavender',
  'Year 1',
  'Year 2',
  'Year 3',
  'Year 4',
  'Year 5',
  'Year 6',
  'Year 7',
  'Year 8',
  'Year 9',
  'Year 10',
  'Year 11',
  'Year 12'
]

export const termOptions = ['1st Term', '2nd Term', '3rd Term']

export const feeItemsConfig = [
  { id: 'tuitionFee', label: 'Tuition Fee' },
  { id: 'lessonLevy', label: 'Lesson Levy (Termly)' },
  { id: 'ptaLevyOld', label: 'P.T.A Levy (Per Family)' },
  { id: 'extraCurriculum', label: 'Extra Curriculum Activities' },
  { id: 'developmentLevy', label: 'Development Levy' },
  { id: 'ptaLevyNew', label: 'P.T.A Levy (New Intake)' },
  { id: 'registrationForm', label: 'Registration Form' },  
  { id: 'schoolUniform', label: 'School Uniform (2 Pairs)' },
  { id: 'peOutfit', label: 'P.E Outfit' },
  { id: 'stockings', label: 'Stockings (2 Pairs)' },  
  { id: 'cardigan', label: 'Cardigan' },
  { id: 'idCard', label: 'I.D Card' },
  { id: 'assessmentBooklet', label: 'Assessment Booklet' },
  { id: 'endOfYearParty', label: 'End of Year Party' },
  { id: 'endOfSessionParty', label: 'End of Session Party' },
  { id: 'transportation', label: 'Transportation Fee' },
  { id: 'juniorWaec', label: 'Junior WAEC Fee' },
  { id: 'seniorWaec', label: 'Senior WAEC Fee' },
]

export default function FeeBreakdown() {
  return (
    <FeeBreakdownProvider>
      <FeeBreakdownContent />
    </FeeBreakdownProvider>
  )
}

function FeeBreakdownContent() {
  const {
    formData,
    balancePayments,
    showReceipt,
    receiptNumber,
    downloadFormat,
    validationErrors,
    isSaving,
    saveStatus,
    saveMessage,
    isEditMode,
    isModalOpen,
    modalReceipt,
    modalDownloadFormat,
    isModalDownloading,
    showDeleteConfirm,
    receiptToDelete,
    isDeleting,
    searchQuery,
    searchResults,
    isSearching,
    showSearchResults,
    searchError,
    initialFeeItems,
    grandTotal,
    balanceTotal,
    availableFeeItems,
    receiptRef,
    downloadContainerRef,
    modalDownloadRef,
    searchInputRef,
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
    setShowAddBalance,
    clearAllBalances,
    addBalancePayment,
    removeBalancePayment,
    setSelectedBalanceItem,
    setBalanceAmount,
    setBalanceDescription,
    setBalanceDate,
    setDownloadFormat,
    setModalDownloadFormat,
    setShowReceipt,
    selectedBalanceItem,
    balanceAmount,
    balanceDescription,
    balanceDate,
    showAddBalance
  } = useFeeBreakdown()

  return (
    <div className='space-y-4'>
      {/* Navigation Header */}
      <NavigationHeader />

      {/* Global Status Message */}
      {saveStatus && (
        <div className={`mb-4 p-3 rounded-lg ${
          saveStatus === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          <p className='text-sm font-medium'>{saveMessage}</p>
        </div>
      )}

      {/* Edit Mode Indicator */}
      {isEditMode && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
          <div className='flex items-center gap-2'>
            <Edit className='w-5 h-5 text-green-600' />
            <span className='text-sm font-medium text-green-700'>
              Editing Receipt: {receiptNumber}
            </span>
          </div>
          <Button
            size='sm'
            variant='outline'
            onClick={cancelEdit}
            className='text-gray-600 w-full sm:w-auto'
          >
            <X className='w-4 h-4 mr-1' />
            Cancel Edit
          </Button>
        </div>
      )}

      {/* Search Section */}
      <SearchSection
        searchQuery={searchQuery}
        isSearching={isSearching}
        searchResults={searchResults}
        showSearchResults={showSearchResults}
        searchError={searchError}
        searchInputRef={searchInputRef}
        onSearchInputChange={handleSearchInputChange}
        onSearchKeyPress={handleSearchKeyPress}
        onSearch={searchReceipts}
        onClearSearch={clearSearch}
        onEditReceipt={editReceipt}
        onOpenModal={openReceiptModal}
        onConfirmDelete={confirmDelete}
      />

      {/* Student Information Form */}
      <StudentInfoForm
        formData={formData}
        validationErrors={validationErrors}
        onInputChange={handleInputChange}
      />

      {/* Fee Breakdown Grid */}
      <FeeBreakdownGrid
        formData={formData}
        onInputChange={handleInputChange}
      />

      {/* Balance Payments Section */}
      <BalancePaymentsSection
        balancePayments={balancePayments}
        showAddBalance={showAddBalance}
        selectedBalanceItem={selectedBalanceItem}
        balanceAmount={balanceAmount}
        balanceDescription={balanceDescription}
        balanceDate={balanceDate}
        availableFeeItems={availableFeeItems}
        onShowAddBalance={setShowAddBalance}
        onSelectedBalanceItemChange={setSelectedBalanceItem}
        onBalanceAmountChange={setBalanceAmount}
        onBalanceDescriptionChange={setBalanceDescription}
        onBalanceDateChange={setBalanceDate}
        onAddBalancePayment={addBalancePayment}
        onRemoveBalancePayment={removeBalancePayment}
        onClearAllBalances={clearAllBalances}
      />

      {/* Total Amounts Card */}
      <TotalAmountsCard
        grandTotal={grandTotal}
        balanceTotal={balanceTotal}
        balancePayments={balancePayments}
      />

      {/* Action Buttons */}
      <ActionButtons
        isEditMode={isEditMode}
        isSaving={isSaving}
        onReset={handleReset}
        onGenerate={handleGenerateReceipt}
        onUpdate={updateReceipt}
      />

      {/* Receipt Preview */}
      <ReceiptPreview
        showReceipt={showReceipt}
        receiptRef={receiptRef}
        downloadContainerRef={downloadContainerRef}
        formData={formData}
        receiptNumber={receiptNumber}
        initialFeeItems={initialFeeItems}
        balancePayments={balancePayments}
        grandTotal={grandTotal}
        balanceTotal={balanceTotal}
        downloadFormat={downloadFormat}
        isSaving={isSaving}
        onDownload={handleDownload}
        onDownloadFormatChange={setDownloadFormat}
        onClosePreview={() => setShowReceipt(false)}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isModalOpen}
        receipt={modalReceipt}
        downloadFormat={modalDownloadFormat}
        isDownloading={isModalDownloading}
        modalDownloadRef={modalDownloadRef}
        onClose={closeModal}
        onDownload={handleModalDownload}
        onDownloadFormatChange={setModalDownloadFormat}
        onEdit={editReceipt}
        onDelete={confirmDelete}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        receipt={receiptToDelete}
        isDeleting={isDeleting}
        onCancel={cancelDelete}
        onConfirm={deleteReceipt}
      />
    </div>
  )
}
// ================ COMPONENT ENDS HERE ================


