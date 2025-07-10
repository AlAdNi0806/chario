// src/ethPrice.js

let cachedEthPrice = null;
let lastFetchTime = 0; // Timestamp of the last successful fetch

const CACHE_DURATION = 3 * 1000; // 3 seconds in milliseconds

async function getCurrentEthPrice() {
    const currentTime = Date.now();

    // Check if the cached price is still valid
    if (cachedEthPrice !== null && (currentTime - lastFetchTime < CACHE_DURATION)) {
        // console.log('Returning cached ETH price');
        return cachedEthPrice;
    }

    // If cache is expired or not set, fetch a new price
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const ethPrice = data.ethereum.usd;

        // Update cache
        cachedEthPrice = ethPrice;
        lastFetchTime = currentTime;
        // console.log('Fetched new ETH price and cached it');

        return ethPrice;

    } catch (error) {
        console.error('Error fetching ETH price:', error);
        // If fetching fails, we can optionally return the old cached price
        // if it exists, to provide some value instead of always null.
        // Or, as per your original code, return null to signify failure.
        return null;
    }
}

export default getCurrentEthPrice;