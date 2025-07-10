// src/events.ts
import { EventEmitter } from 'events'

export const donationEmitter = new EventEmitter()

export function emitNewDonation(event) {
    donationEmitter.emit('donation', event)
    donationEmitter.emit(`donation:${event.charityId}`, event)
}

export function emitNewCharity(event) {
    // console.log("Emitting new charity event:", event); // For debugging
    donationEmitter.emit('new-charity', event)
}