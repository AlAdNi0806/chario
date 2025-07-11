import React from 'react';
import { prisma } from '@/db';
import CharitiesPage from './_components/charities-page';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function Page({ searchParams }) { // searchParams are passed by Next.js
  const search = (await searchParams)?.search?.trim();

  const where = search
    ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }
    : {};

  const charities = await prisma.charity.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { owner: true },
  });

  const charitiesForClient = charities.map(charity => ({
    ...charity,
    target: charity.target?.toString(),
    amountCollected: charity.amountCollected.toString(),
  }));

  console.log("Charities:", charities); // Log to confirm search is not used

  console.log("Charities fetched with search:", search, "Count:", charitiesForClient.length); // Log to confirm search is used

  return (
    <>
      {/* Pass the fetched charities to your client component */}
      <CharitiesPage charities={charitiesForClient} />
    </>
  );
}

export default Page;