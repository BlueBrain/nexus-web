import { Resource } from '@bbp/nexus-sdk/es';
import { notification } from 'antd';
import * as localforage from 'localforage';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';

import { RootState } from '../store/reducers';
import { distanceFromTopToDisplay } from './useNotification';

export const DATACART_KEY = 'NEXUS_DATACART';

const useDataCart = () => {
  const [resources, setResources] = React.useState<Resource[]>([]);
  const [length, setLength] = React.useState<number>(0);
  React.useEffect(() => {
    setLength(resources.length);
  }, [resources]);
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    stepId: string;
  }>(`/workflow/:orgLabel/:projectLabel`);
  const { apiEndpoint } = useSelector((state: RootState) => state.config);

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
    notification.success({ message: 'Data cart is now empty' });
  };

  const addResourceToCart = async (resource: Resource) => {
    const notificationKey = `${DATACART_KEY}-${resource._self}`;
    const item = await storage.getItem(resource._self);
    if (item) {
      return notification.info({
        key: notificationKey,
        message: "You've already added this resource to your data cart",
        top: distanceFromTopToDisplay,
      });
    }
    await storage.setItem(resource._self, resource);
    setResources([...resources, resource]);
    notification.success({
      key: notificationKey,
      message: 'Selected resource has been added to your data cart.',
      top: distanceFromTopToDisplay,
    });
  };

  const removeCartItem = async (selfUrl: string) => {
    const notificationKey = `${DATACART_KEY}-${selfUrl}`;
    await storage.removeItem(selfUrl);
    await iterateThroughResource();
    notification.success({
      key: notificationKey,
      message: 'Resource removed',
      top: distanceFromTopToDisplay,
    });
  };

  const addResourceCollectionToCart = async (inputResources: Resource[]) => {
    const uniqueResources: Resource[] = [];

    for (let i = 0; i < inputResources.length; i += 1) {
      const item = await storage.getItem(inputResources[i]._self);
      if (!item) {
        /* _project property may be missing and is required by data cart
         * therefore lets add it if missing */
        if (inputResources[i]._project === undefined && match) {
          if (match.params.projectLabel) {
            inputResources[
              i
            ]._project = `${apiEndpoint}/projects/${match.params.orgLabel}/${match.params.projectLabel}`;
          }
        }
        uniqueResources.push(inputResources[i]);
        await storage.setItem(inputResources[i]._self, inputResources[i]);
      }
    }

    setResources([...resources, ...uniqueResources]);
    notification.success({
      message: 'Selected resources have been added to your data cart.',
      top: distanceFromTopToDisplay,
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
