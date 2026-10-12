/** Remove unscoped balances written by earlier app versions. */
export function clearLegacyBalanceStorage() {
  if (typeof window === 'undefined') return;
  try {
    const keys = Object.keys(localStorage).filter(key => key === 'nexuspay_recent_transactions' || key === 'nexuspay_balance_cache' || key.startsWith('nexuspay_chain_balance_'));
    keys.forEach(key => localStorage.removeItem(key));
  } catch { /* Storage may be unavailable. Balances remain in memory only. */ }
}
