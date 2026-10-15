import Link from 'next/link';

export default function BotChainFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#07111f] px-5 py-6 pb-24 text-sm text-slate-300" aria-label="NexusPay ecosystem">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <p>NexusPay · Phone-number payments on <strong className="text-white">BOT Chain</strong></p>
        <nav className="flex flex-wrap gap-x-5 gap-y-3" aria-label="Ecosystem links">
          <a href="https://botchain.ai" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">BOT Chain website</a>
          <a href="https://scan.botchain.ai" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">BOT Chain explorer</a>
          <Link href="/ecosystem" className="underline underline-offset-4">Integration details</Link>
          <a href="https://x.com/NexusPayDeFi" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">NexusPay on X</a>
        </nav>
      </div>
    </footer>
  );
}
