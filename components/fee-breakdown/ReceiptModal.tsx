// components/fee-breakdown/ReceiptModal.tsx
// ================ COMPONENT STARTS HERE ================

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Logo from '@/public/celiaslogo.png'
import { X, Download, Edit, Trash2, RotateCcw } from 'lucide-react'
import { Receipt } from './index'

interface ReceiptModalProps {
  isOpen: boolean
  receipt: Receipt | null
  downloadFormat: string
  isDownloading: boolean
  modalDownloadRef: React.RefObject<HTMLDivElement | null>
  onClose: () => void
  onDownload: () => void
  onDownloadFormatChange: (format: string) => void
  onEdit: (receipt: Receipt) => void
  onDelete: (receipt: Receipt) => void
}

export default function ReceiptModal({
  isOpen,
  receipt,
  downloadFormat,
  isDownloading,
  modalDownloadRef,
  onClose,
  onDownload,
  onDownloadFormatChange,
  onEdit,
  onDelete
}: ReceiptModalProps) {
  if (!isOpen || !receipt) return null

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      {/* Backdrop */}
      <div 
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className='flex min-h-full items-center justify-center p-4'>
        <div className='relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
          {/* Modal Header */}
          <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg flex justify-between items-center z-10'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Receipt - {receipt.receipt_number}
            </h3>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-500 focus:outline-none'
            >
              <X className='w-6 h-6' />
            </button>
          </div>

          {/* Modal Body - Receipt Content */}
          <div className='p-6'>
            <div ref={modalDownloadRef} className='bg-white'>
              {/* School Header */}
              <div className='text-center mb-6 border-b pb-4'>
                <div className='flex justify-center mb-1'>
                <Image
                  src={Logo}
                  alt='Tela'
                  className='w-16 h-auto'
                  placeholder='blur'
                />
                </div>
                <h1 className='text-2xl font-bold text-gray-800'>
                  Celias Schools International Schools
                </h1>
                <p className='text-sm text-gray-600'>
                  7 Rumuadaolu Market Road, Port Harcourt
                </p>
                <p className='text-sm text-gray-600'>
                  Phone: 08037704397 | Email: Admin@celiasschools.org
                </p>
              </div>

              {/* Receipt Title */}
              <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6'>
                <h2 className='text-xl font-bold text-gray-800'>
                  OFFICIAL RECEIPT
                </h2>
                <div className='text-right'>
                  <p className='text-sm font-medium'>
                    Receipt No: <span className='font-bold'>{receipt.receipt_number}</span>
                  </p>
                  <p className='text-sm'>
                    Date:{' '}
                    {new Date(receipt.date).toLocaleDateString('en-KE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Student Details Grid */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg'>
                <div>
                  <p className='text-xs text-gray-500 uppercase'>Receipt Number</p>
                  <p className='font-semibold'>{receipt.receipt_number}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-500 uppercase'>Student Name</p>
                  <p className='font-semibold'>{receipt.student_name}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-500 uppercase'>Parent/Guardian Contact</p>
                  <p className='font-semibold'>{receipt.admission_number}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-500 uppercase'>Grade/Class</p>
                  <p className='font-semibold'>{receipt.grade}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-500 uppercase'>Term</p>
                  <p className='font-semibold'>{receipt.term}</p>
                </div>
                <div className='sm:col-span-2'>
                  <p className='text-xs text-gray-500 uppercase'>Parent/Guardian</p>
                  <p className='font-semibold'>{receipt.parent_name}</p>
                </div>
              </div>

              {/* Payment Details Table */}
              <div className='mb-6'>
                <h3 className='font-semibold mb-2 text-gray-700'>Payment Details:</h3>
                <div className='overflow-x-auto'>
                <table className='w-full border-collapse min-w-[520px]'>
                  <thead>
                    <tr className='bg-gray-100'>
                      <th className='text-left p-2 border'>Description</th>
                      <th className='text-right p-2 border'>Amount (₦)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Initial Fee Items */}
                    {receipt.fee_items && receipt.fee_items.map((item, index) => (
                      <tr key={`modal-initial-${index}`}>
                        <td className="p-2 border">{item.description}</td>
                        <td className="text-right p-2 border">₦{item.amount}</td>
                      </tr>
                    ))}
                    
                    {/* Grand Total Row */}
                    <tr className="bg-green-50 font-bold">
                      <td className="p-2 border text-lg">GRAND TOTAL</td>
                      <td className="text-right p-2 border text-lg text-green-600">
                        ₦{receipt.total_amount}
                      </td>
                    </tr>
                  </tbody>
                </table>
                </div>
              </div>

              {/* Balance Payments Section */}
              {receipt.balance_payments && receipt.balance_payments.length > 0 && (
                <div className='mb-6'>
                  <h3 className='font-semibold mb-2 text-gray-700'>Balance Payments (Separate):</h3>
                  <div className='overflow-x-auto'>
                  <table className='w-full border-collapse min-w-[520px]'>
                    <thead>
                      <tr className='bg-gray-100'>
                        <th className='text-left p-2 border'>Description</th>
                        <th className='text-right p-2 border'>Amount (₦)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receipt.balance_payments.map((payment, index) => (
                        <tr key={`modal-balance-${index}`} className="bg-green-50">
                          <td className="p-2 border">
                            <span className="flex items-center gap-1">
                              <RotateCcw className='w-3 h-3 text-green-600' />
                              {payment.description}
                            </span>
                          </td>
                          <td className="text-right p-2 border text-green-700">₦{payment.amount}</td>
                        </tr>
                      ))}
                      <tr className="bg-green-100 font-bold">
                        <td className="p-2 border">BALANCE PAYMENTS TOTAL</td>
                        <td className="text-right p-2 border text-green-700">₦{receipt.balance_total || 0}</td>
                      </tr>
                    </tbody>
                  </table>
                  </div>
                </div>
              )}

              {/* Footer Note */}
              <div className='text-center text-xs text-gray-500 mt-4'>
                <p>
                  This is a computer-generated receipt and is valid without a signature.
                </p>
                <p className='mt-1'>
                  Thank you for choosing Celias Schools
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className='sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-4 rounded-b-lg flex flex-col sm:flex-row sm:justify-end gap-3'>
            <div className='flex items-center gap-2 sm:mr-auto'>
              <label htmlFor='modalFormat' className='text-sm font-medium text-gray-700'>
                Download as:
              </label>
              <select
                id='modalFormat'
                value={downloadFormat}
                onChange={(e) => onDownloadFormatChange(e.target.value)}
                className='px-2 py-1 border border-gray-300 rounded-md text-sm bg-white'
              >
                <option value='pdf'>PDF</option>
                <option value='jpeg'>JPEG</option>
              </select>
            </div>
            <Button
              onClick={onDownload}
              className='bg-green-600 hover:bg-green-700 w-full sm:w-auto'
              disabled={isDownloading}
            >
              <Download className='w-4 h-4 mr-2' />
              {isDownloading ? 'Downloading...' : `Download ${downloadFormat.toUpperCase()}`}
            </Button>
            <Button
              variant='outline'
              className='text-green-600 border-green-200 hover:bg-green-50 w-full sm:w-auto'
              onClick={() => {
                onClose()
                onEdit(receipt)
              }}
            >
              <Edit className='w-4 h-4 mr-2' />
              Edit
            </Button>
            <Button
              variant='outline'
              className='text-green-600 border-green-200 hover:bg-green-50 w-full sm:w-auto'
              onClick={() => {
                onClose()
                onDelete(receipt)
              }}
            >
              <Trash2 className='w-4 h-4 mr-2' />
              Delete
            </Button>
            <Button
              onClick={onClose}
              variant='outline'
              className='w-full sm:w-auto'
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
// ================ COMPONENT ENDS HERE ================



