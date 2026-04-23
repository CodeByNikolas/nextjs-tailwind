import { CommentWall } from "@/app/components/comment-wall";

export default function Home() {
  return (
    <div className="relative grid min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(34,211,238,0.34),transparent_30%),radial-gradient(circle_at_78%_72%,rgba(16,185,129,0.24),transparent_32%),linear-gradient(135deg,#050505_0%,#101113_48%,#071711_100%)]" />
      <div className="grid-pattern absolute inset-0 opacity-40" />
      <div className="glow-orbit absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/15" />

      <main className="relative z-10 grid min-h-screen place-items-center px-6 py-12">
        <section className="motion-card flex max-w-6xl flex-col items-center gap-8 text-center">
          <p className="eyebrow rounded-full border border-white/15 bg-white/8 px-5 py-2 text-sm font-bold uppercase text-cyan-100 shadow-[0_0_42px_rgba(45,212,191,0.18)] backdrop-blur">
            On-chain energy
          </p>
          <h1 className="kinetic-title text-balance text-6xl font-black leading-[0.92] text-white sm:text-8xl lg:text-9xl">
            Tum Blockchain Club is the BEST
          </h1>
          <div className="spark-line h-1 w-56 rounded-full bg-cyan-300" />
          <CommentWall />
        </section>
      </main>
    </div>
  );
}
