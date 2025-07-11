import { prisma } from '@/db'
import { useSession } from '@/lib/auth-client'
import React from 'react'

function Page() {

  const {data} = useSession()

  const charities = prisma.charity.findMany({
    where: {
      owner: {
        id: data?.user?.id
      }
    }
  })


  return (
    <div>Page</div>
  )
}

export default Page