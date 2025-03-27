import { ExternalProvider } from 'web3';

declare global {
  interface Window {
    ethereum?: {
      request: (request: { method: string }) => Promise<any>;
      isMetaMask?: boolean;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
    } & ExternalProvider;
  }
}

export {};