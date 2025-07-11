'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { authClient, signOut, useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

function NotAuthenticated() {
  const router = useRouter()
  const sessionData = useSession();
  return (
    <div className='h-full w-full flex flex-col items-center justify-center p-8 text-center'>
      <h1 className='font-bold text-2xl'>Not Authorized</h1>
      <p className='text-muted-foreground text-sm mb-8'>You must create a valid account to view this page.</p>
      <Button
        className={'cursor-pointer'}
        onClick={async () => {
          router.push('/signin')	
          await signOut({
            fetchOptions: {
              onSuccess: () => {
                // router.push("/signin")
                router.push('/signin')
                // toast.success('You have been logged out')
              }
            }
          })
        }}
      >
        Sign In
      </Button>
    </div >
  )
}

export default NotAuthenticated