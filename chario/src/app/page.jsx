import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import ConnectWalletButton from "@/components/md/ConnectWalletButton";

export default function Home() {
  return (
    <div>
      <ConnectWalletButton
        showBalance={false}
        accountStatus="address"
        label="Connect"
      />
    </div>
  );
}
