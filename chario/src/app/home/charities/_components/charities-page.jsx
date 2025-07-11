'use client'

import CharityCardMd from '@/components/md/charity-card-md';
import SearchBar from '@/components/md/search-bar';
import { useCharities, useCharity, useCharityStatus, useChario } from '@/hooks/use-chario';
import { createReconnectingEventSource } from '@/hooks/use-sse';
import { maskId } from '@/lib/hashing';
import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react'

function CharitiesPage({ charities: initialCharities }) {
    const [charities, setCharities] = useState(initialCharities);
    const [realtime, setRealtime] = useState(false);

    useEffect(() => {
        const sse = createReconnectingEventSource('http://localhost:3001/sse/new-charities', {
            onOpen: () => console.log('Connected to SSE'),
            onMessage: (e) => console.log('Message:', e.data),
            onError: (e) => console.error('Error:', e),
            onEvent: {
                'new-charity': (e) => {
                    const data = JSON.parse(e.data)
                    console.log('New charity event:', data.charity);
                    setCharities((prevCharities) => [data.charity, ...prevCharities])
                }
            },
            onStatusChange: (status) => setRealtime(status === 1 ? true : false)
        })

        return () => {
            sse.close()
        }
    }, [])

    return (
        <div className='w-full h-full p-8 gap-8 flex flex-col items-center relative overflow-x-hidden '>
            {/* <div className='absolute top-13 left-6  bg-red-500'>
                <div className='relative'>
                    <div
                        className={cn(
                            'absolute bg-black bg-opacity-50 z-10 h-2 w-2 rounded-full',
                            realtime ? 'bg-emerald-500' : 'bg-yellow-500'
                        )}
                    />
                    <div
                        className={cn(
                            // Base size for the animation (the max size it will reach)
                            'absolute bg-black bg-opacity-50 z-0 h-6 w-6 rounded-full',
                            // Apply the animation class
                            'animate-pulse-fade-out',
                            // Adjust initial positioning if needed due to h-4/w-4 base
                            '-top-2 -left-2', // This positioning might need slight adjustment based on your h-4/w-4
                            realtime ? 'bg-emerald-500' : 'bg-yellow-500'
                        )}
                    />
                </div>
            </div> */}
            <SearchBar />
            <div className='max-w-[1200px] w-full flex flex-col justify-center mx-auto'>
                <div className='flex gap-4 mb-6'>
                    <h2 className='text-muted-foreground'>Active Charities ({charities?.length} total)</h2>
                    <div className='relative mt-1'>
                        <div
                            className={cn(
                                'absolute bg-black bg-opacity-50 z-10 h-2 w-2 rounded-full',
                                realtime ? 'bg-emerald-500' : 'bg-yellow-500'
                            )}
                        />
                        <div
                            className={cn(
                                'absolute bg-black bg-opacity-50 z-0 h-6 w-6 rounded-full',
                                'animate-pulse-fade-out',
                                '-top-2 -left-2', // This positioning might need slight adjustment based on your h-4/w-4
                                realtime ? 'bg-emerald-500' : 'bg-yellow-500'
                            )}
                        />
                    </div>
                </div>
                {/* <div>
                    {isConnected ? "SSE Connected" : "Connecting..."}
                </div> */}
                <div className='flex flex-wrap justify-center gap-6 mt-4'>
                    {charities.map(charity => (
                        <CharityCard key={charity.id} charityId={charity.id} charity={charity} />
                    ))}
                </div>
            </div>
            {/* <div className='min-h-[400px]' /> */}
        </div>
    );
}

export default CharitiesPage


function CharityCard({ charityId, charity }) {
    // const { charity, donorContribution, isOwner, canRefund, refetchAll } = useCharity(charityId);
    const { donateToCharity, withdrawFunds, refundDonation, formatEther, parseEther } = useChario();
    const { statusText, statusColor, isActive } = useCharityStatus(charity?.status);

    // const handleDonate = async () => {
    //     await donateToCharity(charityId, "0.1");
    //     refetchAll(); // Refresh data after donation
    // };

    return (
        <CharityCardMd
            className='self-start'
            charity={{
                id: maskId(charityId),
                title: charity?.title,
                description: charity?.description,
                target: charity?.target || '0',
                amountCollected: charity?.amountCollected,
                image: charity?.image,
            }}
        />
    );
}

