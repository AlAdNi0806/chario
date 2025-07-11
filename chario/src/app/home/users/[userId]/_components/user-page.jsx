'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import Link from 'next/link'
import CharityCardMd from '@/components/md/charity-card-md'
import {
  CalendarDays,
  Heart,
  HandHeart,
  Wallet,
  ExternalLink,
  CheckCircle,
  Mail,
  User
} from 'lucide-react'

function UserPage({ user: rawUser }) {
  const [user, setUser] = React.useState();

  React.useEffect(() => {
    // Parse user once and set the state
    if (rawUser) {
      setUser(JSON.parse(rawUser));
    }
  }, [rawUser]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user profile...</p>
        </div>
      </div>
    )
  }

  const totalDonated = user.Donations?.reduce((sum, donation) =>
    sum + parseFloat(donation.amountEth), 0
  ) || 0;

  const totalCharities = user.Charities?.length || 0;
  const totalRaised = user.Charities?.reduce((sum, charity) =>
    sum + parseFloat(charity.amountCollected), 0
  ) || 0;

  return (
    <div className='p-2 md:p-6 lg:p-8 pt-10 max-w-7xl mx-auto'>
      {/* User Header */}
      <div className='mb-8'>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
          <CardContent className="relative p-8">
            <div className='flex flex-col md:flex-row items-start md:items-center gap-6'>
              <UserAvatar user={user} size="large" />
              <div className='flex-1'>
                <div className='flex flex-col md:flex-row md:items-center gap-4 mb-4'>
                  <h1 className='text-3xl font-bold text-foreground'>{user.name}</h1>
                  <div className='flex gap-2'>
                    <VerificationBadge level={user.verifiedLevel} />
                    {user.emailVerified && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified Email
                      </Badge>
                    )}
                  </div>
                </div>
                <div className='flex flex-wrap gap-4 text-sm text-muted-foreground mb-4'>
                  <div className='flex items-center gap-1'>
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>
                  <div className='flex items-center gap-1'>
                    <CalendarDays className="w-4 h-4" />
                    Joined {format(new Date(user.createdAt), 'MMM yyyy')}
                  </div>
                </div>
                <UserStats
                  totalDonated={totalDonated}
                  totalCharities={totalCharities}
                  totalRaised={totalRaised}
                  donationsCount={user.Donations?.length || 0}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* User's Charities */}
        <div>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold flex items-center gap-2'>
              <HandHeart className="w-6 h-6 text-primary" />
              Charities Created ({totalCharities})
            </h2>
          </div>

          {user.Charities && user.Charities.length > 0 ? (
            <div className='grid gap-4'>
              {user.Charities.slice(0, 3).map((charity) => (
                <CharityCardMd
                  key={charity.id}
                  charity={{
                    id: charity.id,
                    title: charity.title,
                    description: charity.description,
                    target: charity.target?.toString() || '0',
                    amountCollected: charity.amountCollected?.toString() || '0',
                    image: charity.image,
                    deadline: charity.deadline
                  }}
                  className="max-w-none"
                />
              ))}
              {user.Charities.length > 3 && (
                <Link href={`/home/users/${user.id}/charities`}>
                  <Button variant="outline" className="w-full">
                    View All {user.Charities.length} Charities
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <HandHeart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No charities created yet</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* User's Donations */}
        <div>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold flex items-center gap-2'>
              <Heart className="w-6 h-6 text-primary" />
              Recent Donations ({user.Donations?.length || 0})
            </h2>
          </div>

          {user.Donations && user.Donations.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {user.Donations.slice(0, 10).map((donation, index) => (
                    <DonationItem
                      key={donation.id}
                      donation={donation}
                      isLast={index === Math.min(user.Donations.length - 1, 9)}
                    />
                  ))}
                </div>
                {user.Donations.length > 10 && (
                  <div className="p-4 border-t">
                    <Link href={`/home/users/${user.id}/donations`}>
                      <Button variant="outline" className="w-full">
                        View All {user.Donations.length} Donations
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No donations made yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper Components
function UserAvatar({ user, size = "default" }) {
  const sizeClasses = {
    default: "w-16 h-16",
    large: "w-24 h-24"
  };

  const ringClasses = {
    1: 'ring-yellow-300',
    2: 'ring-green-300',
    3: 'ring-blue-300',
    4: 'ring-purple-300'
  };

  return (
    <div className={cn(
      "rounded-full bg-accent flex items-center justify-center relative overflow-hidden",
      sizeClasses[size],
      user.verifiedLevel !== 0 && 'p-1 ring-2',
      ringClasses[user.verifiedLevel]
    )}>
      {user.image ? (
        <img
          src={user.image}
          alt={user.name}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <User className={cn(
          "text-muted-foreground",
          size === "large" ? "w-8 h-8" : "w-6 h-6"
        )} />
      )}
    </div>
  );
}

function VerificationBadge({ level }) {
  const badges = {
    0: null,
    1: { label: "Bronze", color: "bg-yellow-500" },
    2: { label: "Silver", color: "bg-gray-400" },
    3: { label: "Gold", color: "bg-yellow-400" },
    4: { label: "Platinum", color: "bg-purple-500" }
  };

  const badge = badges[level];
  if (!badge) return null;

  return (
    <Badge className={cn("text-white", badge.color)}>
      {badge.label} Verified
    </Badge>
  );
}

function UserStats({ totalDonated, totalCharities, totalRaised, donationsCount }) {
  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
      <div className='text-center p-3 bg-accent/50 rounded-lg'>
        <div className='text-2xl font-bold text-emerald-500'>
          {totalDonated.toFixed(3)}
        </div>
        <div className='text-xs text-muted-foreground'>ETH Donated</div>
      </div>
      <div className='text-center p-3 bg-accent/50 rounded-lg'>
        <div className='text-2xl font-bold text-blue-500'>
          {donationsCount}
        </div>
        <div className='text-xs text-muted-foreground'>Donations</div>
      </div>
      <div className='text-center p-3 bg-accent/50 rounded-lg'>
        <div className='text-2xl font-bold text-purple-500'>
          {totalCharities}
        </div>
        <div className='text-xs text-muted-foreground'>Charities</div>
      </div>
      <div className='text-center p-3 bg-accent/50 rounded-lg'>
        <div className='text-2xl font-bold text-orange-500'>
          {totalRaised.toFixed(3)}
        </div>
        <div className='text-xs text-muted-foreground'>ETH Raised</div>
      </div>
    </div>
  );
}

function DonationItem({ donation, isLast }) {
  return (
    <div className={cn(
      'flex items-center justify-between p-4 hover:bg-accent/50 transition-colors',
      !isLast && 'border-b border-border'
    )}>
      <div className='flex-1'>
        <div className='flex items-center gap-2 mb-1'>
          <Wallet className="w-4 h-4 text-muted-foreground" />
          <Link
            href={`/home/charities/${donation.charityId}`}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Transaction {donation.txHash.substring(0, 8)}...{donation.txHash.substring(donation.txHash.length - 6)}
          </Link>
        </div>
        <p className='text-xs text-muted-foreground'>
          {format(new Date(donation.createdAt), 'MMM dd, yyyy HH:mm')}
        </p>
      </div>
      <div className='text-right'>
        <div className='text-lg font-semibold text-emerald-500'>
          {donation.amountEth} ETH
        </div>
        <div className='text-xs text-muted-foreground'>
          ${parseFloat(donation.amountUsd).toFixed(2)}
        </div>
      </div>
    </div>
  );
}

export default UserPage