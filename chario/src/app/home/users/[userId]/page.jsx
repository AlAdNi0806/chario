import React from 'react'
import UserPage from './_components/user-page'
import { prisma } from '@/db'
import NotFound from '@/components/md/not-found'

async function Page({ params }) {

  const userId = (await params).userId

  const user = await prisma.user.findFirst({
    where: {
      id: userId.toString()
    },
    include: {
      Charities: {
        orderBy: {
          createdAt: 'desc'
        }
      },
      Donations: {
        include: {
          charity: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!user) {
    return (
      <NotFound title='User not found' description='This user does not exist' />
    )
  }

  return (
    <UserPage
      user={JSON.stringify(user)}
    />
  )
}

export default Page