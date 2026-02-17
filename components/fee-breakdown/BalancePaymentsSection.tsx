// components/fee-breakdown/BalancePaymentsSection.tsx
// ================ COMPONENT STARTS HERE ================

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RotateCcw, PlusCircle, MinusCircle, X } from 'lucide-react'
import { BalancePayment } from './index'

interface BalancePaymentsSectionProps {
  balancePayments: BalancePayment[]
  showAddBalance: boolean
  selectedBalanceItem: string
  balanceAmount: string
  balanceDescription: string
  balanceDate: string
  availableFeeItems: { id: string; label: string }[]
  onShowAddBalance: (show: boolean) => void
  onSelectedBalanceItemChange: (value: string) => void
  onBalanceAmountChange: (value: string) => void
  onBalanceDescriptionChange: (value: string) => void
  onBalanceDateChange: (value: string) => void
  onAddBalancePayment: () => void
  onRemoveBalancePayment: (id: string) => void
  onClearAllBalances: () => void
}

export default function BalancePaymentsSection({
  balancePayments,
  showAddBalance,
  selectedBalanceItem,
  balanceAmount,
  balanceDescription,
  balanceDate,
  availableFeeItems,
  onShowAddBalance,
  onSelectedBalanceItemChange,
  onBalanceAmountChange,
  onBalanceDescriptionChange,
  onBalanceDateChange,
  onAddBalancePayment,
  onRemoveBalancePayment,
  onClearAllBalances
}: BalancePaymentsSectionProps) {
  return (
    <Card className='border-2 border-green-200 bg-green-50/50'>
      <CardHeader>
        <CardTitle className='text-lg font-bold flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <RotateCcw className='w-5 h-5 text-green-600' />
            Balance Payments
            <span className='text-sm font-normal text-gray-500 ml-2'>
              (Separate from grand total - for tracking only)
            </span>
          </div>
          <div className='flex gap-2'>
            <Button
              size='sm'
              variant='outline'
              className='text-green-600 border-green-300 hover:bg-green-100'
              onClick={() => onShowAddBalance(true)}
            >
              <PlusCircle className='w-4 h-4 mr-1' />
              Add Balance Payment
            </Button>
            {balancePayments.length > 0 && (
              <Button
                size='sm'
                variant='outline'
                className='text-green-600 border-green-300 hover:bg-green-50'
                onClick={onClearAllBalances}
              >
                <MinusCircle className='w-4 h-4 mr-1' />
                Clear All
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showAddBalance && (
          <div className='mb-6 p-4 bg-white rounded-lg border-2 border-green-200'>
            <h3 className='font-medium mb-3 text-green-800'>Add New Balance Payment</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium mb-2 block'>Select Fee Item</label>
                <select
                  value={selectedBalanceItem}
                  onChange={(e) => onSelectedBalanceItemChange(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                >
                  <option value=''>Select an item...</option>
                  {availableFeeItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='text-sm font-medium mb-2 block'>Amount (₦)</label>
                <div className='relative'>
                  <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'>₦</span>
                  <Input
                    type='number'
                    step='0.01'
                    value={balanceAmount}
                    onChange={(e) => onBalanceAmountChange(e.target.value)}
                    placeholder='0.00'
                    className='pl-8'
                  />
                </div>
              </div>
              <div>
                <label className='text-sm font-medium mb-2 block'>Description</label>
                <Input
                  type='text'
                  value={balanceDescription}
                  onChange={(e) => onBalanceDescriptionChange(e.target.value)}
                  placeholder='Enter description (optional)'
                />
              </div>
              <div>
                <label className='text-sm font-medium mb-2 block'>Date</label>
                <Input
                  type='date'
                  value={balanceDate}
                  onChange={(e) => onBalanceDateChange(e.target.value)}
                />
              </div>
            </div>
            <div className='flex justify-end gap-2 mt-4'>
              <Button
                size='sm'
                variant='outline'
                onClick={() => onShowAddBalance(false)}
              >
                Cancel
              </Button>
              <Button
                size='sm'
                className='bg-green-600 hover:bg-green-700 text-white'
                onClick={onAddBalancePayment}
              >
                Add Payment
              </Button>
            </div>
          </div>
        )}

        {balancePayments.length > 0 ? (
          <div className='space-y-2'>
            <p className='text-sm font-medium text-gray-600'>
              Balance Payments Added (Not included in grand total):
            </p>
            {balancePayments.map((item) => (
              <div
                key={item.id}
                className='flex items-center justify-between bg-white p-3 rounded-lg border border-green-200 hover:shadow-sm'
              >
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <RotateCcw className='w-4 h-4 text-green-600' />
                    <span className='font-medium'>{item.itemName}</span>
                  </div>
                  <div className='text-sm text-gray-600 mt-1'>
                    {item.description} - ₦{item.amount} on {new Date(item.date).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-green-600 hover:text-green-700 hover:bg-green-50'
                  onClick={() => onRemoveBalancePayment(item.id)}
                >
                  <X className='w-4 h-4' />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-6 text-gray-500'>
            <p>No balance payments added yet.</p>
            <p className='text-sm mt-1'>
              Click &quot;Add Balance Payment&quot; to add balance payments for tracking.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
// ================ COMPONENT ENDS HERE ================

