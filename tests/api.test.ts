import apiClient, { authUtils } from '../lib/api';
import { getApiBaseUrl } from '../lib/config';
import { AxiosError } from 'axios';
test('honors configured backend during SSR', () => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api';
  expect(getApiBaseUrl()).toBe('http://localhost:8000/api');
  expect(authUtils.getToken()).toBeNull();
});
test('a failed payment is sent once to the configured environment', async () => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api';
  const adapter = jest.fn(async (config) => { expect(config.baseURL).toBe('http://localhost:8000/api'); throw new AxiosError('Offline', 'ERR_NETWORK', config); });
  await expect(apiClient.post('/token/sendToken', { amount: '1.01' }, { adapter })).rejects.toThrow('Offline');
  expect(adapter).toHaveBeenCalledTimes(1);
});
afterAll(() => { delete process.env.NEXT_PUBLIC_API_URL; });
