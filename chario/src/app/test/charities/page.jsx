// Basic usage
'use client'
import { useChario, useCharity, useCharityStatus, useCharities} from '@/hooks/use-chario';
import React from 'react'

function Page() {
    const { charities, isLoading, totalCharities } = useCharities(10);

    if (isLoading) return <div>Loading charities...</div>;

    return (
        <div>
            <h2>Active Charities ({totalCharities} total)</h2>
            {charities.map(charity => (
                <CharityCard key={charity.id} charityId={charity.id} />
            ))}
        </div>
    );
}

export default Page



function CharityCard({ charityId }) {
    const { charity, donorContribution, isOwner, canRefund, refetchAll } = useCharity(charityId);
    const { donateToCharity, withdrawFunds, refundDonation, formatEther, parseEther } = useChario();
    const { statusText, statusColor, isActive } = useCharityStatus(charity?.status);

    const handleDonate = async () => {
        await donateToCharity(charityId, "0.1");
        refetchAll(); // Refresh data after donation
    };

    return (
        <div className="charity-card">
            <h3>{charity?.title}</h3>
            <p>{charity?.description}</p>
            <p>Target: {formatEther(charity?.target || 0)} ETH</p>
            <p>Raised: {formatEther(charity?.amountCollected || 0)} ETH</p>
            <span className={`status ${statusColor}`}>{statusText}</span>

            {isActive && (
                <button onClick={handleDonate}>
                    Donate 0.1 ETH
                </button>
            )}

            {isOwner && charity?.status === 2 && (
                <button onClick={() => withdrawFunds(charityId)}>
                    Withdraw Funds
                </button>
            )}

            {canRefund && (charity?.status === 3 || charity?.status === 1) && (
                <button onClick={() => refundDonation(charityId)}>
                    Get Refund ({formatEther(donorContribution)} ETH)
                </button>
            )}
        </div>
    );
}