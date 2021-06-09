import * as React from 'react';
import * as cytoscape from 'cytoscape';
// @ts-ignore
import * as fcose from 'cytoscape-fcose';

const ProjectGraph: React.FC<{}> = () => {
  const container = React.useRef<HTMLDivElement>(null);
  const graph = React.useRef<cytoscape.Core>();

  const elements = {
    nodes: [
      {
        data: { id: 'a' },
      },

      {
        data: { id: 'b' },
      },
    ],
    edges: [
      {
        data: { id: 'ab', source: 'a', target: 'b' },
      },
    ],
  };

  React.useEffect(() => {
    cytoscape.use(fcose);

    graph.current = cytoscape({
      elements,
      maxZoom: 1,
      wheelSensitivity: 0.2,
      container: container.current,
      layout: {
        name: 'fcose',
      },
    });

    return () => {
      if (graph.current) {
        graph.current.destroy();
      }
    };
  }, [container]);

  return (
    <div style={{ width: '50%', height: '100%' }}>
      <div
        style={{
          width: '100%',
          height: '400px',
        }}
        className="graph"
        ref={container}
      />
    </div>
  );
};

export default ProjectGraph;
