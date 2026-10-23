import Link from 'next/link';

export default function BotChainFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0A0E0E] px-5 py-5 pb-24 text-xs text-white/45 sm:pb-5" aria-label="NexusPay ecosystem">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <p>NexusPay · Phone-number payments on <strong className="text-white">BOT Chain</strong></p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Ecosystem links">
          <a href="https://botchain.ai" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#39BED3]">BOT Chain website</a>
          <a href="https://scan.botchain.ai" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#39BED3]">BOT Chain explorer</a>
          <Link href="/ecosystem" className="transition-colors hover:text-[#39BED3]">Integration details</Link>
          <a href="https://x.com/NexusPayDeFi" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#39BED3]">NexusPay on X</a>
        </nav>
      </div>
    </footer>
  );
}
