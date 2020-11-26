import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';

const ResultPreviewItemContainer: React.FC<{
  resource: Resource;
  defaultPreviewItemTemplate: string;
}> = ({ resource }) => {
  return (
    <div>
      <b>{resource['@id']}</b>
    </div>
  );
};

export default ResultPreviewItemContainer;
