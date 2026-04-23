# AGENTS.md

Repository guidance for coding agents working on this tutorial project.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project uses Next.js 16.2.x. APIs, defaults, and build behavior may differ
from older examples. Read local or official Next.js 16 docs before changing app
router, config, server route, or build behavior. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Overview

- Repo: `CodeByNikolas/nextjs-tailwind`
- App type: Next.js App Router + Tailwind CSS tutorial app.
- Package manager: `pnpm`.
- Main purpose: staged hackathon tutorial showing:
  - a basic animated Next.js/Vercel page,
  - a Supabase-backed public comment wall,
  - a Sepolia ERC-20 smart-contract integration.
- Current production branch: `main`.

## Branch Model

Branches intentionally represent tutorial checkpoints. Keep the staged history
clear so students can fork or reset to a known phase.

- `1-vercel-setup`
  - First checkpoint.
  - Contains the basic Next.js/Tailwind app and the animated centered text:
    `Tum Blockchain Club is the BEST`.
  - Should not contain Supabase or Web3 work.

- `2-supabase-db`
  - Second checkpoint.
  - Contains everything from `1-vercel-setup` plus Supabase comment support.
  - Adds the comment wall, `/api/comments`, Supabase server client, and
    `supabase/schema.sql`.
  - Should not contain Web3/Hardhat/ERC-20 work.

- `3-web3-integration`
  - Third checkpoint.
  - Contains everything from `2-supabase-db` plus Hardhat/OpenZeppelin/wagmi/viem
    ERC-20 integration.
  - Includes the deployed Sepolia token address.
  - Should match `main` after Phase 4 work is complete.

- `main`
  - Current final tutorial state.
  - Should match `3-web3-integration` unless a later phase is intentionally being
    prepared.

When asked to apply a fix to the current final app, update both `main` and
`3-web3-integration`. Do not move earlier checkpoint branches forward unless the
user explicitly asks to update that checkpoint.

## Important Paths

- `src/app/page.tsx`: homepage composition.
- `src/app/components/comment-wall.tsx`: Supabase public comments UI.
- `src/app/components/token-panel.tsx`: ERC-20 read/write UI.
- `src/app/components/web3-providers.tsx`: wagmi and TanStack Query providers.
- `src/app/api/comments/route.ts`: server route that protects Supabase secret key.
- `src/lib/supabase/server.ts`: server-only Supabase client.
- `src/lib/web3/config.ts`: wagmi/Sepolia configuration.
- `src/lib/web3/token.ts`: ERC-20 ABI and deployed token address fallback.
- `contracts/TumToken.sol`: OpenZeppelin ERC-20 demo contract.
- `hardhat.config.ts`: Hardhat 3 configuration.
- `ignition/modules/TumToken.ts`: Hardhat Ignition deployment module.
- `supabase/schema.sql`: SQL needed for the comments table.
- `.env.example`: public template of required env vars; must not contain secrets.
- `.env.local`: local secrets only; ignored by Git.

## Commands

Use `pnpm` consistently.

```sh
pnpm dev
pnpm lint
pnpm build
pnpm contracts:compile
pnpm contracts:deploy
pnpm contracts:deploy:local
```

Recommended verification before committing frontend changes:

```sh
pnpm lint
pnpm build
```

Recommended verification before committing contract/Web3 changes:

```sh
pnpm lint
pnpm build
pnpm contracts:compile
```

Use `pnpm contracts:deploy` only when a Sepolia RPC URL and funded deployer
wallet are configured locally.

## Environment Variables

Local development uses `.env.local`. Vercel environment variables must be set in
the Vercel dashboard.

Required for Supabase comments:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

Required for the Web3 frontend:

```env
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=
NEXT_PUBLIC_ERC20_ADDRESS=0xDeA747134aD4bE420219107eBD48474776fA0de7
```

Required only for local contract deployment:

```env
SEPOLIA_RPC_URL=
DEPLOYER_PRIVATE_KEY=
ETHERSCAN_API_KEY=
```

Security rules:

- Never commit `.env.local`.
- Never expose `DEPLOYER_PRIVATE_KEY`.
- Never expose `SUPABASE_SECRET_KEY` to client components.
- Only variables prefixed with `NEXT_PUBLIC_` may be read by browser code.
- Treat any private key pasted into chat or documentation as testnet-only and
  public.

## Supabase Notes

The comment wall uses a server route, not direct browser access with the secret
key.

- Browser calls: `/api/comments`
- Server route uses: `SUPABASE_SECRET_KEY`
- Required table: `public.comments`
- Schema file: `supabase/schema.sql`

If comments fail with `COMMENTS_TABLE_MISSING`, run `supabase/schema.sql` in the
Supabase SQL editor or through a database connection.

Direct Supabase Postgres URLs may require IPv6. If direct DB connection fails
from a local environment, use the Supavisor pooler connection string from the
Supabase dashboard.

## Web3 Notes

Current deployed Sepolia ERC-20:

- Contract: `TumToken`
- Name: `TUM Blockchain Club Token`
- Symbol: `TUMBC`
- Address: `0xDeA747134aD4bE420219107eBD48474776fA0de7`
- Explorer:
  `https://sepolia.etherscan.io/address/0xDeA747134aD4bE420219107eBD48474776fA0de7`

The app currently uses:

- Hardhat 3 for compiling/deploying.
- Hardhat Ignition for deployment.
- OpenZeppelin Contracts for ERC-20.
- wagmi + viem for wallet and contract interaction.
- TanStack Query for wagmi query state.

The app intentionally does not currently use RainbowKit or Reown at runtime.
Earlier Reown AppKit integration caused a Vercel Turbopack resolution failure
through wagmi's optional Tempo connector dependency (`accounts`). The current
runtime wallet support uses wagmi's injected connector, which supports MetaMask
and other browser-injected wallets.

If adding WalletConnect/Reown/RainbowKit later, verify compatibility with
Next.js 16 Turbopack and run a Vercel build before merging.

## Wallet UX

The token panel checks for `window.ethereum` and EIP-6963 provider announcements.
If no injected wallet exists, the UI should show an install/open-wallet prompt
instead of surfacing raw wagmi errors like `Provider not found`.

On desktop, test with MetaMask installed and unlocked. On mobile, test in a
wallet browser or use a wallet flow that supports mobile.

## Vercel Deployment

Vercel should build the app only. Do not deploy contracts from Vercel.

Vercel build command:

```sh
pnpm build
```

Vercel env vars needed for the current app:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=
NEXT_PUBLIC_ERC20_ADDRESS=0xDeA747134aD4bE420219107eBD48474776fA0de7
```

Do not add `DEPLOYER_PRIVATE_KEY` to Vercel for this tutorial.

## Editing Guidance

- Prefer small, phase-scoped changes.
- Preserve the animated hero text unless the user explicitly asks to change it.
- Preserve Supabase comments when working on Web3.
- Preserve Web3 token reads/writes when working on comments or layout.
- Keep UI text concise and user-facing.
- Keep secrets out of Git.
- Update `.env.example` when introducing a new required env var.
- Update this file when branch roles, build commands, or major architecture
  decisions change.

## Git Workflow

- Check status before edits:

```sh
git status --short --branch
```

- Do not rewrite branch checkpoint history unless the user asks.
- For final-app fixes, commit on `3-web3-integration`, push it, fast-forward
  `main`, and push `main`.
- For phase-specific fixes, update only the relevant branch unless asked
  otherwise.
- Keep the working tree clean after commits.

## Known Caveats

- Hardhat may warn if running on an odd-numbered non-LTS Node.js version. Use an
  even LTS Node version for best compatibility.
- Next.js 16 uses Turbopack by default. Avoid adding webpack-only fixes unless
  the build is explicitly switched or tested.
- Generated Hardhat outputs (`artifacts`, `cache`, `ignition/deployments`) are
  ignored by Git.
