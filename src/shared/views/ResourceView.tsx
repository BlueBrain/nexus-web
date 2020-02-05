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
          <div ref={ref} className="graph-wrapper">
            <div
              className="fixed-minus-header"
              style={{
                width,
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
