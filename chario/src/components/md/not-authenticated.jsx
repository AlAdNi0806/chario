'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function NotAuthenticated() {
  return (
    <div className='h-full w-full flex flex-col items-center justify-center p-8 text-center'>
      <h1 className='font-bold text-2xl'>Not Authenticated</h1>
      <p className='text-muted-foreground text-sm mb-8'>You must be signed in to view this page.</p>
      <Link href='/signin'>
        <Button
          className={'cursor-pointer'}
        >
          Sign In
        </Button>
      </Link>
    </div>
  )
}

export default NotAuthenticated