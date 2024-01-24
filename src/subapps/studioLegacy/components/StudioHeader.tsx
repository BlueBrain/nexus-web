import { Resource } from '@bbp/nexus-sdk/es';
import * as React from 'react';

import './StudioHeader.scss';

const StudioHeader: React.FC<{
  resource: Resource;
  markdownViewer: React.FC<{
    template: string;
    data: object;
  }>;
  children?: React.ReactNode;
}> = ({ children, resource, markdownViewer: MarkdownViewer }) => {
  const { label, description } = resource;
  return (
    <div className="studio-header">
      <div>
        <h1 className="title">
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
