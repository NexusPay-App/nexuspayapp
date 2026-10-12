import { botPaymentLabel, botPaymentToSendResponse, botPaymentToMerchantResponse, botRequestKey, clearBotRequest, isBotNetwork, type BotPayment } from '../lib/botchain';

const payment = (overrides: Partial<BotPayment> = {}): BotPayment => ({
  id: 'payment-1',
  network: 'botchain-testnet',
  sender: '0x1111111111111111111111111111111111111111',
  recipient: '0x2222222222222222222222222222222222222222',
  amount: '1.5',
  tokenSymbol: 'USDT',
  status: 'pending',
  createdAt: '2026-10-09T00:00:00.000Z',
  ...overrides,
});

test('detects only the two BOT network ids', () => {
  expect(isBotNetwork('botchain')).toBe(true);
  expect(isBotNetwork('botchain-testnet')).toBe(true);
  expect(isBotNetwork('arbitrum')).toBe(false);
  expect(isBotNetwork('stellar')).toBe(false);
});

test('same payment details reuse one idempotency key; changed details get a new key', () => {
  const fingerprint = ['botchain-testnet', 'recipient@example.test', '1.5', 'USDT'];
  const first = botRequestKey('send', fingerprint);
  expect(botRequestKey('send', fingerprint)).toBe(first);
  expect(first).toMatch(/^[A-Za-z0-9_-]{16,100}$/);
  const changed = botRequestKey('send', ['botchain-testnet', 'recipient@example.test', '2', 'USDT']);
  expect(changed).not.toBe(first);
  clearBotRequest('send');
  expect(botRequestKey('send', fingerprint)).not.toBe(first);
  clearBotRequest('merchant');
});

test('send adapter never reports an unconfirmed payment as confirmed', () => {
  for (const status of ['preparing', 'submitted', 'pending', 'review'] as const) {
    const mapped = botPaymentToSendResponse(payment({ status }), 'recipient@example.test');
    expect(mapped.success).toBe(true);
    expect(mapped.data.botStatus).toBe(status);
    expect(mapped.data.transaction.status).not.toBe('confirmed');
    expect(mapped.message).not.toBe('Payment confirmed');
  }
  const confirmed = botPaymentToSendResponse(payment({ status: 'confirmed', transactionHash: '0xabc', explorerUrl: 'https://scan/tx/0xabc' }), 'recipient@example.test');
  expect(confirmed.data.botStatus).toBe('confirmed');
  expect(confirmed.data.transactionHash).toBe('0xabc');
  expect(confirmed.data.explorerUrl).toBe('https://scan/tx/0xabc');
});

test('merchant adapter surfaces the merchant id and operation hash while pending', () => {
  const mapped = botPaymentToMerchantResponse(payment({ merchantId: 'MERCH-1', userOpHash: '0xdead', status: 'pending' }), 'MERCH-2');
  expect(mapped.data.businessName).toBe('MERCH-1');
  expect(mapped.data.transactionHash).toBe('0xdead');
  expect(mapped.data.botStatus).toBe('pending');
  expect(mapped.message).toBe(botPaymentLabel(payment({ status: 'pending' })));
});

test('failed payment adapter reports failure, not success text', () => {
  const mapped = botPaymentToSendResponse(payment({ status: 'failed', failureReason: 'insufficient gas' }), 'recipient@example.test');
  expect(mapped.data.botStatus).toBe('failed');
  expect(mapped.message).toBe('Payment failed');
});
