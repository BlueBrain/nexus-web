import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
export declare const DATACART_KEY = 'NEXUS_DATACART';
declare const useDataCart: () => {
  addResourceToCart: (resource: Resource) => Promise<void>;
  addResourceCollectionToCart: (inputResources: Resource[]) => Promise<void>;
  emptyCart: () => Promise<void>;
  removeCartItem: (selfUrl: string) => Promise<void>;
  resources: Resource<{
    [key: string]: any;
  }>[];
  length: number;
};
export default useDataCart;
export declare type CartType = {
  addResourceToCart: (resource: Resource) => Promise<void>;
  addResourceCollectionToCart: (resources: Resource[]) => Promise<void>;
  emptyCart: () => Promise<void>;
  removeCartItem: (selfUrl: string) => Promise<void>;
  resources: Resource<{
    [key: string]: any;
  }>[];
  length: number;
};
export declare const CartContext: React.Context<Partial<CartType>>;
