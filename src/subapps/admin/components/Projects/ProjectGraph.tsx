import * as React from 'react';
import * as cytoscape from 'cytoscape';
// @ts-ignore
import * as avsdf from 'cytoscape-avsdf';

const GRAPH_STYLE: cytoscape.Stylesheet[] = [
  {
    selector: 'node',
    style: {
      label: 'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',
      backgroundColor: '#0083cb', // fusion-primary-color
      'text-wrap': 'wrap',
      color: '#333333', // fusion-primary-text-color
    },
  },
  {
    selector: 'edge',
    style: {
      label: 'data(name)',
      'curve-style': 'bezier',
      'font-size': '12px',
      'line-color': '#ac1d3b61', // fusion-visited-link-color
      color: '#333333', // fusion-primary-text-color
      'target-arrow-color': '#333333', // fusion-primary-text-color
      'target-arrow-shape': 'triangle',
    },
  },
  {
    selector: 'edge:selected',
    style: {
      'target-arrow-color': '#0070C9', // fusion-active-link-color
    },
  },
  {
    selector: 'node:selected',
    style: {
      'background-color': '#7cb4fa', // fusion-secondary-color
    },
  },
];

export type ElementNodeData = {
  label: string;
  isOrigin?: boolean;
  id: string;
};

const ProjectGraph: React.FC<{
  elements: any;
  viewType: (type?: string, data?: ElementNodeData) => void;
}> = ({ viewType, elements }) => {
  const container = React.useRef<HTMLDivElement>(null);
  const graph = React.useRef<cytoscape.Core>();

  React.useEffect(() => {
    cytoscape.use(avsdf);
    const cy = graph.current = cytoscape({
      elements,
      maxZoom: 1,
      wheelSensitivity: 0.2,
      container: container.current,
      layout: {
        // @ts-ignore
        name: 'avsdf',
        fit: true,
        nodeSeparation: 100,
      },
      style: GRAPH_STYLE,
    });

    return () => {
      if (graph.current) {
        graph.current.destroy();
      }
    };
  }, [elements]);

  React.useEffect(() => {
    if (!graph.current) {
      return;
    }
    graph.current.on('tap', 'node', (e: cytoscape.EventObject) => {
      viewType && viewType(e.target.id(), e.target.data());
      // change node's color here
    });

    return () => {
      if (!graph.current) {
        return;
      }
      graph.current.removeListener('tap');
    };
  });

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div
        style={{
          width: '100%',
          height: '1000px',
          backgroundColor: '#fff',
        }}
        className="graph"
        ref={container}
      />
    </div>
  );
};

export default ProjectGraph;