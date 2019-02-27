import * as React from 'react';
import './GraphVisualizer.less';
import graph from './Graph';
import { uuidv4 } from '../../utils';

interface GraphVisualizerProps {
  dotGraph: string;
}

const GraphVisualizer: React.FunctionComponent<
  GraphVisualizerProps
> = props => {
  const { dotGraph } = props;
  const canvasEl = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (canvasEl && canvasEl.current) {
      graph(dotGraph, canvasEl.current);
    }
  });

  return <div className="graph-visualizer" id={uuidv4()} ref={canvasEl} />;
};

export default GraphVisualizer;
