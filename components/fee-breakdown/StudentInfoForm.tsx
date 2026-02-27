// components/fee-breakdown/StudentInfoForm.tsx
// ================ COMPONENT STARTS HERE ================

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { gradeOptions, termOptions, FormData } from './index'

interface StudentInfoFormProps {
  formData: FormData
  validationErrors: Record<string, string>
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export default function StudentInfoForm({ 
  formData, 
  validationErrors, 
  onInputChange 
}: StudentInfoFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg font-bold'>Student Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <h1 className='text-sm mb-2'>Date</h1>
            <Input
              id='date'
              type='date'
              value={formData.date}
              onChange={onInputChange}
            />
          </div>
          <div>
            <h1 className='text-sm font-medium mb-2'>Pupil/Student Name</h1>
            <Input
              id='studentName'
              type='text'
              value={formData.studentName}
              onChange={onInputChange}
              placeholder='Enter student name'
              className={`placeholder:text-gray-400 ${validationErrors.studentName ? 'border-green-500' : ''}`}
            />
            {validationErrors.studentName && (
              <p className='text-green-500 text-xs mt-1'>{validationErrors.studentName}</p>
            )}
          </div>
            <div>
              <h1 className='text-sm font-medium mb-2'>Grade</h1>
              <Select
                id='grade'
                value={formData.grade}
                onChange={onInputChange}
                className={validationErrors.grade ? 'border-green-500' : ''}
              >
                <option value=''>Select Grade</option>
                {gradeOptions.map(grade => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </Select>
              {validationErrors.grade && (
                <p className='text-green-500 text-xs mt-1'>{validationErrors.grade}</p>
              )}
            </div>
            <div>
              <h1 className='text-sm font-medium mb-2'>Term</h1>
              <Select
                id='term'
                value={formData.term}
                onChange={onInputChange}
                className={validationErrors.term ? 'border-green-500' : ''}
              >
                <option value=''>Select Term</option>
                {termOptions.map(term => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </Select>
              {validationErrors.term && (
                <p className='text-green-500 text-xs mt-1'>{validationErrors.term}</p>
            )}
          </div>
          <div>
            <h1 className='text-sm font-medium mb-2'>Parent/Guardian Contact</h1>
            <Input
              id='admissionNumber'
              type='text'
              placeholder='Enter Parent/Guardian contact'
              className={`placeholder:text-gray-400 ${validationErrors.admissionNumber ? 'border-green-500' : ''}`}
              value={formData.admissionNumber}
              onChange={onInputChange}
            />
            {validationErrors.admissionNumber && (
              <p className='text-green-500 text-xs mt-1'>{validationErrors.admissionNumber}</p>
            )}
          </div>
          <div>
            <h1 className='text-sm font-medium mb-2'>Parent/Guardian Name</h1>
            <Input
              id='parentName'
              type='text'
              placeholder='Enter Parent name'
              className={`placeholder:text-gray-400 ${validationErrors.parentName ? 'border-green-500' : ''}`}
              value={formData.parentName}
              onChange={onInputChange}
            />
            {validationErrors.parentName && (
              <p className='text-green-500 text-xs mt-1'>{validationErrors.parentName}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
// ================ COMPONENT ENDS HERE ================
