import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import './ResourceCard.less';
declare const ResourceCardComponent: React.FunctionComponent<{
  resource: Resource;
  preview?: React.ReactNode;
  onClickCollapse?(): void;
  schemaLink?: React.FunctionComponent<{
    resource: Resource;
  }>;
}>;
export default ResourceCardComponent;
