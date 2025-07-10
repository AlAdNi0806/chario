// src/index.js
import { Hono } from 'hono'
import { ethers } from 'ethers'
import { streamSSE } from 'hono/streaming'
import { cors } from 'hono/cors'
import { prisma } from './db.js'
import { donationEmitter, emitNewDonation, emitNewCharity } from './events.js'
import getCurrentEthPrice from './ethPrice.js'
import abi from '../abi/chario.json'

const app = new Hono()

// Apply CORS globally to all routes
app.use('*', cors({
    origin: ['http://localhost:3000'], // Or '*' for all origins (not recommended for private APIs)
    allowMethods: ['GET'],
    allowHeaders: ['Content-Type'],
    maxAge: 600,
}))



async function setupBlockchainListeners() {
    const provider = new ethers.JsonRpcProvider('http://localhost:8545')
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    const contract = new ethers.Contract(contractAddress, abi, provider)

    contract.on('*', (event) => {
        console.log('--- Received ANY contract event ---');
        console.log('Event Name:', event.eventName);
        console.log('Event Args:', event.args.toObject());
        console.log('Transaction Hash:', event.log.transactionHash);
        console.log('Block Number:', event.log.blockNumber);
        console.log('---------------------------------');
    });

    contract.on('DonationReceived', async (charityId, donor, amount, userId, event) => {
        console.log("DONATION RECEIVED EVENT TRIGGERED!");
        try {
            const ethPrice = await getCurrentEthPrice();
            if (ethPrice === null) {
                console.warn("Could not fetch ETH price. USD calculation for donation skipped.");
            }

            const amountEth = ethers.formatEther(amount);
            const amountUsd = ethPrice ? (parseFloat(amountEth) * ethPrice).toString() : '0';

            console.log("Donation data:", {
                senderWallet: donor.toLowerCase(),
                amountEth: amountEth,
                amountUsd: amountUsd,
                txHash: event.log.transactionHash,
                charityId: charityId.toString(),
                userId: userId
            });


            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            const anonymousUser = await prisma.anonymousUser.findUnique({
                where: { id: userId }
            });
            let donationData = {
                senderWallet: donor.toLowerCase(),
                amountEth: amountEth,
                amountUsd: amountUsd,
                txHash: event.log.transactionHash,
                charityId: charityId.toString(),
            };


            if (user) {
                donationData.donorUserId = user.id;
                const currentAmount = parseFloat(user.amountSentInDollars || '0');
                const newAmount = parseFloat(amountUsd) + currentAmount;
                await prisma.user.update({
                    where: { id: user.id },
                    data: { amountSentInDollars: newAmount.toString() }
                });
            } else if (anonymousUser) {
                donationData.donorAnonymousUserId = anonymousUser.id;
                const currentAmount = parseFloat(anonymousUser.amountSentInDollars || '0');
                const newAmount = parseFloat(amountUsd) + currentAmount;
                await prisma.anonymousUser.update({
                    where: { id: anonymousUser.id },
                    data: { amountSentInDollars: newAmount.toString() }
                });
            } else {
                donationData.donorAnonymousUser = {
                    create: {
                        amountSentInDollars: amountUsd
                    }
                };
            }

            const donation = await prisma.donation.create({
                data: donationData,
                include: {
                    charity: true,
                    donorUser: true,
                    donorAnonymousUser: true
                }
            });

            emitNewDonation({
                charityId: charityId.toString(),
                donation
            });

            console.log(`Processed donation: ${amountEth} ETH from ${donor}`);
        } catch (error) {
            console.error('Error processing DonationReceived event:', error);
        }
    });

    contract.on('CharityCreated', async (charityId, ownerAddress, title, description, target, deadline, image, userId, event) => {
        console.log("CHARITY CREATED EVENT TRIGGERED!");
        try {
            const deadlineDate = deadline === 0n ? null : new Date(Number(deadline) * 1000);
            const targetAmount = target === 0n ? null : target.toString();

            const charity = await prisma.charity.create({
                data: {
                    id: charityId.toString(),
                    ownerWallet: ownerAddress,
                    title: title,
                    description: description,
                    target: targetAmount,
                    deadline: deadlineDate,
                    amountCollected: '0',
                    image: image,
                    status: 'ACTIVE',
                    owner: {
                        connect: {
                            id: userId
                        }
                    }
                },
                include: {
                    owner: true
                }
            });

            emitNewCharity({
                charityId: charityId.toString(),
                charity
            });

            console.log(`Processed charity creation: ${title}`);
        } catch (error) {
            console.error('Error processing CharityCreated event:', error);
        }
    });

    console.log('Blockchain event listeners registered.');
}

app.get('/sse/new-charities', async (c) => {
    return streamSSE(c, async (stream) => {

        const charityListener = (data) => {
            console.log("asdiofj pasodifjpo asidjf")
            stream.writeSSE({
                data: JSON.stringify({
                    type: 'new-charity',
                    charity: formatCharityForClient(data.charity)
                }),
                event: 'new-charity'
            });
        };

        donationEmitter.on('new-charity', charityListener);

        stream.onAbort(() => {
            donationEmitter.off('new-charity', charityListener);
            console.log('Disconnected from SSE')
        })

        while (true) {
            const message = `It is ${new Date().toISOString()}`
            await stream.writeSSE({
                data: message,
                event: 'time-update',
            })
            await stream.sleep(1000)
        }
    })
})

// Fixed SSE endpoint for charity donations
app.get('/sse/charities/:charityId/donations', async (c) => {
    const charityId = c.req.param('charityId');
    console.log("SSE for charity donations:", charityId)
    return streamSSE(c, async (stream) => {
        const donationListener = (data) => {
            console.log("asdiofj pasodifjpo asidjf")
            stream.writeSSE({
                data: JSON.stringify({
                    type: 'new-donation',
                    donation: data.donation
                }),
                event: 'new-donation'
            });
        };
        donationEmitter.on(`donation:${charityId}`, donationListener);
        stream.onAbort(() => {
            donationEmitter.off(`donation:${charityId}`, donationListener);
            console.log('Disconnected from SSE')
        })
        while (true) {
            const message = `It is ${new Date().toISOString()}`
            await stream.writeSSE({
                data: message,
                event: 'time-update',
            })
            await stream.sleep(1000)
        }
    })
})

function formatDonationForClient(donation) {
    return {
        id: donation.id,
        amountEth: donation.amountEth,
        amountUsd: donation.amountUsd,
        txHash: donation.txHash,
        createdAt: donation.createdAt,
        senderWallet: donation.senderWallet,
        donor: donation.donorUser
            ? {
                type: 'user',
                id: donation.donorUser.id,
                name: donation.donorUser.name,
                image: donation.donorUser.image
            }
            : {
                type: 'anonymous',
                id: donation.donorAnonymousUser?.id || donation.senderWallet
            }
    }
}

function formatCharityForClient(charity) {
    return {
        id: charity.id,
        ownerWallet: charity.ownerWallet,
        title: charity.title,
        description: charity.description,
        target: charity.target,
        deadline: charity.deadline,
        amountCollected: charity.amountCollected,
        image: charity.image,
        status: charity.status,
        createdAt: charity.createdAt,
        updatedAt: charity.updatedAt,
        owner: charity.owner ? {
            id: charity.owner.id,
            name: charity.owner.name,
            email: charity.owner.email,
            image: charity.owner.image
        } : null
    }
}

async function startApp() {
    await setupBlockchainListeners()

    const port = 3001
    Bun.serve({
        fetch: app.fetch,
        port,
    })

    console.log(`Hono server running on http://localhost:${port}`)
}

startApp().catch(console.error)