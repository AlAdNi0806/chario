// Function to convert a Uint8Array to a Base64 URL encoded string
function base64URLEncode(buffer) {
    const base64 = btoa(String.fromCharCode.apply(null, buffer));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Function to convert a Base64 URL encoded string back to a Uint8Array
function base64URLDecode(base64URL) {
    let base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
        base64 += '=';
    }
    const binaryString = atob(base64);
    return Uint8Array.from(binaryString, c => c.charCodeAt(0));
}

/**
 * Encodes an integer into a compact Base64 URL safe string.
 * This function handles integers up to 2^53 - 1 safely in JavaScript (Number.MAX_SAFE_INTEGER).
 * For larger integers, consider using BigInt and a more robust byte conversion.
 * @param {number} integer The integer to encode.
 * @returns {string} The Base64 URL encoded string.
 */
export function maskId(integer) {
    if (!Number.isInteger(integer) || integer < 0) {
        throw new Error("Input must be a non-negative integer.");
    }

    const byteLength = Math.ceil(Math.log2(integer + 1) / 8) || 1; // Calculate minimum bytes needed, at least 1 for 0
    const buffer = new Uint8Array(byteLength);

    for (let i = 0; i < byteLength; i++) {
        buffer[byteLength - 1 - i] = (integer >> (8 * i)) & 0xFF;
    }

    return base64URLEncode(buffer);
}

/**
 * Decodes a Base64 URL safe string back into an integer.
 * @param {string} encodedString The Base64 URL encoded string.
 * @returns {number} The decoded integer.
 */
export function unmaskId(encodedString) {
    const buffer = base64URLDecode(encodedString);
    let integer = 0;

    for (let i = 0; i < buffer.length; i++) {
        integer = (integer << 8) | buffer[i];
    }

    return integer;
}