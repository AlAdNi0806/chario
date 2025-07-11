import { prisma } from '@/db'
import { auth } from '@/lib/auth'
import { useSession } from '@/lib/auth-client'
import React from 'react'
import MyCharitiesPage from './_components/my-charities-page';
import { headers } from 'next/headers';

async function Page() {

  const { sessionData } = await auth.api.getSession({
    headers: await headers()
  });

  const charities = await prisma.charity.findMany({
    where: {
      owner: {
        id: sessionData?.user?.id
      }
    }
  })


  return (
    <MyCharitiesPage
      charities={JSON.stringify(charities)}
    />
  )
}

export default Page