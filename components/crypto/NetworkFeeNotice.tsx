import Link from 'next/link';

export default function NetworkFeeNotice({ network }: { network: string }) {
  const names: Record<string, string> = { base: 'Base', arbitrum: 'Arbitrum', botchain: 'BOT Chain', 'botchain-testnet': 'BOT Chain Testnet' };
  if (!names[network]) return null;
  const bot = network.startsWith('botchain');
  return (
    <p className="rounded-lg border border-[#0795B0]/30 bg-[#0795B0]/5 p-3 text-sm leading-relaxed text-white/75">
      {network === 'botchain-testnet' ? 'Testnet: use test assets only. ' : 'Mainnet: real assets. '}
      You pay network fees in {bot ? 'BOT' : 'ETH'} on {names[network]}. Keep some in your {bot ? 'BOT ' : 'NexusPay '}wallet, even when sending stablecoins.{' '}
      <Link href="/receive" className="text-[#39BED3] underline underline-offset-2">Get your address</Link>.
    </p>
  );
}
