import React from 'react'
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import AppSidebar from '@/components/md/app-sidebar'
import ConnectWalletButton from '@/components/md/ConnectWalletButton'

function Layout({children}) {
    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset className='h-screen overflow-hidden'>
                <div className='flex items-center justify-between w-full p-4 py-3 gap-4 border-b border-accent'>
                    <div className='flex items-center gap-4'>
                        <SidebarTrigger />
                        <p className='text-muted-foreground text-sm'>
                            Charities you can trust
                        </p>
                    </div>
                    <ConnectWalletButton 
                        showBalance={false}
                        accountStatus="address"
                        label="Connect"
                    />
                </div>
                <div className='h-full overflow-y-auto'>
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default Layout