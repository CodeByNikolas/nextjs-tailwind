import { createConfig, http, injected } from "wagmi";
import { sepolia } from "wagmi/chains";

export const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
export const supportedChains = [sepolia] as [typeof sepolia];

const transports = {
  [sepolia.id]: http(rpcUrl || undefined),
};

export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [injected()],
  ssr: true,
  transports,
});
