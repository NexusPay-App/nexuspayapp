import { botPaymentLabel, type BotPayment } from '../lib/botchain';
test.each(['preparing', 'submitted', 'pending', 'review'] as const)('never presents %s as a confirmed payment', status => {
  expect(botPaymentLabel({ status } as BotPayment)).not.toBe('Payment confirmed');
});
test('only canonical confirmation produces the success label', () => {
  expect(botPaymentLabel({ status: 'confirmed' } as BotPayment)).toBe('Payment confirmed');
  expect(botPaymentLabel({ status: 'failed' } as BotPayment)).toBe('Payment failed');
});
