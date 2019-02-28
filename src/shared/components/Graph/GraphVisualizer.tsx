import * as React from 'react';
import './GraphVisualizer.less';
import graph from './d3-graph';
import { uuidv4 } from '../../utils';
import { Empty } from 'antd';
import { Graph } from './Graph';

interface GraphVisualizerProps {
  dotGraph: string;
}

const GraphVisualizer: React.FunctionComponent<
  GraphVisualizerProps
> = props => {
  const { dotGraph } = props;
  const [graph, setGraph] = React.useState<Graph | null>(null);
  const canvasEl = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (canvasEl && canvasEl.current) {
      const newGraph = new Graph(dotGraph, canvasEl.current);
      newGraph.render();
      setGraph(newGraph);
    }
    return () => {
      if (graph) {
        graph.remove();
      }
    };
  }, [dotGraph, canvasEl]);

  return (
    <div className="graph-visualizer" id={uuidv4()} ref={canvasEl}>
      {!!graph && !!graph.error && (
        <Empty description={'This graph could not be processed'} />
      )}
    </div>
  );
};

export default GraphVisualizer;
