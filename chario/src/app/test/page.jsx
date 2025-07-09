'use client'
import { useChario } from '@/hooks/use-chario';
import React from 'react'
import { useAccount } from 'wagmi';

function Page() {
    const { address } = useAccount();
    const { createCharity, loading } = useChario();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createCharity({
            owner: address,
            title: "Help Local School",
            description: "Raising funds for school supplies",
            target: "2.5", // 2.5 ETH
            deadline: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
            image: "https://avatars.mds.yandex.net/i?id=c906118a86bf971af7fcc440f8fb40f3c72c95a5-5473533-images-thumbs&n=13"
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Your form fields */}
            <button disabled={loading}>
                {loading ? 'Creating...' : 'Create Charity'}
            </button>
        </form>
    );
}

export default Page
