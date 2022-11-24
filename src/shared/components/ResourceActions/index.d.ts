import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import './ResourceActions.less';
export declare type ActionType = {
  name: string;
  predicate: (resource: Resource) => Promise<boolean>;
  title: string;
  shortTitle: string;
  message?: React.ReactElement | string;
  icon: React.ReactElement | string;
  danger?: boolean;
};
declare const ResourceActions: React.FunctionComponent<{
  resource: Resource;
  actions: {
    [key: string]: () => void;
  };
  actionTypes: ActionType[];
}>;
export default ResourceActions;
