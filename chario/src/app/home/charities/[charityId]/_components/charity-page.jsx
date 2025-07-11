'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChario } from '@/hooks/use-chario';
import { createReconnectingEventSource } from '@/hooks/use-sse';
import { authClient, useSession } from '@/lib/auth-client';
import { addEthAmounts, cn, sleep } from '@/lib/utils';
import { CheckIcon, HandCoinsIcon, Loader2Icon, QrCodeIcon, UserIcon } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { format } from 'date-fns'
import Link from 'next/link';
import { FaQuestion } from 'react-icons/fa';
import { Progress } from '@/components/ui/progress';
import { useModal } from '@/hooks/use-modal-store';

function CharityPage({ charity: rawCharity }) {
  const { data: userData } = useSession();
  const [charity, setCharity] = useState();
  const { donateToCharity } = useChario();
  const [realtime, setRealtime] = useState(false);
  const [donations, setDonations] = useState([]);
  const [amountToDonate, setAmountToDonate] = useState();
  const [isDonating, setIsDonating] = useState(false);
  const [totalCollected, setTotalCollected] = useState(0);

  useEffect(() => {
    const newCharity = JSON.parse(rawCharity)

    setCharity(newCharity)
    setDonations(newCharity.donations)
    setTotalCollected(newCharity.amountCollected)

    const sse = createReconnectingEventSource(`http://localhost:3001/sse/charities/${newCharity.id}/donations`, {

      onOpen: () => console.log('Connected to SSE'),

      onMessage: (e) => console.log('Message:', e.data),

      onError: (e) => console.error('Error:', e),

      onEvent: {
        'new-donation': (e) => {
          const data = JSON.parse(e.data)
          console.log('New charity event:', data.donation);

          setDonations((prevDonations) => [data.donation, ...prevDonations])
          setTotalCollected(prev => {
            const amountFloat = data.donation.amountEth || 0;
            const total = addEthAmounts(prev, amountFloat);
            return total;
          });
        }
      },
      onStatusChange: (status) => setRealtime(status === 1 ? true : false)
    })

    return () => {
      sse.close()
    }

  }, [rawCharity])

  async function onDonate() {
    setIsDonating(true);
    try {
      if (!amountToDonate || isNaN(amountToDonate) || amountToDonate <= 0) {
        toast.error('Invalid amount');
        return;
      }
      let userId = userData?.user?.id;
      if (userId === null || userId === "" || userId === undefined) {
        const data = await authClient.signIn.anonymous()
        userId = data.data.user.id;
      }
      const result = await donateToCharity(charity.id, amountToDonate, userId);
      await sleep(1000)
      console.log("Donation result:", result)
      if (result?.error && result?.walletError) {
        toast.error(result.error);
      }
    } catch (error) {
      console.log(error)
      setIsDonating(false);
      toast.error("Something went wrong");
    } finally {
      setIsDonating(false);
    }
  }

  return (
    <div className='p-2 md:p-6 lg:p-8 pt-10'>
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
          <div className='flex justify-between items-center'>
            <h2 className='text-2xl font-bold mb-5 line-clamp-2'>
              {charity?.title}
            </h2>
            <div className='flex gap-2 items-center -mt-2 text-lg font-semibold'>
              {charity?.owner?.name}
              {charity?.owner && (<Avatar
                isAnonymousUser={false}
                user={charity?.owner}
              />)}
            </div>
          </div>
          <div className='flex flex-row gap-4 mb-3'>
            <input
              className={cn(
                'outline-none ring ring-input rounded-md px-2',
                isDonating && 'opacity-75'
              )}
              type="number"
              placeholder='0.00'
              step={0.001}
              value={amountToDonate}
              onChange={(e) => setAmountToDonate(e.target.value)}
              disabled={isDonating}
            />
            <Button
              className='w-max cursor-pointer '
              disabled={isDonating}
              onClick={onDonate}
            >
              {isDonating ? (
                <Loader2Icon className='animate-spin' />
              ) : (
                'Donate'
              )}
            </Button>
            {/* <Button
            >
              <QrCodeIcon />
            </Button> */}
          </div>
          <p>
            {charity?.ownerWallet}
          </p>
          <p className='text-muted-foreground text-sm mb-8'>
            {charity?.description}
          </p>
        </div>
        <div>
          <Donations
            donations={donations}
            realtime={realtime}
            totalCollected={totalCollected}
          />
          {(charity?.target !== '0' && charity?.target) && (
            <div className="flex flex-col gap-1 mt-6">
              <Progress
                value={(totalCollected / charity.target) * 100}
                className='h-2 bg-zinc-700'
              />
              <div className='flex justify-between text-xs'>
                <span className='text-zinc-400'>Target</span>
                <span className='text-primary font-sm'>
                  {charity.target} ETH
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CharityPage

function Donations({ donations, realtime, totalCollected }) {
  return (
    <div className='flex flex-col gap-1 bg-card rounded-3xl p-4 py-3 ring-1 ring-card-foreground/10 border-4 border-card/40 h-max'>
      <div className='flex flex-row justify-between items-center '>
        <div className='flex items-center'>
          <h2 className='text-xl font-semibold mb-4'>
            Donations - <span className='text-emerald-400'>{totalCollected} ETH</span>
          </h2>
        </div>
        <RealtimeIndicator
          realtime={realtime}
          className='-top-4 right-3'
        />
      </div>
      <div className='ring ring-input rounded-md max-h-[400px] overflow-y-auto'>
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
  // console.log("Donation:", donation)
  const { onOpen } = useModal()
  return (
    <div
      className={cn('flex items-center justify-between gap-2 py-3 pr-4 px-2 hover:bg-accent cursor-pointer', !isLastItem && 'border-b border-accent')}
      onClick={() => onOpen('donationAction', { donation })}
    >
      <div className='flex gap-2 items-center'>
        <Avatar isAnonymousUser={donation?.donorUser?.isAnonymous} user={donation?.donorUser} />
        <div >
          <Link
            href={`/home/charities/${donation.charityId}`}
          >
            <p className='text-md'>
              {`${donation.txHash.substring(0, 8)}...${donation.txHash.substring(donation.txHash.length - 6, donation.txHash.length)}`}
              {/* {donation.senderWallet} */}
            </p>
          </Link>
          <p className='text-xs text-muted-foreground'>
            {format(donation.createdAt, 'dd.MM.yy HH:mm')}
          </p>
        </div>
      </div>
      <p className='text-emerald-500 dark:text-emerald-300'>
        {donation.amountEth} ETH
      </p>
    </div>
  )
}

function Avatar({ user, isAnonymousUser }) {
  // console.log("SenderAvatar:", user)
  return (
    <div className={cn(
      'min-w-8 min-h-8 w-8 h-8 max-w-8 max-h-8 lg:w-10 lg:h-10 lg:max-w-10 lg:max-h-10 rounded-full bg-accent flex items-center justify-center relative',
      !isAnonymousUser && user.verifiedLevel !== 0 && 'p-[4px] ring-1',
      {
        ' ring-yellow-300': !isAnonymousUser && user.verifiedLevel === 1,
        ' ring-green-300': !isAnonymousUser && user.verifiedLevel === 2,
        ' ring-blue-300': !isAnonymousUser && user.verifiedLevel === 3,
        ' ring-gray-300': !isAnonymousUser && user.verifiedLevel === 4,
      }
    )}>
      {isAnonymousUser ? (
        <div className='relative w-full h-full rounded-full bg-card flex items-center justify-center'>
          <UserIcon size={18} className='text-primary' />
          <FaQuestion className='absolute top-0.5 right-0.5 text-primary text-[8px]' />
        </div>
      ) : (
        <div className='relative w-full h-full rounded-full overflow-hidden bg-card flex items-center justify-center'>
          <img src={user?.image} alt={'user'} className='w-full h-full object-cover' />
        </div>
      )}
      {user.verifiedLevel === 4 && (
        <div className='absolute -top-1 -right-1 p-1 bg-gray-700 rounded-full'>
          <CheckIcon size={12} className='text-white' />
        </div>
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