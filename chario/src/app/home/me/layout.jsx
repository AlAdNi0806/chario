import NotAuthenticated from '@/components/md/not-authenticated';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import React from 'react'

async function Layout({ children }) {

    const sessionData = await auth.api.getSession({
        headers: await headers()
    });


    if (!sessionData?.session) {
        return (
            <NotAuthenticated />
        )
    }

    return (
        <>
            {children}
        </>
    )
}

export default Layout