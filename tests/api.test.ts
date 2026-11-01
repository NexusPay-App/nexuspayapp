import apiClient, { authUtils } from '../lib/api';
import { getApiBaseUrl } from '../lib/config';
import { AxiosError } from 'axios';
test('keeps cookie authentication on the same origin', () => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api';
  expect(getApiBaseUrl()).toBe('/api');
  expect(apiClient.defaults.withCredentials).toBe(true);
  expect(apiClient.defaults.headers['X-NexusPay-Request']).toBe('1');
});
test('a failed payment is sent once to the configured environment', async () => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api';
  const adapter = jest.fn(async (config) => { expect(config.baseURL).toBe('/api'); expect(config.headers.Authorization).toBeUndefined(); throw new AxiosError('Offline', 'ERR_NETWORK', config); });
  await expect(apiClient.post('/token/sendToken', { amount: '1.01' }, { adapter })).rejects.toThrow('Offline');
  expect(adapter).toHaveBeenCalledTimes(1);
});
afterAll(() => { delete process.env.NEXT_PUBLIC_API_URL; });
