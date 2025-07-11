import { prisma } from '@/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import React from 'react'
import ProfilePage from './_components/profile-page';

async function Page() {
    const sessionData = await auth.api.getSession({
        headers: await headers()
    });

    const user = await prisma.user.findFirst({
        where: {
            id: sessionData?.user?.id
        }
    })

    return (
        <ProfilePage
            user={JSON.stringify(user)}
        />
    )
}

export default Page