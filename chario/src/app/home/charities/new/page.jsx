import React from 'react'
import CreateCharityPage from './_components/create-charity-page'
import NotAuthenticated from '@/components/md/not-authenticated';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

async function Page() {

  const sessionData = await auth.api.getSession({
    headers: await headers()
  });

  if (!sessionData?.session || sessionData?.user?.email?.startsWith('temp-')) {
    return <NotAuthenticated />
  }

  return (
    <>
      <CreateCharityPage />
    </>
  )
}

export default Page