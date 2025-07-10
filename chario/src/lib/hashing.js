import Hashids from 'hashids'

const hashids = new Hashids('my-unique-salt', 10)

export function maskId(id) {
    return hashids.encode(id)
}

export function unmaskId(maskedId) {
    const decoded = hashids.decode(maskedId)
    // if (decoded.length === 0) throw new Error('Invalid ID')
    if (decoded.length === 0) return null
    return decoded[0]
}
