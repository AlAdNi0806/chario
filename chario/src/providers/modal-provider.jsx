'use client'

import React, { useEffect, useState } from 'react'
import DonationActionModal from '@/components/lg/modals/donation-action-modal'


const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return null
    }

    return (
        <>
            <DonationActionModal />
        </>
    )
}

export default ModalProvider