// components/fee-breakdown/FeeBreakdownGrid.tsx
// ================ COMPONENT STARTS HERE ================

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { feeItemsConfig, FormData } from './index'

interface FeeBreakdownGridProps {
  formData: FormData
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function FeeBreakdownGrid({ formData, onInputChange }: FeeBreakdownGridProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg font-bold'>Fee Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {feeItemsConfig.map((item) => (
            <div key={item.id}>
              <h1 className='text-sm font-medium mb-2'>{item.label}</h1>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'>₦</span>
                <Input
                  id={item.id}
                  type='number'
                  step='0.01'
                  value={formData[item.id as keyof FormData] as string}
                  onChange={onInputChange}
                  placeholder='0.00'
                  className='pl-8'
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
// ================ COMPONENT ENDS HERE ================