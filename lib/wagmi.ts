import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, baseSepolia } from "wagmi/chains";
import { http } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo";
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY;

export const wagmiConfig = getDefaultConfig({
  appName: "BaseShield",
  projectId,
  chains: [base, baseSepolia],
  transports: {
    [base.id]: alchemyKey
      ? http(`https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`)
      : http(),
    [baseSepolia.id]: alchemyKey
      ? http(`https://base-sepolia.g.alchemy.com/v2/${alchemyKey}`)
      : http(),
  },
  ssr: true,
});
