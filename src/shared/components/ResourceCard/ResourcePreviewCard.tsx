import * as React from 'react';

import './ResourcePreviewCard.less';

const ResourcePreviewCard: React.FunctionComponent = ({ children }) => {
  return (
		<div className="resource-preview-card">
			{children}
		</div>
	);
}

export default ResourcePreviewCard;