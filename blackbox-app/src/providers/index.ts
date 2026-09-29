import { CircleFtpProvider } from './circleftp';
import { Provider } from './types';

export * from './types';

export const providers: Record<string, Provider> = {
  [CircleFtpProvider.id]: CircleFtpProvider,
};

export function getProvider(id: string): Provider {
  const provider = providers[id];
  if (!provider) throw new Error(`Provider ${id} not found`);
  return provider;
}

export function getAllProviders(): Provider[] {
  return Object.values(providers);
}
