// components/fee-breakdown/NavigationHeader.tsx
// ================ COMPONENT STARTS HERE ================

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { FileText, Users, BarChart3, LogOut } from 'lucide-react'

export default function NavigationHeader() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      await supabase.auth.signOut()
    }

    document.cookie = 'tela_auth=; path=/; max-age=0; SameSite=Lax'
    router.push('/login')
    router.refresh()
  }

  return (
    <div className='bg-white rounded-lg shadow-sm p-4 mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
      <div className='flex items-start sm:items-center gap-3'>
        <div className='bg-green-100 p-2 rounded-lg'>
          <FileText className='w-6 h-6 text-green-600' />
        </div>
        <div>
          <h1 className='text-lg sm:text-xl font-bold text-gray-800'>Tela - Payment Management</h1>
          <p className='text-sm text-gray-500'>Create and manage payment receipts</p>
        </div>
      </div>
      <div className='flex flex-col sm:flex-row sm:items-center gap-2 w-full lg:w-auto'>
        <Link href='/outstanding-balances'>
          <Button className='bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 w-full sm:w-auto'>
            <Users className='w-4 h-4' />
            View Outstanding Balances
            <BarChart3 className='w-4 h-4 ml-1' />
          </Button>
        </Link>
        <Button
          type='button'
          variant='outline'
          className='border-green-200 text-green-700 hover:bg-green-50 w-full sm:w-auto'
          onClick={handleLogout}
        >
          <LogOut className='w-4 h-4 mr-2' />
          Log Out
        </Button>
      </div>
    </div>
  )
}
// ================ COMPONENT ENDS HERE ================



