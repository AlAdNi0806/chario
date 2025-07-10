import React from 'react'
import CharityPage from './_components/charity-page'
import { unmaskId } from '@/lib/hashing'
import { prisma } from '@/db'
import NotFound from '@/components/md/not-found'

async function Page({ params }) {

  const hashedCharityId = (await params).charityId
  const charityId = unmaskId(hashedCharityId)

  if (!charityId) {
    return (
      <NotFound title='Invalid charity ID' description='This charity does not exist' />
    )
  }

  const charity = await prisma.charity.findFirst({
    where: { id: charityId.toString() },
    include: {
      owner: true,
      donations: {
        include: {
          donorUser: true,
          donorAnonymousUser: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!charity) {
    return (
      <NotFound title='Charity not found' description='This charity does not exist' />
    )
  }

  return (
    <CharityPage
      charity={JSON.stringify(charity)}
    />
  )
}

export default Page