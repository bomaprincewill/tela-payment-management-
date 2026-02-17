// components/fee-breakdown/SearchSection.tsx
// ================ COMPONENT STARTS HERE ================

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, User, Calendar, Hash, FileText, CreditCard, Eye, Edit, Trash2 } from 'lucide-react'
import { Receipt } from './index'

interface SearchSectionProps {
  searchQuery: string
  isSearching: boolean
  searchResults: Receipt[]
  showSearchResults: boolean
  searchError: string
  searchInputRef: React.RefObject<HTMLInputElement | null>
  onSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSearchKeyPress: (e: React.KeyboardEvent) => void
  onSearch: () => void
  onClearSearch: () => void
  onEditReceipt: (receipt: Receipt) => void
  onOpenModal: (receipt: Receipt) => void
  onConfirmDelete: (receipt: Receipt) => void
}

export default function SearchSection({
  searchQuery,
  isSearching,
  searchResults,
  showSearchResults,
  searchError,
  searchInputRef,
  onSearchInputChange,
  onSearchKeyPress,
  onSearch,
  onClearSearch,
  onEditReceipt,
  onOpenModal,
  onConfirmDelete
}: SearchSectionProps) {
  return (
    <Card className='border-2 border-green-100 bg-green-50/50'>
      <CardHeader>
        <CardTitle className='text-lg font-bold flex items-center gap-2'>
          <Search className='w-5 h-5' />
          Search Previous Receipts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col md:flex-row gap-4'>
          <div className='flex-1 relative'>
            <Input
              ref={searchInputRef}
              type='text'
              placeholder='Enter student name to search...'
              value={searchQuery}
              onChange={onSearchInputChange}
              onKeyPress={onSearchKeyPress}
              className='pr-10'
            />
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
              >
                <X className='w-4 h-4' />
              </button>
            )}
          </div>
          <Button
            onClick={onSearch}
            disabled={isSearching}
            className='bg-green-600 hover:bg-green-700 min-w-[120px] w-full md:w-auto'
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Search Results */}
        {showSearchResults && (
          <div className='mt-4'>
            {searchResults.length > 0 ? (
              <div className='space-y-2'>
                <p className='text-sm font-medium text-gray-600'>
                  Found {searchResults.length} receipt(s):
                </p>
                <div className='grid gap-2 max-h-96 overflow-y-auto pr-2'>
                  {searchResults.map((receipt) => (
                    <div
                      key={receipt.id}
                      className='bg-white p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all'
                    >
                      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            <User className='w-4 h-4 text-green-500' />
                            <span className='font-semibold'>{receipt.student_name}</span>
                            <span className='text-sm text-gray-500'>({receipt.admission_number})</span>
                            <span className='text-xs bg-gray-100 px-2 py-1 rounded-full'>
                              {receipt.receipt_number}
                            </span>
                          </div>
                          <div className='grid grid-cols-2 md:grid-cols-4 gap-2 text-sm'>
                            <div className='flex items-center gap-1 text-gray-600'>
                              <Calendar className='w-3 h-3' />
                              {new Date(receipt.date).toLocaleDateString()}
                            </div>
                            <div className='flex items-center gap-1 text-gray-600'>
                              <Hash className='w-3 h-3' />
                              {receipt.grade}
                            </div>
                            <div className='flex items-center gap-1 text-gray-600'>
                              <FileText className='w-3 h-3' />
                              {receipt.term}
                            </div>
                            <div className='flex items-center gap-1 text-gray-600'>
                              <CreditCard className='w-3 h-3' />
                              ₦{receipt.total_amount}
                            </div>
                          </div>
                        </div>
                        <div className='flex flex-wrap gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            className='text-green-600 border-green-200 hover:bg-green-50'
                            onClick={() => onOpenModal(receipt)}
                            title='View Receipt'
                          >
                            <Eye className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            className='text-green-600 border-green-200 hover:bg-green-50'
                            onClick={() => onEditReceipt(receipt)}
                            title='Edit Receipt'
                          >
                            <Edit className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            className='text-green-600 border-green-200 hover:bg-green-50'
                            onClick={() => onConfirmDelete(receipt)}
                            title='Delete Receipt'
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              searchError && (
                <div className='text-center py-4 text-gray-500 bg-white rounded-lg border border-gray-200'>
                  <p>{searchError}</p>
                </div>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
// ================ COMPONENT ENDS HERE ================

