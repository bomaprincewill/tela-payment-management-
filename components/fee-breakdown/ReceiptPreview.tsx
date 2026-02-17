// components/fee-breakdown/ReceiptPreview.tsx
// ================ COMPONENT STARTS HERE ================

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Logo from '@/public/celiaslogo.png'
import { Download, RotateCcw } from 'lucide-react'
import { FormData, FeeItem, BalancePayment } from './index'

interface ReceiptPreviewProps {
  showReceipt: boolean
  receiptRef: React.RefObject<HTMLDivElement | null>
  downloadContainerRef: React.RefObject<HTMLDivElement | null>
  formData: FormData
  receiptNumber: string
  initialFeeItems: FeeItem[]
  balancePayments: BalancePayment[]
  grandTotal: string
  balanceTotal: string
  downloadFormat: string
  isSaving: boolean
  onDownload: () => void
  onDownloadFormatChange: (format: string) => void
  onClosePreview: () => void
}

export default function ReceiptPreview({
  showReceipt,
  receiptRef,
  downloadContainerRef,
  formData,
  receiptNumber,
  initialFeeItems,
  balancePayments,
  grandTotal,
  balanceTotal,
  downloadFormat,
  isSaving,
  onDownload,
  onDownloadFormatChange,
  onClosePreview
}: ReceiptPreviewProps) {
  if (!showReceipt) return null

  return (
    <Card className='print:shadow-none print:border-2 print:m-0'>
      <CardContent className='p-6'>
        {/* Download Container */}
        <div ref={downloadContainerRef} className='bg-white'>
          <div ref={receiptRef}>
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
                  Celias International Schools
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
                  Receipt No: <span className='font-bold'>{receiptNumber || 'RCP-PENDING'}</span>
                </p>
                <p className='text-sm'>
                  Date:{' '}
                  {new Date(formData.date).toLocaleDateString('en-KE', {
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
                <p className='text-xs text-gray-500 uppercase'>Student Name</p>
                <p className='font-semibold'>{formData.studentName || ''}</p>
              </div>
              <div>
                <p className='text-xs text-gray-500 uppercase'>Admission No.</p>
                <p className='font-semibold'>{formData.admissionNumber || ''}</p>
              </div>
              <div>
                <p className='text-xs text-gray-500 uppercase'>Grade/Class</p>
                <p className='font-semibold'>{formData.grade || ''}</p>
              </div>
              <div>
                <p className='text-xs text-gray-500 uppercase'>Term</p>
                <p className='font-semibold'>{formData.term || ''}</p>
              </div>
              <div className='sm:col-span-2'>
                <p className='text-xs text-gray-500 uppercase'>Parent/Guardian</p>
                <p className='font-semibold'>{formData.parentName || ''}</p>
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
                  {initialFeeItems.map((item) => (
                    <tr key={`initial-${item.id}`}>
                      <td className="p-2 border">{item.description}</td>
                      <td className="text-right p-2 border">₦{item.amount}</td>
                    </tr>
                  ))}
                  
                  {/* Grand Total Row */}
                  <tr className="bg-green-50 font-bold">
                    <td className="p-2 border text-lg">GRAND TOTAL</td>
                    <td className="text-right p-2 border text-lg text-green-600">
                      ₦{grandTotal}
                    </td>
                  </tr>
                </tbody>
              </table>
              </div>
            </div>

            {/* Balance Payments Section in Receipt */}
            {balancePayments.length > 0 && (
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
                    {balancePayments.map((item) => (
                      <tr key={`balance-${item.id}`} className="bg-green-50">
                        <td className="p-2 border">
                          <span className="flex items-center gap-1">
                            <RotateCcw className='w-3 h-3 text-green-600' />
                            {item.description}
                          </span>
                        </td>
                        <td className="text-right p-2 border text-green-700">₦{item.amount}</td>
                      </tr>
                    ))}
                    <tr className="bg-green-100 font-bold">
                      <td className="p-2 border">BALANCE PAYMENTS TOTAL</td>
                      <td className="text-right p-2 border text-green-700">₦{balanceTotal}</td>
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

        {/* Download Options */}
        <div className='mt-6 flex flex-col sm:flex-row sm:justify-end gap-3 print:hidden'>
          <div className='flex items-center gap-2'>
            <label htmlFor='format' className='text-sm font-medium'>Download as:</label>
            <select
              id='format'
              value={downloadFormat}
              onChange={(e) => onDownloadFormatChange(e.target.value)}
              className='px-2 py-1 border border-gray-300 rounded-md text-sm'
              disabled={isSaving}
            >
              <option value='pdf'>PDF</option>
              <option value='jpeg'>JPEG</option>
            </select>
          </div>
          <Button
            onClick={onDownload}
            className='bg-green-600 hover:bg-green-700 w-full sm:w-auto'
            disabled={isSaving}
          >
            <Download className='w-4 h-4 mr-2' />
            Download {downloadFormat.toUpperCase()}
          </Button>
          <Button 
            onClick={onClosePreview} 
            variant='outline'
            className='w-full sm:w-auto'
            disabled={isSaving}
          >
            Close Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
// ================ COMPONENT ENDS HERE ================



