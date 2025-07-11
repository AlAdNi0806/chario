import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import React from 'react'
import MyCharityPage from './_components/my-chary-page';

async function Page({ params }) {

    const charityId = (await params).charityId
    const { sessionData } = await auth.api.getSession({
        headers: await headers()
    });

    const charity = await prisma.charity.findFirst({
        where: {
            id: charityId.toString(),
            ownerId: sessionData?.user?.id
        }
    })

    if (!charity) {
        return (
            <NotFound title='Charity not found' description='This charity does not exist or you do not own it' />
        )
    }


    return (
        <MyCharityPage
            charity={JSON.stringify(charity)}
        />
    )
}

export default Page