import { prisma } from '@/db'
import React from 'react'
import MyDonationsPage from './_components/my-donations-page'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers';

async function Page() {

  const sessionData = await auth.api.getSession({
    headers: await headers()
  });

  const donations = await prisma.donation.findMany({
    where: {
      donorUserId: sessionData?.user?.id
    },
    include: {
      charity: true
    }
  })

  const user = await prisma.user.findFirst({
    where: {
      id: sessionData?.user?.id
    }
  })

  return (
    <MyDonationsPage
      donations={JSON.stringify(donations)}
      user={JSON.stringify(user)}
    />
  )
}

export default Page