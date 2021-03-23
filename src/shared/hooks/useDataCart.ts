import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import * as localforage from 'localforage';
import { notification } from 'antd';
import { uuidv4 } from '../utils';

export const DATACART_KEY = 'NEXUS_DATACART';

const useDataCart = () => {
  const [resources, setResources] = React.useState<Resource[]>([]);
  const [length, setLength] = React.useState<number>(0);
  React.useEffect(() => {
    setLength(resources.length);
  }, [resources]);

  const storage = React.useMemo(() => {
    return localforage.createInstance({
      name: DATACART_KEY,
    });
  }, []);

  React.useEffect(() => {
    iterateThroughResource();
  }, [storage]);

  const iterateThroughResource = async () => {
    const resources: Resource[] = [];
    await storage.iterate((value, key, iterationNumber) => {
      resources.push(value as Resource);
    });
    setResources(resources);
  };

  const emptyCart = async () => {
    await storage.clear();
    await iterateThroughResource();
    notification.success({
      message: 'Data cart is now empty',
    });
  };

  const addResourceToCart = async (resource: Resource) => {
    const notificationKey = `${DATACART_KEY}-${resource._self}`;
    const item = await storage.getItem(resource._self);
    if (item) {
      return notification.info({
        key: notificationKey,
        message: "You've already added this resource to your data cart",
      });
    }
    await storage.setItem(resource._self, resource);
    setResources([...resources, resource]);
    notification.success({
      key: notificationKey,
      message: 'Selected resource has been added to your data cart.',
    });
  };

  const removeCartItem = async (selfUrl: string) => {
    const notificationKey = `${DATACART_KEY}-${selfUrl}`;
    await storage.removeItem(selfUrl);
    await iterateThroughResource();
    notification.success({
      key: notificationKey,
      message: 'Resource removed',
    });
  };

  const addResourceCollectionToCart = async (resources: Resource[]) => {
    await storage.setItem(uuidv4(), {
      collection: resources,
    });
    await iterateThroughResource();
    notification.info({
      message: 'Selected items are added as a dataset to your data cart.',
    });
  };

  return {
    addResourceToCart,
    addResourceCollectionToCart,
    emptyCart,
    removeCartItem,
    resources,
    length,
  };
};

export default useDataCart;

export type CartType = {
  addResourceToCart: (resource: Resource) => Promise<void>;
  addResourceCollectionToCart: (resources: Resource[]) => Promise<void>;
  emptyCart: () => Promise<void>;
  removeCartItem: (selfUrl: string) => Promise<void>;
  resources: Resource<{
    [key: string]: any;
  }>[];
  length: number;
};
export const CartContext = React.createContext<Partial<CartType>>({});
