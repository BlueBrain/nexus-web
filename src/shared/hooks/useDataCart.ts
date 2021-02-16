import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import * as localforage from 'localforage';
import { notification } from 'antd';
import { uuidv4 } from '../utils';

export const DATACART_KEY = 'NEXUS_DATACART';

const useDataCart = () => {
  const [resources, setResources] = React.useState<Resource[]>([]);
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

  const addResourceToCart = async (resource: Resource) => {
    const notificationKey = `${DATACART_KEY}-${resource._self}`;
    const item = await storage.getItem(resource._self);
    if (item) {
      return notification.info({
        key: notificationKey,
        message: "You've already put this resource in your data cart",
      });
    }
    await storage.setItem(resource._self, resource);
    await iterateThroughResource();
    notification.success({
      key: notificationKey,
      message: 'Put selected resource to your data cart.',
    });
  };

  const addResourceCollectionToCart = async (resources: Resource[]) => {
    await storage.setItem(uuidv4(), {
      collection: resources,
    });
    await iterateThroughResource();
    notification.info({
      message: 'Put selected items as a dataset to your data cart.',
    });
  };

  return {
    addResourceToCart,
    addResourceCollectionToCart,
    resources,
    length: resources.length,
  };
};

export default useDataCart;
