import { Resource } from '@bbp/nexus-sdk';
import * as React from 'react';
import { convertMarkdownHandlebarStringWithData } from '../../../shared/utils/markdownTemplate';

import './StudioHeader.less';

const StudioHeader: React.FC<{
  resource: Resource;
}> = ({ children, resource }) => {
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
              <p
                className="description"
                dangerouslySetInnerHTML={{
                  __html: convertMarkdownHandlebarStringWithData(
                    description,
                    resource
                  ),
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioHeader;
