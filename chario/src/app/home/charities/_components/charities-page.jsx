'use client'

import CharityCardMd from '@/components/md/charity-card-md';
import { useCharities, useCharity, useCharityStatus, useChario } from '@/hooks/use-chario';
import React from 'react'

function CharitiesPage() {
    const { charities, isLoading, totalCharities } = useCharities(10);

    if (isLoading) return <div>Loading charities...</div>;

    return (
        <div className='w-full h-full p-8 flex '>
            <div className='max-w-[1200px] '>
                <h2>Active Charities ({totalCharities} total)</h2>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    {charities.map(charity => (
                        <CharityCard key={charity.id} charityId={charity.id} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CharitiesPage


function CharityCard({ charityId }) {
    const { charity, donorContribution, isOwner, canRefund, refetchAll } = useCharity(charityId);
    const { donateToCharity, withdrawFunds, refundDonation, formatEther, parseEther } = useChario();
    const { statusText, statusColor, isActive } = useCharityStatus(charity?.status);

    const handleDonate = async () => {
        await donateToCharity(charityId, "0.1");
        refetchAll(); // Refresh data after donation
    };

    return (
        <CharityCardMd
            charity={{
                title: charity?.title,
                description: charity?.description,
                target: formatEther(charity?.target || 0),
                amountCollected: formatEther(charity?.amountCollected || 0),
                image: charity?.image,
            }}
        />
    );
}