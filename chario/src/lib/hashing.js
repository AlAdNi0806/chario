

export function maskId(id) {
    const str = id.toString();
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        (_, p1) => String.fromCharCode('0x' + p1)
    )).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function unmaskId(encoded) {
    encoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const str = atob(encoded);
    return decodeURIComponent(str.split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
}
