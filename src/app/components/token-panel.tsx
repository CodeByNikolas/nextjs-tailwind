"use client";

import { FormEvent, useMemo, useState } from "react";
import { formatUnits, isAddress, parseUnits, zeroAddress, type Address } from "viem";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { sepolia } from "wagmi/chains";

import { tokenAbi, tokenAddress } from "@/lib/web3/token";

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatTokenAmount(value: bigint | undefined, decimals = 18) {
  if (value === undefined) {
    return "--";
  }

  const formatted = formatUnits(value, decimals);
  const [whole, fraction = ""] = formatted.split(".");
  const trimmedFraction = fraction.slice(0, 4).replace(/0+$/, "");

  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole;
}

export function TokenPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, error: connectError, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const {
    data: hash,
    error: writeError,
    isPending: isWriting,
    writeContract,
  } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });
  const [recipient, setRecipient] = useState("");
  const [transferAmount, setTransferAmount] = useState("1");
  const [formError, setFormError] = useState("");

  const contractAddress = tokenAddress ?? zeroAddress;
  const contractReady = tokenAddress !== undefined;
  const onSepolia = chainId === sepolia.id;
  const readsEnabled = contractReady;
  const walletReadsEnabled = contractReady && address !== undefined;

  const name = useReadContract({
    address: contractAddress,
    abi: tokenAbi,
    functionName: "name",
    query: { enabled: readsEnabled },
  });
  const symbol = useReadContract({
    address: contractAddress,
    abi: tokenAbi,
    functionName: "symbol",
    query: { enabled: readsEnabled },
  });
  const decimals = useReadContract({
    address: contractAddress,
    abi: tokenAbi,
    functionName: "decimals",
    query: { enabled: readsEnabled },
  });
  const totalSupply = useReadContract({
    address: contractAddress,
    abi: tokenAbi,
    functionName: "totalSupply",
    query: { enabled: readsEnabled },
  });
  const balance = useReadContract({
    address: contractAddress,
    abi: tokenAbi,
    functionName: "balanceOf",
    args: [address ?? zeroAddress],
    query: { enabled: walletReadsEnabled },
  });
  const hasClaimed = useReadContract({
    address: contractAddress,
    abi: tokenAbi,
    functionName: "hasClaimed",
    args: [address ?? zeroAddress],
    query: { enabled: walletReadsEnabled },
  });

  const tokenDecimals = typeof decimals.data === "number" ? decimals.data : 18;
  const txUrl = useMemo(
    () => (hash ? `https://sepolia.etherscan.io/tx/${hash}` : undefined),
    [hash],
  );

  function claimTokens() {
    setFormError("");

    if (!contractReady) {
      setFormError("Deploy the token and set NEXT_PUBLIC_ERC20_ADDRESS first.");
      return;
    }

    writeContract({
      address: contractAddress,
      abi: tokenAbi,
      functionName: "claim",
    });
  }

  function transferTokens(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!contractReady) {
      setFormError("Deploy the token and set NEXT_PUBLIC_ERC20_ADDRESS first.");
      return;
    }

    if (!isAddress(recipient)) {
      setFormError("Enter a valid recipient address.");
      return;
    }

    const amount = parseUnits(transferAmount || "0", tokenDecimals);
    if (amount <= 0n) {
      setFormError("Enter an amount greater than zero.");
      return;
    }

    writeContract({
      address: contractAddress,
      abi: tokenAbi,
      functionName: "transfer",
      args: [recipient as Address, amount],
    });
  }

  return (
    <section className="web3-panel w-full max-w-3xl border border-emerald-200/20 bg-[#06110d]/72 p-5 text-left shadow-[0_24px_100px_rgba(16,185,129,0.16)] backdrop-blur-xl sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-cyan-100/75">
            Phase 4 - Web3 integration
          </p>
          <h2 className="text-2xl font-black text-white">TUMBC token console</h2>
          <p className="mt-1 text-sm text-cyan-100/70">
            Read the ERC-20 token and write safe demo transactions on Sepolia.
          </p>
        </div>
        {isConnected ? (
          <button
            className="border border-white/15 px-4 py-2 text-sm font-bold text-cyan-50 transition hover:border-cyan-200/70"
            onClick={() => disconnect()}
            type="button"
          >
            {shortenAddress(address ?? "")}
          </button>
        ) : null}
      </div>

      {!isConnected ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {connectors.map((connector) => (
            <button
              className="border border-cyan-200/30 bg-cyan-200 px-4 py-3 text-sm font-black uppercase text-black transition hover:-translate-y-0.5 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isConnecting}
              key={connector.uid}
              onClick={() => connect({ connector })}
              type="button"
            >
              Connect {connector.name}
            </button>
          ))}
        </div>
      ) : null}

      {isConnected && !onSepolia ? (
        <button
          className="mt-3 w-full border border-amber-200/50 bg-amber-200 px-4 py-3 text-sm font-black uppercase text-black transition hover:bg-cyan-200 disabled:opacity-60"
          disabled={isSwitching}
          onClick={() => switchChain({ chainId: sepolia.id })}
          type="button"
        >
          Switch to Sepolia
        </button>
      ) : null}

      {!contractReady ? (
        <p className="mt-4 border border-dashed border-white/18 p-4 text-sm text-emerald-100/80">
          Token contract not configured yet. Deploy the contract, then set{" "}
          <span className="font-mono">NEXT_PUBLIC_ERC20_ADDRESS</span>.
        </p>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="border border-white/10 bg-white/[0.07] p-4">
          <p className="text-xs font-bold uppercase text-emerald-200/70">Name</p>
          <p className="mt-1 text-lg font-black text-white">{name.data ?? "--"}</p>
        </div>
        <div className="border border-white/10 bg-white/[0.07] p-4">
          <p className="text-xs font-bold uppercase text-emerald-200/70">Symbol</p>
          <p className="mt-1 text-lg font-black text-white">{symbol.data ?? "--"}</p>
        </div>
        <div className="border border-white/10 bg-white/[0.07] p-4">
          <p className="text-xs font-bold uppercase text-emerald-200/70">
            Total supply
          </p>
          <p className="mt-1 text-lg font-black text-white">
            {formatTokenAmount(totalSupply.data, tokenDecimals)}
          </p>
        </div>
        <div className="border border-white/10 bg-white/[0.07] p-4">
          <p className="text-xs font-bold uppercase text-emerald-200/70">
            Your balance
          </p>
          <p className="mt-1 text-lg font-black text-white">
            {formatTokenAmount(balance.data, tokenDecimals)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
        <button
          className="border border-emerald-200/50 bg-emerald-200 px-4 py-3 text-sm font-black uppercase text-black transition hover:-translate-y-0.5 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
          disabled={!isConnected || !onSepolia || !contractReady || isWriting || hasClaimed.data}
          onClick={claimTokens}
          type="button"
        >
          {hasClaimed.data ? "Claimed" : "Claim 100 TUMBC"}
        </button>

        <form className="grid gap-2 sm:grid-cols-[1fr_7rem_7rem]" onSubmit={transferTokens}>
          <label className="sr-only" htmlFor="recipient">
            Recipient address
          </label>
          <input
            className="border border-white/12 bg-white/10 px-3 py-3 text-sm text-white outline-none transition placeholder:text-cyan-100/35 focus:border-cyan-200/80"
            id="recipient"
            onChange={(event) => setRecipient(event.target.value)}
            placeholder="0x recipient"
            value={recipient}
          />
          <label className="sr-only" htmlFor="amount">
            Amount
          </label>
          <input
            className="border border-white/12 bg-white/10 px-3 py-3 text-sm text-white outline-none transition placeholder:text-cyan-100/35 focus:border-cyan-200/80"
            id="amount"
            min="0"
            onChange={(event) => setTransferAmount(event.target.value)}
            step="0.0001"
            type="number"
            value={transferAmount}
          />
          <button
            className="border border-cyan-200/50 bg-cyan-200 px-4 py-3 text-sm font-black uppercase text-black transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-55"
            disabled={!isConnected || !onSepolia || !contractReady || isWriting}
            type="submit"
          >
            Send
          </button>
        </form>
      </div>

      <div className="mt-4 space-y-2 text-sm text-cyan-100/80">
        {connectError ? <p>{connectError.message}</p> : null}
        {formError ? <p>{formError}</p> : null}
        {writeError ? <p>{writeError.message}</p> : null}
        {isWriting ? <p>Confirm the transaction in your wallet.</p> : null}
        {receipt.isLoading ? <p>Waiting for Sepolia confirmation...</p> : null}
        {receipt.isSuccess && txUrl ? (
          <a
            className="font-bold text-emerald-200 underline underline-offset-4"
            href={txUrl}
            rel="noreferrer"
            target="_blank"
          >
            Transaction confirmed on Sepolia
          </a>
        ) : null}
      </div>
    </section>
  );
}
