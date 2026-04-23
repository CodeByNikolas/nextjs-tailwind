import { createAppKit } from "@reown/appkit/react";
import { sepolia } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createConfig, http } from "wagmi";
import { coinbaseWallet, injected, metaMask, walletConnect } from "wagmi/connectors";

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
export const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
export const supportedChains = [sepolia] as [typeof sepolia];

const transports = {
  [sepolia.id]: http(rpcUrl || undefined),
};

export const wagmiAdapter = projectId
  ? new WagmiAdapter({
      networks: supportedChains,
      projectId,
      ssr: true,
      transports,
    })
  : undefined;

export const wagmiConfig =
  wagmiAdapter?.wagmiConfig ??
  createConfig({
    chains: supportedChains,
    connectors: [
      injected(),
      metaMask(),
      coinbaseWallet({ appName: "TUM Blockchain Club" }),
      ...(projectId ? [walletConnect({ projectId })] : []),
    ],
    ssr: true,
    transports,
  });

let appKitReady = false;

export function ensureAppKit() {
  if (!projectId || !wagmiAdapter || appKitReady) {
    return;
  }

  createAppKit({
    adapters: [wagmiAdapter],
    networks: supportedChains,
    projectId,
    metadata: {
      name: "TUM Blockchain Club",
      description: "ERC-20 demo dApp for TUM Blockchain Club",
      url:
        typeof window === "undefined"
          ? "https://example.com"
          : window.location.origin,
      icons: ["https://avatars.githubusercontent.com/u/179229932"],
    },
    features: {
      analytics: false,
    },
  });

  appKitReady = true;
}
