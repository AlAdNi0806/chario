import React from 'react'
import CharitiesPage from './_components/charities-page'
import { prisma } from '@/db'

async function Page() {

  const charities = await prisma.charity.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { owner: true }
  })

  const charitiesForClient = charities.map(charity => ({
    ...charity,
    target: charity.target?.toString(),
    amountCollected: charity.amountCollected.toString(),
    // If owner also has Decimal fields, convert them here as well
    // For example:
    // owner: {
    //   ...charity.owner,
    //   someDecimalField: charity.owner.someDecimalField.toString(),
    // }
  }));

  return (
    <>
      <CharitiesPage
        charities={charitiesForClient}
      />
    </>
  )
}

export default Page