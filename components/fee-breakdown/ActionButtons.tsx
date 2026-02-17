// components/fee-breakdown/ActionButtons.tsx
// ================ COMPONENT STARTS HERE ================

import React from 'react'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

interface ActionButtonsProps {
  isEditMode: boolean
  isSaving: boolean
  onReset: () => void
  onGenerate: () => void
  onUpdate: () => void
}

export default function ActionButtons({ 
  isEditMode, 
  isSaving, 
  onReset, 
  onGenerate, 
  onUpdate 
}: ActionButtonsProps) {
  return (
    <div className='flex justify-end mt-6 gap-4'>
      <Button onClick={onReset} variant='outline' disabled={isSaving}>
        Reset Form
      </Button>
      {isEditMode ? (
        <Button
          onClick={onUpdate}
          className='bg-green-600 hover:bg-green-700 text-white'
          disabled={isSaving}
        >
          <Save className='w-4 h-4 mr-2' />
          {isSaving ? 'Updating...' : 'Update Receipt'}
        </Button>
      ) : (
        <Button
          onClick={onGenerate}
          className='bg-green-600 hover:bg-green-700 text-white'
          disabled={isSaving}
        >
          {isSaving ? 'Saving to Supabase...' : 'Generate Receipt'}
        </Button>
      )}
    </div>
  )
}
// ================ COMPONENT ENDS HERE ================
