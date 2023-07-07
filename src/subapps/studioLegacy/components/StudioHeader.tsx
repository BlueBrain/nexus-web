import { Resource } from '@bbp/nexus-sdk';
import * as React from 'react';

import './StudioHeader.less';

const StudioHeader: React.FC<{
  resource: Resource;
  markdownViewer: React.FC<{
    template: string;
    data: object;
  }>;
}> = ({ children, resource, markdownViewer: MarkdownViewer }) => {
  const { label, description } = resource;
  return (
    <div className="studio-header">
      <div>
        <h1 className="title" data-testid="studio-title">
          {label}
          <span>{children}</span>
        </h1>
        <div className="studio-edit">
          <div className="description-container">
            {' '}
            {description && (
              <MarkdownViewer template={description} data={resource} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioHeader;
