// components/fee-breakdown/DeleteConfirmationModal.tsx
// ================ COMPONENT STARTS HERE ================

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { Receipt } from './index'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  receipt: Receipt | null
  isDeleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

export default function DeleteConfirmationModal({
  isOpen,
  receipt,
  isDeleting,
  onCancel,
  onConfirm
}: DeleteConfirmationModalProps) {
  if (!isOpen || !receipt) return null

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      {/* Backdrop */}
      <div 
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
        onClick={onCancel}
      />
      
      {/* Confirmation Modal */}
      <div className='flex min-h-full items-center justify-center p-4'>
        <div className='relative bg-white rounded-lg shadow-xl max-w-md w-full'>
          <div className='p-6'>
            <div className='flex items-center justify-center mb-4 text-green-600'>
              <AlertTriangle className='w-12 h-12' />
            </div>
            <h3 className='text-lg font-semibold text-center text-gray-900 mb-2'>
              Delete Receipt
            </h3>
            <p className='text-sm text-center text-gray-500 mb-6'>
              Are you sure you want to delete this receipt for{' '}
              <span className='font-semibold'>{receipt.student_name}</span>?
              <br />
              Receipt Number: <span className='font-semibold'>{receipt.receipt_number}</span>
              <br />
              This action cannot be undone.
            </p>
            <div className='flex justify-center gap-3'>
              <Button
                onClick={onCancel}
                variant='outline'
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                className='bg-green-600 hover:bg-green-700 text-white'
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Receipt'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
// ================ COMPONENT ENDS HERE ================
