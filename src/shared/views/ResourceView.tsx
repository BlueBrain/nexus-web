import * as React from 'react';
import { useHistory } from 'react-router';
import { clsx } from 'clsx';
import ResourceViewContainer from '../containers/ResourceViewContainer';

const ResourceView: React.FunctionComponent = () => {
  const { location } = useHistory();
  const background = !!(location.state as any)?.background;
  return (
    <div
      className={clsx(
        'resource-view view-container',
        background && 'background'
      )}
    >
      <ResourceViewContainer />
    </div>
  );
};

export default ResourceView;
