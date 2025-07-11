'use client'

import { DonationsTable } from '@/components/md/donation-table';
import { DonationCharts } from '@/components/md/donations-chart';
import React, { useEffect, useState } from 'react';

function MyDonationsPage({ donations: rawDonations, user: rawUser }) {
  const [donations, setDonations] = useState();
  const [user, setUser] = useState();

  useEffect(() => {
    // Parse donations once and set the state
    if (rawDonations) {
      setDonations(JSON.parse(rawDonations));
      // console.log("Donations:", JSON.parse(rawDonations)); // Keep this for debugging if needed
    }
    if (rawUser) {
      setUser(JSON.parse(rawUser));
      // console.log("User:", JSON.parse(rawUser)); // Keep this for debugging if needed
    }
  }, [rawDonations]);

  return (
    <div className='p-2 md:p-6 lg:p-8 pt-10'>
      <div className='mb-6'>
        <div className='text-muted-foreground text-lg cursor-pointer'>
          <span className='text-accent-foreground font-semibold'>Total amount donated:</span> <span className='text-emerald-400 ml-3'>${user?.amountSentInDollars}</span>
        </div>
        <div className='text-muted-foreground text-lg cursor-pointer'>
          <span className='text-accent-foreground font-semibold'>Total donations:</span> <span className='ml-2 text-primary'>{donations?.length}</span>
        </div>
      </div>
      {donations?.length > 0 && donations ? (
        <>
          <DonationCharts
            donations={donations}
          />
          <div className="mt-8"> {/* Add some margin above the table */}
            <DonationsTable
              donations={donations}
            />
          </div>
        </>
      ) : (
        <p className="text-center text-muted-foreground">No donations to display yet.</p>
      )}
    </div>
  );
}

export default MyDonationsPage;