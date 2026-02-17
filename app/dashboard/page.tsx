'use client'

import React from 'react'
import FeeBreakdown from '@/components/fee-breakdown'

export default function DashboardPage() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        <FeeBreakdown />
      </div>
    </div>
  )
}
