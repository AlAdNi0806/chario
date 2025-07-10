'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChario } from '@/hooks/use-chario';
import { createReconnectingEventSource } from '@/hooks/use-sse';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { HandCoinsIcon, Loader2Icon } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { format } from 'date-fns'
import Link from 'next/link';

function CharityPage({ charity: rawCharity }) {
  const { data: userData } = useSession();
  const [charity, setCharity] = useState();
  const { donateToCharity } = useChario();
  const [realtime, setRealtime] = useState(false);
  const [donations, setDonations] = useState([]);
  const [amountToDonate, setAmountToDonate] = useState();
  const [isDonating, setIsDonating] = useState(false);

  useEffect(() => {
    const newCharity = JSON.parse(rawCharity)
    setCharity(newCharity)
    setDonations(newCharity.donations)
    const sse = createReconnectingEventSource(`http://localhost:3001/sse/charities/${newCharity.id}/donations`, {
      onOpen: () => console.log('Connected to SSE'),
      onMessage: (e) => console.log('Message:', e.data),
      onError: (e) => console.error('Error:', e),
      onEvent: {
        'new-donation': (e) => {
          const data = JSON.parse(e.data)
          console.log('New charity event:', data.donation);
          setDonations((prevDonations) => [data.donation, ...prevDonations])
        }
      },
      onStatusChange: (status) => setRealtime(status === 1 ? true : false)
    })

    return () => {
      sse.close()
    }

  }, [rawCharity])

  async function onDonate() {
    if (!amountToDonate || isNaN(amountToDonate) || amountToDonate <= 0) {
      toast.error('Invalid amount');
      return;
    }
    const result = await donateToCharity(charity.id, amountToDonate, userData.user.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Donation successful');
    }
  }

  return (
    <div className='p-8 pt-10'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <div className='flex flex-col'>
          <div className="relative w-full h-80 rounded-xl overflow-hidden ring ring-border mb-4">
            {charity?.image && (<Image
              src={charity?.image}
              alt={charity?.title}
              fill
              className="object-cover"
              style={{ objectFit: 'cover' }}
            />)}
          </div>
          <h2 className='text-2xl font-bold mb-5'>
            {charity?.title}
          </h2>
          <div className='flex flex-row gap-4 mb-3'>
            <input
              className={cn(
                'outline-none ring ring-input rounded-md px-2',
                isDonating && 'opacity-75'
              )}
              type="number"
              placeholder='0.00'
              value={amountToDonate}
              onChange={(e) => setAmountToDonate(e.target.value)}
              disabled={isDonating}
            />
            <Button
              className='w-max cursor-pointer h-8'
              disabled={isDonating}
              onClick={onDonate}
            >
              {isDonating ? (
                <Loader2Icon className='animate-spin' />
              ) : (
                'Donate'
              )}
            </Button>
          </div>
          <p className='text-muted-foreground text-sm mb-8'>
            {charity?.description}
          </p>
        </div>
        <Donations
          donations={donations}
          realtime={realtime}
        />
      </div>
    </div>
  )
}

export default CharityPage

function Donations({ donations, realtime }) {
  return (
    <div className='flex flex-col gap-1 bg-card rounded-3xl p-4 py-3 ring-1 ring-card-foreground/10 border-4 border-card/40 h-max'>
      <div className='flex flex-row justify-between items-center '>
        <h2 className='text-xl font-semibold mb-4'>
          Donations
        </h2>
        <RealtimeIndicator
          realtime={realtime}
          className='-top-4 right-3'
        />
      </div>
      <div className='ring ring-input rounded-md'>
        {donations?.length > 0 ? (
          <div className='flex flex-col '>
            {donations.map((donation, index) => (
              <Donation key={donation.id} donation={donation} isLastItem={donations.length - 1 === index} />
            ))}
          </div>
        ) : (
          <div className='flex flex-col justify-center items-center py-4'>
            <HandCoinsIcon size={18} className='text-primary mb-1' />
            <p className='text-muted-foreground text-sm'>
              No donations yet
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function Donation({ donation, isLastItem }) {
  return (
    <div className={cn('flex items-center justify-between gap-2 py-3 pr-4 px-2', !isLastItem && 'border-b border-accent')}>
      <div className='flex gap-2 items-center'>
        <SenderAvatar isAnonymousUser={!!donation.donorAnonymousUser} user={donation.donorUser || donation.donorAnonymousUser} />
        <div >
          <Link
            href={`/home/charities/${donation.charityId}`}
          >
            <p className='text-md'>
              {`${donation.senderWallet.substring(0, 12)}...${donation.senderWallet.substring(34)}`}
              {/* {donation.senderWallet} */}
            </p>
          </Link>
          <p className='text-xs text-muted-foreground'>
            {format(donation.createdAt, 'dd.MM.yy HH:mm')}
          </p>
        </div>
      </div>
      <p className='text-emerald-300'>
        {donation.amountEth} ETH
      </p>
    </div>
  )
}

function SenderAvatar({ user, isAnonymousUser }) {
  console.log("SenderAvatar:", user)
  return (
    <div className='w-10 h-10 rounded-full overflow-hidden bg-accent flex items-center justify-center'>
      {isAnonymousUser ? (
        <div className='w-full h-full rounded-full bg-muted-foreground flex items-center justify-center'>
          <UserIcon size={18} className='text-primary rotate-180' />
        </div>
      ) : (
        <img src={user?.image} alt={'user'} className='w-full h-full object-cover' />
      )}
    </div>
  )
}

function RealtimeIndicator({ realtime, className }) {
  return (
    <div className={cn('relative', className)}>
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
  )
}