import { ConnectButton } from '@rainbow-me/rainbowkit'
import React from 'react'
import '../../../node_modules/@rainbow-me/rainbowkit/dist/index.css';

function ConnectWalletButton(params) {
    return (
        <>
            <ConnectButton
                {...params}
            />
        </>
    )
}

export default ConnectWalletButton