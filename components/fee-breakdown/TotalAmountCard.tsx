// components/fee-breakdown/TotalAmountsCard.tsx
// ================ COMPONENT STARTS HERE ================

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { BalancePayment } from './index'

interface TotalAmountsCardProps {
  grandTotal: string
  balanceTotal: string
  balancePayments: BalancePayment[]
}

export default function TotalAmountsCard({ 
  grandTotal, 
  balanceTotal, 
  balancePayments 
}: TotalAmountsCardProps) {
  return (
    <Card>
      <CardContent className='p-6'>
        <div className='space-y-3'>
          <div className='flex justify-between items-center text-gray-600'>
            <p>Grand Total (Fee Breakdown):</p>
            <p className='font-bold text-lg text-green-600'>₦{grandTotal}</p>
          </div>
          {balancePayments.length > 0 && (
            <div className='flex justify-between items-center text-green-600 pt-2 border-t border-gray-200'>
              <p>Balance Payments Total (Separate):</p>
              <p className='font-bold text-lg'>₦{balanceTotal}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
// ================ COMPONENT ENDS HERE ================
