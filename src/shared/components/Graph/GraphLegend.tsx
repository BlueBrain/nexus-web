import './GraphLegend.scss';

import * as React from 'react';

const GraphLegend: React.FunctionComponent = () => (
  <div className="legend">
    <div>
      <span className="node -origin" />
      Origin
    </div>
    <div>
      <span className="node -external" />
      External Link
    </div>
    <div>
      <span className="node -internal" />
      Internal Link
    </div>
    <div>
      <span className="node -blank-node" />
      Blank Node
    </div>
  </div>
);

export default GraphLegend;
