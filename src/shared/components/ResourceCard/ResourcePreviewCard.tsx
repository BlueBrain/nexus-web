import './ResourcePreviewCard.scss';

import * as React from 'react';

const ResourcePreviewCard: React.FunctionComponent = ({ children }) => {
  return <div className="resource-preview-card">{children}</div>;
};

export default ResourcePreviewCard;
