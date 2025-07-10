/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            new URL('https://influential-violet-muskox.myfilebase.com/ipfs/**')
        ]
    },
};

export default nextConfig;
