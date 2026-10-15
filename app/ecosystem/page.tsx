import Link from 'next/link';
import BotNetworkStatus from '@/components/BotNetworkStatus';

export const metadata = { title: 'BOT Chain integration' };

export default function EcosystemPage() {
  return (
    <main className="min-h-screen bg-[#07111f] px-5 py-16 text-white">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link href="/onboarding" className="text-cyan-300 underline">NexusPay</Link>
        <h1 className="text-4xl font-bold">Send on BOT Chain with a phone number</h1>
        <p className="text-lg leading-8 text-slate-300">Sign in to NexusPay, choose BOT Chain, and send to a registered phone number, email, or BOT wallet address. Check the payment’s confirmation and explorer receipt from your transaction history.</p>
        <BotNetworkStatus />
        <section className="rounded-2xl border border-white/15 p-6">
          <h2 className="text-xl font-semibold">Try a payment</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-slate-300">
            <li>Sign in or create your NexusPay account and set up an account password.</li>
            <li>Open Receive to get your address for the selected BOT network.</li>
            <li>Fund that address with the asset you want to send and native BOT for network fees. On testnet, use test assets only.</li>
            <li>Open Send, enter the recipient’s registered phone number and amount, and authorize with your NexusPay password.</li>
            <li>Wait for confirmation. Pending payments are not yet settled.</li>
          </ol>
        </section>
        <p className="leading-7 text-slate-300">NexusPay uses thirdweb’s SDK with BOT Chain’s bundler and a separate BOT smart account. Gas is paid in native BOT. Your BOT receive address can differ from your wallet address on other networks.</p>
        <div className="flex flex-wrap gap-5">
          <Link href="/crypto" className="rounded-full bg-cyan-600 px-6 py-3 font-semibold">Open payments</Link>
          <a href="https://faucet.botchain.ai" target="_blank" rel="noopener noreferrer" className="px-2 py-3 text-cyan-300 underline">Testnet faucet</a>
        </div>
      </div>
    </main>
  );
}
