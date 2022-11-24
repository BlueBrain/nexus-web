import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
declare const _default: import('react-redux').ConnectedComponent<
  React.FunctionComponent<{
    resource: Resource<{
      [key: string]: any;
    }>;
    editable: boolean;
    refreshResource: () => void;
    goToView: (
      orgLabel: string,
      projectLabel: string,
      viewId: string,
      viewType: string | string[]
    ) => void;
    goToResource: (
      orgLabel: string,
      projectLabel: string,
      resourceId: string,
      revision: number
    ) => void;
  }>,
  Pick<
    {
      resource: Resource<{
        [key: string]: any;
      }>;
      editable: boolean;
      refreshResource: () => void;
      goToView: (
        orgLabel: string,
        projectLabel: string,
        viewId: string,
        viewType: string | string[]
      ) => void;
      goToResource: (
        orgLabel: string,
        projectLabel: string,
        resourceId: string,
        revision: number
      ) => void;
    },
    'resource' | 'editable' | 'refreshResource'
  > &
    import('react-redux').ConnectProps
>;
export default _default;
