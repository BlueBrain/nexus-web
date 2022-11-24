import { Resource } from '@bbp/nexus-sdk';
import * as React from 'react';
import './StudioHeader.less';
declare const StudioHeader: React.FC<{
  resource: Resource;
  markdownViewer: React.FC<{
    template: string;
    data: object;
  }>;
}>;
export default StudioHeader;
