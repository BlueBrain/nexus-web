import * as React from 'react';

import GraphContainer from '../containers/GraphContainer';
import useMeasure from '../hooks/useMeasure';
import ResourceViewContainer from '../containers/ResourceViewContainer';

const ResourceView: React.FunctionComponent = props => {
  const [{ ref }, { width }] = useMeasure();

  return (
    <div className="resource-view view-container -unconstrained-width">
      <ResourceViewContainer
        render={resource => (
          <div
            ref={ref}
            className="graph-wrapper"
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
            }}
          >
            <div
              style={{
                width,
                position: 'fixed',
                height: '100%',
                maxHeight: 'calc(100vh - 40px)',
              }}
            >
              {resource && <GraphContainer resource={resource} />}
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default ResourceView;
