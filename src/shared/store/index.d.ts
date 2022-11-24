import { Store } from 'redux';
import { ThunkAction as ReduxThunkAction } from 'redux-thunk';
import { History } from 'history';
import { NexusClient } from '@bbp/nexus-sdk';
export declare type Services = {
  nexus: NexusClient;
};
export declare type ThunkAction = ReduxThunkAction<
  Promise<any>,
  object,
  Services,
  any
>;
export default function configureStore(
  history: History,
  {
    nexus,
  }: {
    nexus: NexusClient;
  },
  preloadedState?: any
): Store;
