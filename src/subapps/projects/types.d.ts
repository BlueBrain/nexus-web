import { Resource } from '@bbp/nexus-sdk';
export declare enum Status {
  toDo = 'not started',
  inProgress = 'in progress',
  blocked = 'blocked',
  done = 'done',
}
export declare type StepResource = Resource<{
  hasParent?: {
    '@id': string;
  };
  activityType?: string;
  name: string;
  _self: string;
  status: Status;
  description?: string;
  summary?: string;
  dueDate?: string;
  wasInformedBy?: {
    '@id': string;
  };
  used?: {
    '@id': string;
  };
  wasAssociatedWith?:
    | {
        '@id': string;
      }
    | {
        '@id': string;
      }[];
  contribution?: {
    agent: {
      '@id': string;
    };
  };
  positionX?: number;
  positionY?: number;
}>;
export declare type WorkflowStepMetadata = {
  name: string;
  activityType?: string;
  description: string;
  summary?: string;
  dueDate: string;
  status: Status;
  hasParent?: {
    '@id': string;
  };
  wasInformedBy?: {
    '@id': string;
  };
  'nxv:activities':
    | {
        '@id': string;
      }
    | {
        '@id': string;
      }[];
};
