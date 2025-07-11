'use client'

import CharityCardMd from '@/components/md/charity-card-md';
import { maskId } from '@/lib/hashing';
import React, { useEffect, useState } from 'react'

function MyCharitiesPage({ charities: rawCharities }) {

  const [charities, setCharities] = useState([]);

  useEffect(() => {
    // Parse charities once and set the state
    if (rawCharities) {
      setCharities(JSON.parse(rawCharities));
      // console.log("Charities:", JSON.parse(rawCharities)); // Keep this for debugging if needed
    }
  }, [rawCharities]);

  return (
    <div className='w-full h-full p-8 gap-8 flex flex-col items-center relative overflow-x-hidden '>
      <p className='text-muted-foreground text-lg'>
        You have {charities?.length} total charities
      </p>
      <div className='max-w-[1200px] w-full flex flex-col justify-center mx-auto'>
        <div className='flex flex-wrap justify-center gap-6 mt-4'>
          {charities?.map(charity => (
            <CharityCard key={charity.id} charityId={charity.id} charity={charity} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default MyCharitiesPage

function CharityCard({ charityId, charity }) {

  // const handleDonate = async () => {
  //     await donateToCharity(charityId, "0.1");
  //     refetchAll(); // Refresh data after donation
  // };

  return (
    <CharityCardMd
      className='self-start'
      charity={{
        id: charityId,
        title: charity?.title,
        description: charity?.description,
        target: charity?.target || '0',
        amountCollected: charity?.amountCollected,
        image: charity?.image,
        link: `/home/me/charities/${charityId}`
      }}
    />
  );
}

