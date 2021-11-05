import * as React from 'react';
import ResourceViewContainer from '../containers/ResourceViewContainer';

const ResourceView: React.FunctionComponent = props => {
  return (
    <div className="resource-view view-container">
      <ResourceViewContainer />
    </div>
  );
};

export default ResourceView;
